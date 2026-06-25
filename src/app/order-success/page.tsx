import Link from "next/link";
import type Stripe from "stripe";
import FooterSocial from "@/src/components/FooterSocial";
import Nav from "@/src/components/Nav";
import {
  getLocaleFromSearchParams,
  getTranslations,
  withLang,
} from "@/src/lib/i18n";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{
    session_id?: string;
    lang?: string;
  }>;
};

const formatAmount = (amount: number | null, currency: string | null) => {
  if (amount == null || !Number.isFinite(amount)) return "—";
  const value = amount / 100;
  const code = (currency ?? "eur").toUpperCase();
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${code}`;
  }
};

async function fetchSession(
  sessionId: string
): Promise<Stripe.Checkout.Session | null> {
  if (!isStripeConfigured()) return null;
  try {
    const stripe = getStripe();
    return await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    console.error("[order-success] Failed to retrieve session:", err);
    return null;
  }
}

export default async function OrderSuccessPage({ searchParams }: PageProps) {
  const resolved = (await searchParams) ?? {};
  const locale = getLocaleFromSearchParams(resolved);
  const t = getTranslations(locale);
  const sessionId = typeof resolved.session_id === "string" ? resolved.session_id : "";

  const session = sessionId ? await fetchSession(sessionId) : null;

  const status = !session
    ? "not_found"
    : session.payment_status === "paid"
      ? "paid"
      : session.payment_status === "no_payment_required"
        ? "paid"
        : "pending";

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-white text-ink">
        <section className="page-x page-pb-16 mx-auto w-full min-w-0 max-w-2xl pt-12 sm:page-pb-20 sm:pt-16">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-8">
            {status === "paid" ? (
              <>
                <h1 className="text-[clamp(1.5rem,5vw,2rem)] font-semibold tracking-tight text-emerald-700">
                  {t.orderSuccess.title}
                </h1>
                <p className="mt-3 text-sm text-slate-600 sm:text-[15px]">
                  {t.orderSuccess.subtitle}
                </p>
                <dl className="mt-6 grid gap-3 text-sm sm:text-[15px]">
                  {session?.id ? (
                    <div className="flex flex-col gap-0.5">
                      <dt className="text-xs uppercase tracking-wide text-slate-500">
                        {t.orderSuccess.orderNumber}
                      </dt>
                      <dd className="break-all font-mono text-slate-800">
                        {session.id}
                      </dd>
                    </div>
                  ) : null}
                  {session?.amount_total != null ? (
                    <div className="flex flex-col gap-0.5">
                      <dt className="text-xs uppercase tracking-wide text-slate-500">
                        {t.orderSuccess.amount}
                      </dt>
                      <dd className="text-lg font-semibold text-slate-900">
                        {formatAmount(session.amount_total, session.currency)}
                      </dd>
                    </div>
                  ) : null}
                  {session?.customer_details?.email ? (
                    <div className="flex flex-col gap-0.5">
                      <dt className="text-xs uppercase tracking-wide text-slate-500">
                        {t.orderSuccess.email}
                      </dt>
                      <dd className="break-all text-slate-800">
                        {session.customer_details.email}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </>
            ) : status === "pending" ? (
              <>
                <h1 className="text-[clamp(1.5rem,5vw,2rem)] font-semibold tracking-tight text-slate-900">
                  {t.orderSuccess.pendingTitle}
                </h1>
                <p className="mt-3 text-sm text-slate-600 sm:text-[15px]">
                  {t.orderSuccess.pendingSubtitle}
                </p>
              </>
            ) : (
              <>
                <h1 className="text-[clamp(1.5rem,5vw,2rem)] font-semibold tracking-tight text-slate-900">
                  {t.orderSuccess.notFoundTitle}
                </h1>
                <p className="mt-3 text-sm text-slate-600 sm:text-[15px]">
                  {t.orderSuccess.notFoundSubtitle}
                </p>
              </>
            )}

            <div className="mt-8">
              <Link
                href={withLang("/", locale)}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {t.orderSuccess.backHome}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <FooterSocial />
    </>
  );
}
