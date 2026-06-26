import { NextRequest, NextResponse } from "next/server";
import { CHECKOUT_SHIPPING_COUNTRIES } from "@/lib/checkout-shipping-countries";
import { getStripe } from "@/lib/stripe";
import { fetchProductBySlug } from "@/lib/products-server";
import { productMainImageUrl } from "@/lib/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckoutBody = {
  slug?: string;
  quantity?: number;
  locale?: "en" | "ru" | "it";
  /** If true (default), create an embedded session and return `clientSecret`. If false, hosted Checkout `url`. */
  embedded?: boolean;
};

// Stripe Checkout locales we support. We map our 3 site locales to Stripe's set.
// "ru" is not in the EU-focused default list; fall back to "auto".
const toStripeLocale = (locale: CheckoutBody["locale"]) => {
  if (locale === "it") return "it" as const;
  if (locale === "en") return "en" as const;
  return "auto" as const;
};

const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export async function POST(req: NextRequest) {
  let body: CheckoutBody = {};
  try {
    body = (await req.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const quantity =
    typeof body.quantity === "number" &&
    Number.isFinite(body.quantity) &&
    body.quantity > 0
      ? Math.min(Math.floor(body.quantity), 10)
      : 1;

  const product = await fetchProductBySlug(slug);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (product.price_on_request || product.price == null) {
    return NextResponse.json(
      { error: "This item is sold on request only" },
      { status: 400 }
    );
  }

  const rawPrice = Number(product.price);
  if (!Number.isFinite(rawPrice) || rawPrice <= 0) {
    return NextResponse.json({ error: "Invalid product price" }, { status: 400 });
  }

  // Apply discount (percentage 0-100) the same way productDisplayPrice does.
  const discountPercent = Math.max(0, Math.min(100, Number(product.discount ?? 0)));
  const finalPrice = rawPrice * (1 - discountPercent / 100);
  const unitAmount = Math.round(finalPrice * 100);
  if (unitAmount < 50) {
    // Stripe's minimum charge for EUR is roughly €0.50.
    return NextResponse.json(
      { error: "Price too low for online checkout" },
      { status: 400 }
    );
  }

  const mainImage = productMainImageUrl(product);

  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe not configured";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const origin = siteUrl();
  const localeParam = body.locale ?? "en";
  const useEmbedded = body.embedded !== false;

  const baseSession = {
    mode: "payment" as const,
    locale: toStripeLocale(body.locale),
    adaptive_pricing: { enabled: true },
    line_items: [
      {
        quantity,
        price_data: {
          currency: "eur",
          unit_amount: unitAmount,
          product_data: {
            name: product.title,
            description: product.description ?? undefined,
            images: mainImage ? [mainImage] : undefined,
            metadata: {
              product_id: product.id,
              slug: product.slug,
            },
          },
        },
      },
    ],
    shipping_address_collection: {
      allowed_countries: [...CHECKOUT_SHIPPING_COUNTRIES],
    },
    phone_number_collection: { enabled: true },
    billing_address_collection: "auto" as const,
    allow_promotion_codes: false,
    metadata: {
      product_id: product.id,
      slug: product.slug,
      quantity: String(quantity),
    },
  };

  try {
    const session = useEmbedded
      ? await stripe.checkout.sessions.create({
          ...baseSession,
          ui_mode: "embedded_page",
          // After successful payment, send the customer to your success page (still your domain).
          return_url: `${origin}/order-success?session_id={CHECKOUT_SESSION_ID}&lang=${encodeURIComponent(
            localeParam
          )}`,
          redirect_on_completion: "always",
        })
      : await stripe.checkout.sessions.create({
          ...baseSession,
          ui_mode: "hosted_page",
          success_url: `${origin}/order-success?session_id={CHECKOUT_SESSION_ID}&lang=${encodeURIComponent(
            localeParam
          )}`,
          cancel_url: `${origin}/products/${product.slug}`,
        });

    if (useEmbedded) {
      if (!session.client_secret) {
        return NextResponse.json(
          { error: "Checkout session missing client_secret" },
          { status: 500 }
        );
      }
      return NextResponse.json({
        clientSecret: session.client_secret,
        sessionId: session.id,
      });
    }

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err) {
    console.error("[api/checkout] Stripe error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
