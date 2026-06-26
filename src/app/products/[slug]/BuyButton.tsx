"use client";

import { loadStripe } from "@stripe/stripe-js";
import type { StripeEmbeddedCheckout } from "@stripe/stripe-js";
import { useEffect, useRef, useState, useTransition } from "react";
import type { Locale } from "@/src/lib/i18n";

const publishableKey =
  typeof process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY === "string"
    ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    : "";

type Props = {
  slug: string;
  locale: Locale;
  idleLabel: string;
  loadingLabel: string;
  errorLabel: string;
  closeLabel: string;
};

function ButtonSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className ?? ""}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default function BuyButton({
  slug,
  locale,
  idleLabel,
  loadingLabel,
  errorLabel,
  closeLabel,
}: Props) {
  const [, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const mountRef = useRef<HTMLDivElement>(null);
  const embeddedRef = useRef<StripeEmbeddedCheckout | null>(null);

  useEffect(() => {
    if (!clientSecret || !publishableKey) return;

    const el = mountRef.current;
    if (!el) return;

    let cancelled = false;

    void (async () => {
      try {
        const stripe = await loadStripe(publishableKey);
        if (!stripe || cancelled) return;
        const embedded = await stripe.createEmbeddedCheckoutPage({
          clientSecret,
        });
        if (cancelled) {
          embedded.destroy();
          return;
        }
        embeddedRef.current = embedded;
        embedded.mount(el);
      } catch (err) {
        console.error("[BuyButton] embedded checkout failed:", err);
        if (!cancelled) {
          setError(errorLabel);
          setClientSecret(null);
        }
      }
    })();

    return () => {
      cancelled = true;
      embeddedRef.current?.destroy();
      embeddedRef.current = null;
    };
    // Only (re)mount when the session secret changes — not on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientSecret]);

  const handleOpenCheckout = () => {
    if (submitting || clientSecret) return;
    if (!publishableKey.trim()) {
      setError(errorLabel);
      return;
    }

    setError(null);
    setSubmitting(true);

    startTransition(async () => {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, locale, embedded: true }),
        });

        const data = (await res.json().catch(() => ({}))) as {
          clientSecret?: string;
          error?: string;
        };

        if (!res.ok || !data.clientSecret) {
          setError(data.error || errorLabel);
          setSubmitting(false);
          return;
        }

        setClientSecret(data.clientSecret);
        setSubmitting(false);
      } catch (err) {
        console.error("[BuyButton] checkout request failed:", err);
        setError(errorLabel);
        setSubmitting(false);
      }
    });
  };

  const handleCloseCheckout = () => {
    embeddedRef.current?.destroy();
    embeddedRef.current = null;
    setClientSecret(null);
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 sm:min-w-[min(100%,300px)] sm:flex-1 sm:shrink-0">
      <button
        type="button"
        onClick={handleOpenCheckout}
        disabled={submitting || Boolean(clientSecret)}
        className="group inline-flex min-h-[48px] w-full min-w-0 items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-center text-sm font-semibold leading-snug text-white shadow-[0_2px_8px_rgba(15,23,42,0.2)] transition duration-200 hover:bg-slate-800 hover:shadow-[0_6px_24px_rgba(15,23,42,0.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-400 disabled:text-white/90 disabled:shadow-none disabled:active:scale-100"
      >
        {submitting ? (
          <>
            <ButtonSpinner className="h-[17px] w-[17px] text-white/90" />
            <span>{loadingLabel}</span>
          </>
        ) : (
          <span>{idleLabel}</span>
        )}
      </button>
      {error ? (
        <p role="alert" className="text-xs leading-relaxed text-red-600/90">
          {error}
        </p>
      ) : null}

      {clientSecret ? (
        <div className="relative mt-5 min-h-[min(520px,85vh)] w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
          <button
            type="button"
            onClick={handleCloseCheckout}
            className="absolute right-3 top-3 z-10 rounded-full border border-slate-200/90 bg-white/95 px-3.5 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-600 shadow-sm backdrop-blur-sm transition hover:border-slate-300 hover:bg-white hover:text-slate-900"
          >
            {closeLabel}
          </button>
          <div
            ref={mountRef}
            className="min-h-[min(520px,85vh)] w-full px-2 pb-4 pt-12 sm:px-4"
          />
        </div>
      ) : null}
    </div>
  );
}
