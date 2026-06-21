import {
  isSupabaseStorageUrl,
  parseSupabaseStorageUrl,
} from "@/lib/supabase-storage";

const CLOUDINARY_HOST = "res.cloudinary.com";

export function isCloudinaryUrl(src: string): boolean {
  try {
    return new URL(src).hostname === CLOUDINARY_HOST;
  } catch {
    return false;
  }
}

function clampPixelWidth(width: number): number {
  return Math.min(Math.max(Math.round(width), 64), 2000);
}

function resolvePixelWidth(
  displayWidth?: number,
  width?: number,
  fill?: boolean,
  pixelRatio = 1.5
): number {
  const logical = displayWidth ?? width ?? (fill ? 640 : 800);
  return clampPixelWidth(logical * pixelRatio);
}

/** Cloudinary CDN transforms — skip Next.js re-processing for legacy images. */
export function cloudinaryOptimizedUrl(src: string, width: number): string {
  if (!isCloudinaryUrl(src)) return src;
  if (/\/upload\/[^/]*(?:f_auto|w_\d)/.test(src)) return src;

  const targetWidth = clampPixelWidth(width);
  return src.replace("/upload/", `/upload/f_auto,q_auto,w_${targetWidth}/`);
}

/** Supabase Storage render endpoint — resized WebP from CDN, no Next.js hop. */
export function supabaseOptimizedUrl(
  src: string,
  width: number,
  quality = 80
): string {
  if (!isSupabaseStorageUrl(src)) return src;
  if (src.includes("/render/image/")) return src;

  const parsed = parseSupabaseStorageUrl(src);
  if (!parsed) return src;

  const targetWidth = clampPixelWidth(width);
  const targetQuality = Math.min(Math.max(Math.round(quality), 40), 90);
  const renderUrl = src.replace(
    "/storage/v1/object/public/",
    "/storage/v1/render/image/public/"
  );
  const separator = renderUrl.includes("?") ? "&" : "?";
  return `${renderUrl}${separator}width=${targetWidth}&quality=${targetQuality}&resize=contain`;
}

type ResolveImageSrcOptions = {
  width?: number;
  fill?: boolean;
  displayWidth?: number;
  quality?: number;
  pixelRatio?: number;
};

/** Pick display URL and whether Next.js should optimize it. */
export function resolveProductImageSrc(
  src: string,
  { width, fill, displayWidth, quality, pixelRatio }: ResolveImageSrcOptions = {}
): { src: string; unoptimized: boolean } {
  const pixelWidth = resolvePixelWidth(
    displayWidth,
    width,
    fill,
    pixelRatio
  );
  const targetQuality = quality ?? 80;

  if (isCloudinaryUrl(src)) {
    return {
      src: cloudinaryOptimizedUrl(src, pixelWidth),
      unoptimized: true,
    };
  }

  if (isSupabaseStorageUrl(src)) {
    return {
      src: supabaseOptimizedUrl(src, pixelWidth, targetQuality),
      unoptimized: true,
    };
  }

  return { src, unoptimized: false };
}
