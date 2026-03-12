import { NextResponse, type NextRequest } from "next/server";
import {
  updateProduct,
  deleteProduct,
  reorderProductImages,
  fetchProductById,
  type ProductUpdate,
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

function buildProductUpdate(payload: Record<string, unknown>): ProductUpdate | null {
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

type RouteParams = Promise<{ id: string }>;

export async function GET(_req: NextRequest, { params }: { params: RouteParams }) {
  const { id } = await params;
  try {
    const product = await fetchProductById(id);
    if (!product) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error) {
    console.error("Admin get product:", error);
    return NextResponse.json(
      { message: "Unable to load product." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: RouteParams }) {
  const { id } = await params;
  const payload = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!payload) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const input = buildProductUpdate(payload);
  if (!input) {
    return NextResponse.json(
      { message: "Title and slug are required." },
      { status: 400 }
    );
  }

  try {
    const product = await updateProduct(id, input);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }
    const imageIds = Array.isArray(payload.imageIds)
      ? payload.imageIds.filter((x): x is string => typeof x === "string")
      : [];
    if (imageIds.length > 0) {
      await reorderProductImages(id, imageIds);
    }
    const full = await fetchProductById(id);
    return NextResponse.json({ product: full ?? product });
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === "23505") {
      return NextResponse.json(
        { message: "Slug already exists." },
        { status: 409 }
      );
    }
    console.error("Admin update product:", error);
    return NextResponse.json(
      { message: "Unable to update product." },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: RouteParams }) {
  const { id } = await params;
  try {
    const deleted = await deleteProduct(id);
    if (!deleted) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin delete product:", error);
    return NextResponse.json(
      { message: "Unable to delete product." },
      { status: 500 }
    );
  }
}
