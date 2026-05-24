import "server-only";
import Stripe from "stripe";

let cached: Stripe | null = null;

/** Lazy Stripe client. Throws only if actually used without STRIPE_SECRET_KEY,
 * so the rest of the build / dev server keeps working without Stripe configured. */
export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env to enable Stripe Checkout."
    );
  }
  cached = new Stripe(key, {
    // Pin to the API version that ships with stripe@22.x to keep behavior
    // deterministic across SDK upgrades.
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
    appInfo: {
      name: "mama-next-site",
    },
  });
  return cached;
}

export const isStripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);
