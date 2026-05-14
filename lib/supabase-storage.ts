import { getSupabaseAdmin } from "./supabase";

export const PRODUCT_IMAGES_BUCKET = "products";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function extFromMime(mime: string): string {
  return MIME_TO_EXT[mime.toLowerCase()] ?? "bin";
}

function generateObjectName(mime: string, prefix = "products"): string {
  const ext = extFromMime(mime);
  const random =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `${prefix}/${random}.${ext}`;
}

/** Upload a buffer to Supabase Storage; returns the public URL of the stored object. */
export async function uploadProductImage(
  buffer: Buffer,
  mime: string
): Promise<{ url: string; path: string }> {
  const supabase = getSupabaseAdmin();
  const path = generateObjectName(mime);
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, buffer, {
      contentType: mime,
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  const { data } = supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(path);

  return { url: data.publicUrl, path };
}

/** Check if a given URL points to this Supabase project's Storage. */
export function isSupabaseStorageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    if (!projectUrl) return false;
    const projectHost = new URL(projectUrl).host;
    return (
      parsed.host === projectHost && parsed.pathname.includes("/storage/v1/")
    );
  } catch {
    return false;
  }
}

/** Extract bucket and object path from a Supabase Storage public URL. */
export function parseSupabaseStorageUrl(
  url: string
): { bucket: string; path: string } | null {
  try {
    const parsed = new URL(url);
    // Public URL shape: /storage/v1/object/public/<bucket>/<path...>
    // Signed URL shape: /storage/v1/object/sign/<bucket>/<path...>
    const m = parsed.pathname.match(
      /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+)$/
    );
    if (!m) return null;
    const bucket = decodeURIComponent(m[1]);
    const path = decodeURIComponent(m[2]).split("?")[0];
    return { bucket, path };
  } catch {
    return null;
  }
}

/** Delete an object from Supabase Storage by its public URL. Returns true on success. */
export async function deleteSupabaseStorageObjectByUrl(
  url: string
): Promise<boolean> {
  const parsed = parseSupabaseStorageUrl(url);
  if (!parsed) return false;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from(parsed.bucket)
    .remove([parsed.path]);
  return !error;
}
