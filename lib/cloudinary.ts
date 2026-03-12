import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

export function isCloudinaryConfigured() {
  return Boolean(cloudName && apiKey && apiSecret);
}

export function getCloudinaryConfig() {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET."
    );
  }
  return { cloudName, apiKey, apiSecret };
}

export function configureCloudinary() {
  const { cloudName: c, apiKey: k, apiSecret: s } = getCloudinaryConfig();
  cloudinary.config({ cloud_name: c, api_key: k, api_secret: s });
}

/**
 * Extract Cloudinary public_id from a secure_url.
 * Format: https://res.cloudinary.com/CLOUD/image/upload/v1234567890/folder/file.jpg
 * public_id = folder/file (without version and extension for v1 URLs)
 */
export function getPublicIdFromUrl(secureUrl: string): string | null {
  try {
    const url = new URL(secureUrl);
    if (!url.hostname.includes("cloudinary.com")) return null;
    const pathParts = url.pathname.split("/");
    const uploadIndex = pathParts.indexOf("upload");
    if (uploadIndex === -1 || uploadIndex >= pathParts.length - 1)
      return null;
    // After "upload" we have [v, 1234567890, folder, file.jpg] or [folder, file.jpg]
    const afterUpload = pathParts.slice(uploadIndex + 1);
    const versionPart = afterUpload[0]?.startsWith("v") ? afterUpload[0] : null;
    const pathAfterVersion = versionPart
      ? afterUpload.slice(2)
      : afterUpload;
    if (!pathAfterVersion.length) return null;
    const full = pathAfterVersion.join("/");
    // Remove extension for destroy API (Cloudinary accepts with or without)
    const lastDot = full.lastIndexOf(".");
    const publicId = lastDot > 0 ? full.slice(0, lastDot) : full;
    return publicId || null;
  } catch {
    return null;
  }
}

export async function uploadStream(
  stream: NodeJS.ReadableStream,
  options?: { folder?: string; publicId?: string }
): Promise<{ secure_url: string; public_id: string }> {
  configureCloudinary();
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options?.folder ?? "mama-products",
        ...(options?.publicId && { public_id: options.publicId }),
      },
      (err, result) => {
        if (err) return reject(err);
        if (!result?.secure_url) return reject(new Error("No secure_url from Cloudinary"));
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id ?? "",
        });
      }
    );
    stream.pipe(uploadStream);
  });
}

export async function uploadBuffer(
  buffer: Buffer,
  options?: { folder?: string; mime?: string; publicId?: string }
): Promise<{ secure_url: string; public_id: string }> {
  configureCloudinary();
  const mime = options?.mime ?? "image/jpeg";
  const base64 = buffer.toString("base64");
  const dataUri = `data:${mime};base64,${base64}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: options?.folder ?? "mama-products",
    ...(options?.publicId && { public_id: options.publicId }),
  });
  if (!result?.secure_url) throw new Error("No secure_url from Cloudinary");
  return { secure_url: result.secure_url, public_id: result.public_id ?? "" };
}

export async function deleteByUrl(secureUrl: string): Promise<boolean> {
  const publicId = getPublicIdFromUrl(secureUrl);
  if (!publicId) return false;
  if (!isCloudinaryConfigured()) return false;
  configureCloudinary();
  const result = await cloudinary.uploader.destroy(publicId);
  return result.result === "ok";
}
