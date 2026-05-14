import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/** Server-side Supabase client. Use for admin and server-only data access.
 *
 * Prefers SUPABASE_SERVICE_ROLE_KEY (required for Storage writes / bypassing RLS).
 * Falls back to the publishable key for read-only flows when the service key
 * is not configured (e.g. local read-only inspection).
 */
export const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or Supabase key. " +
        "Set SUPABASE_SERVICE_ROLE_KEY (admin) and NEXT_PUBLIC_SUPABASE_URL in .env."
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
};

/** True when the server has the service-role key (needed for Storage uploads). */
export const hasSupabaseServiceRole = () =>
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
