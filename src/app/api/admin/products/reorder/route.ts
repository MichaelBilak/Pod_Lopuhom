import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { reorderProducts } from "@/lib/supabase-products";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const payload = (await req.json().catch(() => null)) as
    | { ids?: unknown }
    | null;
  if (!payload || !Array.isArray(payload.ids)) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const ids = payload.ids.filter(
    (v): v is string => typeof v === "string" && v.length > 0
  );
  if (ids.length === 0) {
    return NextResponse.json({ message: "No ids provided." }, { status: 400 });
  }

  try {
    await reorderProducts(ids);
    revalidateTag("products");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin reorder products:", error);
    return NextResponse.json(
      { message: "Failed to reorder products." },
      { status: 500 }
    );
  }
}
