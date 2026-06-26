import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import {
  createProduct,
  fetchProductsAdmin,
  addProductImage,
  fetchProductById,
  type ProductInsert,
} from "@/lib/supabase-products";
import { parseCollectionInput } from "@/src/lib/collections";
import { sanitizeProductDescriptionField } from "@/lib/product-description";

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

const CATEGORIES = ["Necklaces", "Rings", "Earrings", "Sets"];
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
    description: sanitizeProductDescriptionField(parseNullableString(payload.description)),
    description_ru: sanitizeProductDescriptionField(parseNullableString(payload.description_ru)),
    description_it: sanitizeProductDescriptionField(parseNullableString(payload.description_it)),
    price: parseNum(payload.price),
    discount: parseNum(payload.discount) ?? 0,
    category: parseCategory(payload.category),
    collection: parseCollectionInput(payload.collection),
    price_on_request: parseBool(payload.price_on_request),
    is_active: parseBool(payload.is_active),
    is_new: parseBool(payload.is_new),
    sort_order: parseNum(payload.sort_order) ?? 0,
  };
}

type CreateImageInput = {
  imageUrl: string;
  altText: string | null;
  objectPosition: string | null;
};

function parseCreateImages(payload: Record<string, unknown>): CreateImageInput[] {
  if (!Array.isArray(payload.images)) return [];
  return payload.images
    .map((raw) => {
      if (typeof raw === "string") {
        const imageUrl = raw.trim();
        if (!imageUrl) return null;
        return { imageUrl, altText: null, objectPosition: null } satisfies CreateImageInput;
      }
      if (!raw || typeof raw !== "object") return null;
      const obj = raw as Record<string, unknown>;
      const imageUrl =
        typeof obj.imageUrl === "string"
          ? obj.imageUrl.trim()
          : typeof obj.image_url === "string"
            ? obj.image_url.trim()
            : "";
      if (!imageUrl) return null;
      const altText =
        typeof obj.altText === "string"
          ? obj.altText.trim() || null
          : typeof obj.alt_text === "string"
            ? obj.alt_text.trim() || null
            : null;
      const objectPosition =
        typeof obj.objectPosition === "string"
          ? obj.objectPosition.trim() || null
          : typeof obj.object_position === "string"
            ? obj.object_position.trim() || null
            : null;
      return { imageUrl, altText, objectPosition } satisfies CreateImageInput;
    })
    .filter((item): item is CreateImageInput => item !== null);
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
    const images = parseCreateImages(payload);
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      await addProductImage(
        product.id,
        image.imageUrl,
        image.altText,
        i,
        image.objectPosition
      );
    }
    const full = await fetchProductById(product.id);
    revalidateTag("products");
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
