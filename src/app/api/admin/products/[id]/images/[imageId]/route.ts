import { NextResponse } from "next/server";
import {
  deleteProductImage,
  getProductImage,
  productImageExists,
  updateProductImagePosition,
} from "@/lib/supabase-products";
import { deleteByUrl } from "@/lib/cloudinary";

export const runtime = "nodejs";

type Params = Promise<{ id: string; imageId: string }>;

const OBJECT_POSITION_REGEX = /^\d+(\.\d+)?% \d+(\.\d+)?%$/;

export async function PATCH(
  req: Request,
  { params }: { params: Params }
) {
  const { id: productId, imageId } = await params;
  let body: { objectPosition?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }
  const raw = typeof body?.objectPosition === "string" ? body.objectPosition.trim() : "";
  const objectPosition = raw && OBJECT_POSITION_REGEX.test(raw) ? raw : "50% 50%";
  try {
    // Update by imageId only (no product_id filter) to avoid mismatches
    const saved = await updateProductImagePosition(imageId, objectPosition);
    if (saved !== null) {
      return NextResponse.json({ ok: true, objectPosition: saved });
    }
    // Update failed: check if image row exists (by id only, so it works without object_position column)
    const imageExists = await productImageExists(imageId);
    if (!imageExists) {
      return NextResponse.json(
        {
          message:
            "Image not found. Click «Обновить товар», or check that .env (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) points to the same Supabase project as your data.",
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        message:
          "Could not save position. In Supabase → SQL Editor run: ALTER TABLE product_images ADD COLUMN IF NOT EXISTS object_position text DEFAULT '50% 50%';",
      },
      { status: 500 }
    );
  } catch {
    return NextResponse.json({ message: "Failed to update." }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Params }
) {
  const { imageId } = await params;
  try {
    const image = await getProductImage(imageId);
    if (!image) {
      return NextResponse.json(
        { message: "Image not found." },
        { status: 404 }
      );
    }
    const deleted = await deleteProductImage(imageId);
    if (!deleted) {
      return NextResponse.json(
        { message: "Image not found." },
        { status: 404 }
      );
    }
    await deleteByUrl(image.image_url);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete image." },
      { status: 500 }
    );
  }
}
