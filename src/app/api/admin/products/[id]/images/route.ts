import { NextResponse } from "next/server";
import {
  reorderProductImages,
  addProductImage,
} from "@/lib/supabase-products";

export const runtime = "nodejs";

type Params = Promise<{ id: string }>;

export async function POST(req: Request, { params }: { params: Params }) {
  const { id: productId } = await params;
  let body: { imageUrl?: string; altText?: string; sortOrder?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON." },
      { status: 400 }
    );
  }
  const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl.trim() : "";
  if (!imageUrl) {
    return NextResponse.json(
      { message: "imageUrl is required." },
      { status: 400 }
    );
  }
  const sortOrder = typeof body?.sortOrder === "number" ? body.sortOrder : 0;
  const altText = typeof body?.altText === "string" ? body.altText.trim() || null : null;
  try {
    const image = await addProductImage(productId, imageUrl, altText, sortOrder);
    return NextResponse.json({ image }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to add image." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: { params: Params }) {
  const { id: productId } = await params;
  let body: { imageIds?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON." },
      { status: 400 }
    );
  }
  const imageIds = Array.isArray(body?.imageIds)
    ? body.imageIds.filter((x) => typeof x === "string")
    : [];
  if (!imageIds.length) {
    return NextResponse.json(
      { message: "imageIds array required." },
      { status: 400 }
    );
  }
  try {
    await reorderProductImages(productId, imageIds);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to reorder images." },
      { status: 500 }
    );
  }
}
