import { NextResponse, type NextRequest } from "next/server";
import {
  createProduct,
  fetchProductsAdmin,
  addProductImage,
  fetchProductById,
  type ProductInsert,
} from "@/lib/supabase-products";

export const runtime = "nodejs";

const parseString = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const parseNum = (v: unknown): number | null => {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isNaN(n) ? null : n;
  }
  return null;
};
const parseBool = (v: unknown) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string")
    return ["true", "1", "on"].includes(v.trim().toLowerCase());
  return false;
};
const parseNullableString = (v: unknown) => {
  const s = parseString(v);
  return s || null;
};

const CATEGORIES = ["Rings", "Necklaces", "Earrings", "Sets"];
const parseCategory = (v: unknown) => {
  const s = parseString(v);
  return CATEGORIES.includes(s) ? s : "Rings";
};

function buildProductInsert(payload: Record<string, unknown>): ProductInsert | null {
  const title = parseString(payload.title);
  const slug = parseString(payload.slug);
  if (!title || !slug) return null;
  return {
    title,
    slug,
    description: parseNullableString(payload.description),
    price: parseNum(payload.price),
    discount: parseNum(payload.discount) ?? 0,
    materials: parseNullableString(payload.materials),
    category: parseCategory(payload.category),
    price_on_request: parseBool(payload.price_on_request),
    is_active: parseBool(payload.is_active),
    is_new: parseBool(payload.is_new),
    sort_order: parseNum(payload.sort_order) ?? 0,
  };
}

export async function GET() {
  try {
    const products = await fetchProductsAdmin();
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Admin GET products:", error);
    return NextResponse.json(
      { message: "Failed to fetch products." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const payload = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!payload) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const input = buildProductInsert(payload);
  if (!input) {
    return NextResponse.json(
      { message: "Title and slug are required." },
      { status: 400 }
    );
  }

  try {
    const product = await createProduct(input);
    const imageUrls = Array.isArray(payload.images)
      ? payload.images.filter((u): u is string => typeof u === "string" && u.trim().length > 0)
      : [];
    for (let i = 0; i < imageUrls.length; i++) {
      await addProductImage(product.id, imageUrls[i], null, i);
    }
    const full = await fetchProductById(product.id);
    return NextResponse.json({ product: full ?? product }, { status: 201 });
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === "23505") {
      return NextResponse.json(
        { message: "Slug already exists." },
        { status: 409 }
      );
    }
    console.error("Admin create product:", error);
    return NextResponse.json(
      { message: "Unable to create product." },
      { status: 500 }
    );
  }
}
