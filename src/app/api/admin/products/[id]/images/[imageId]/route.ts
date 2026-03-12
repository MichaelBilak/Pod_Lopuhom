import { NextResponse } from "next/server";
import {
  deleteProductImage,
  getProductImage,
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
    const ok = await updateProductImagePosition(imageId, objectPosition);
    if (!ok) {
      return NextResponse.json({ message: "Image not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
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
