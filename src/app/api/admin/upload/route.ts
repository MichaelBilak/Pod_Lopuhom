import { NextResponse } from "next/server";
import { uploadBuffer } from "@/lib/cloudinary";

export const runtime = "nodejs";

const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: Request) {
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

    const urls: string[] = [];
    for (const file of toUpload) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mime = (file.type || "image/jpeg").toLowerCase().split(";")[0]?.trim() || "image/jpeg";
      const { secure_url } = await uploadBuffer(buffer, {
        folder: "mama-products",
        mime,
      });
      urls.push(secure_url);
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: "Upload failed." },
      { status: 500 }
    );
  }
}
