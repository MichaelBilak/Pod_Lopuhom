import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import {
  deleteProductImage,
  getProductImage,
  productImageExists,
  updateProductImagePosition,
} from "@/lib/supabase-products";
import {
  deleteSupabaseStorageObjectByUrl,
  isSupabaseStorageUrl,
} from "@/lib/supabase-storage";
import { deleteByUrl as deleteCloudinaryByUrl } from "@/lib/cloudinary";

export const runtime = "nodejs";

type Params = Promise<{ id: string; imageId: string }>;

const OBJECT_POSITION_REGEX = /^\d+(\.\d+)?% \d+(\.\d+)?%$/;

async function deleteImageBinaryByUrl(url: string): Promise<void> {
  try {
    if (isSupabaseStorageUrl(url)) {
      await deleteSupabaseStorageObjectByUrl(url);
      return;
    }
    if (url.includes("cloudinary.com")) {
      await deleteCloudinaryByUrl(url);
    }
  } catch (err) {
    // Storage delete is best-effort; DB row is already removed.
    console.warn("Image binary delete failed:", err);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Params }
) {
  const { imageId } = await params;
  let body: { objectPosition?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }
  const raw = typeof body?.objectPosition === "string" ? body.objectPosition.trim() : "";
  const objectPosition = raw && OBJECT_POSITION_REGEX.test(raw) ? raw : "50% 50%";
  try {
    const saved = await updateProductImagePosition(imageId, objectPosition);
    if (saved !== null) {
      revalidateTag("products");
      return NextResponse.json({ ok: true, objectPosition: saved });
    }
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
    revalidateTag("products");
    // Fire-and-forget binary cleanup so the client response isn't blocked.
    void deleteImageBinaryByUrl(image.image_url);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete image error:", error);
    return NextResponse.json(
      { message: "Failed to delete image." },
      { status: 500 }
    );
  }
}
