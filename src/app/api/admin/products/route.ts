import { NextResponse, type NextRequest } from "next/server";
import {
  createProduct,
  fetchProducts,
  type ProductInput,
} from "../../../../../lib/products";

export const runtime = "nodejs";

const parseString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const parseNullableString = (value: unknown) => {
  const parsed = parseString(value);
  return parsed ? parsed : null;
};

const parseBoolean = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "on";
  }
  return false;
};

const parseImages = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
};

const allowedCategories = ["Rings", "Necklaces", "Earrings", "Sets"];

const parseCategory = (value: unknown) => {
  const parsed = parseString(value);
  if (allowedCategories.includes(parsed)) return parsed;
  return "Rings";
};

const buildInput = (payload: Record<string, unknown>): ProductInput | null => {
  const slug = parseString(payload.slug);
  const title = parseString(payload.title);
  if (!slug || !title) return null;
  return {
    slug,
    title,
    category: parseCategory(payload.category),
    is_new: parseBoolean(payload.is_new),
    materials: parseNullableString(payload.materials),
    price: parseNullableString(payload.price),
    description: parseNullableString(payload.description),
    images: parseImages(payload.images),
  };
};

export async function GET() {
  const products = await fetchProducts();
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const payload = (await req.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!payload) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const input = buildInput(payload);
  if (!input) {
    return NextResponse.json(
      { message: "Title and slug are required." },
      { status: 400 }
    );
  }

  try {
    const product = await createProduct(input);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === "23505") {
      return NextResponse.json(
        { message: "Slug already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: "Unable to create product." },
      { status: 500 }
    );
  }
}
