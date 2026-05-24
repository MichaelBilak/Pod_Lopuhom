import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
// Webhook must read the raw request body to verify the signature — never cache.
export const dynamic = "force-dynamic";

type OrderInsert = {
  stripe_session_id: string;
  stripe_payment_intent_id: string | null;
  product_id: string | null;
  product_slug: string | null;
  quantity: number;
  amount_total: number;
  currency: string;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  shipping_address: unknown;
  status: string;
};

async function recordOrder(session: Stripe.Checkout.Session) {
  const productId = (session.metadata?.product_id as string | undefined) ?? null;
  const productSlug = (session.metadata?.slug as string | undefined) ?? null;
  const quantity = Number(session.metadata?.quantity ?? 1) || 1;

  const payload: OrderInsert = {
    stripe_session_id: session.id,
    stripe_payment_intent_id:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null,
    product_id: productId,
    product_slug: productSlug,
    quantity,
    amount_total: session.amount_total ?? 0,
    currency: session.currency ?? "eur",
    customer_email: session.customer_details?.email ?? null,
    customer_name: session.customer_details?.name ?? null,
    customer_phone: session.customer_details?.phone ?? null,
    shipping_address:
      // In the dahlia API the collected shipping address lives under
      // `collected_information.shipping_details`; fall back to billing address.
      session.collected_information?.shipping_details?.address ??
      session.customer_details?.address ??
      null,
    status: session.payment_status === "paid" ? "paid" : session.payment_status ?? "pending",
  };

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("orders")
      .upsert(payload as never, { onConflict: "stripe_session_id" });
    if (error) {
      console.error("[stripe/webhook] Failed to upsert order:", error);
    }
  } catch (err) {
    console.error("[stripe/webhook] Supabase insert threw:", err);
  }
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    return new NextResponse("Missing stripe-signature header", { status: 400 });
  }
  if (!secret) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET is not set");
    return new NextResponse("Webhook secret not configured", { status: 500 });
  }

  // Must be the raw body string, not the parsed JSON.
  const rawBody = await req.text();

  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    console.error("[stripe/webhook] Stripe not configured:", err);
    return new NextResponse("Stripe not configured", { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("[stripe/webhook] Signature verification failed:", message);
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      await recordOrder(session);
      break;
    }
    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.warn("[stripe/webhook] Async payment failed:", session.id);
      break;
    }
    default:
      // Ignore other events for now.
      break;
  }

  return NextResponse.json({ received: true });
}
