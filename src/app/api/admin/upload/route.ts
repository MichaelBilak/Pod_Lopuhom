import { NextResponse } from "next/server";
import { optimizeProductImage } from "@/lib/image-optimize";
import { uploadProductImage } from "@/lib/supabase-storage";
import { hasSupabaseServiceRole } from "@/lib/supabase";

export const runtime = "nodejs";

const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: Request) {
  if (!hasSupabaseServiceRole()) {
    return NextResponse.json(
      {
        message:
          "Server is missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env (Supabase Dashboard → Settings → API → service_role secret) and restart.",
      },
      { status: 500 }
    );
  }
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;
    const toUpload: File[] = files.length
      ? files.filter((f) => f instanceof File && f.size > 0)
      : singleFile && singleFile instanceof File && singleFile.size > 0
        ? [singleFile]
        : [];

    if (!toUpload.length) {
      return NextResponse.json(
        { message: "No files provided." },
        { status: 400 }
      );
    }

    for (const file of toUpload) {
      const mime = (file.type || "").toLowerCase().split(";")[0]?.trim();
      if (!mime || !ALLOWED_MIMES.has(mime)) {
        return NextResponse.json(
          { message: "Only image files (JPEG, PNG, WebP, GIF) are allowed." },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          { message: "File size must not exceed 10 MB." },
          { status: 400 }
        );
      }
    }

    const urls = await Promise.all(
      toUpload.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const inputBuffer = Buffer.from(bytes);
        const mime =
          (file.type || "image/jpeg").toLowerCase().split(";")[0]?.trim() ||
          "image/jpeg";
        const optimized = await optimizeProductImage(inputBuffer, mime);
        const { url } = await uploadProductImage(
          optimized.buffer,
          optimized.mime
        );
        return url;
      })
    );

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("Upload error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Upload failed. Check that the 'products' Storage bucket exists in Supabase.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
