import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Diagnostic endpoint: returns raw counts/samples from the products table
 * without any caching, so we can see if the issue is in the data layer
 * (DB unreachable, empty result, missing column) versus the rendering layer.
 *
 * Public on purpose so we can fetch it from the browser to debug a live
 * deploy. Returns only counts and the first 5 IDs — no sensitive data.
 */
export async function GET() {
  const start = Date.now();
  try {
    const supabase = getSupabaseAdmin();
    const all = await supabase.from("products").select("id, is_active");
    const active = await supabase
      .from("products")
      .select("id, slug, title, sort_order, is_active")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(5);

    return NextResponse.json(
      {
        ok: true,
        elapsed_ms: Date.now() - start,
        env: {
          has_supabase_url: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
          has_service_role_key: Boolean(
            process.env.SUPABASE_SERVICE_ROLE_KEY
          ),
          has_publishable_key: Boolean(
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
          ),
        },
        all: {
          error: all.error?.message ?? null,
          total: all.data?.length ?? null,
          active_count:
            (all.data as Array<{ is_active: boolean }> | null)?.filter(
              (r) => r.is_active
            ).length ?? null,
        },
        active_sample: {
          error: active.error?.message ?? null,
          rows: active.data ?? null,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        elapsed_ms: Date.now() - start,
        env: {
          has_supabase_url: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
          has_service_role_key: Boolean(
            process.env.SUPABASE_SERVICE_ROLE_KEY
          ),
          has_publishable_key: Boolean(
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
          ),
        },
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
