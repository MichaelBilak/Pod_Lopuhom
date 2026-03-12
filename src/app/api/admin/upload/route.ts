import { NextResponse } from "next/server";
import { uploadBuffer } from "@/lib/cloudinary";

export const runtime = "nodejs";

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

    const urls: string[] = [];
    for (const file of toUpload) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mime = file.type || "image/jpeg";
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
