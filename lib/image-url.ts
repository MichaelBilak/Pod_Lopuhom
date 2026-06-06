const CLOUDINARY_HOST = "res.cloudinary.com";

export function isCloudinaryUrl(src: string): boolean {
  try {
    return new URL(src).hostname === CLOUDINARY_HOST;
  } catch {
    return false;
  }
}

/** Cloudinary CDN transforms — skip Next.js re-processing for legacy images. */
export function cloudinaryOptimizedUrl(src: string, width: number): string {
  if (!isCloudinaryUrl(src)) return src;
  if (/\/upload\/[^/]*(?:f_auto|w_\d)/.test(src)) return src;

  const targetWidth = Math.min(Math.max(Math.round(width), 64), 2000);
  return src.replace("/upload/", `/upload/f_auto,q_auto,w_${targetWidth}/`);
}

type ResolveImageSrcOptions = {
  width?: number;
  fill?: boolean;
};

/** Pick display URL and whether Next.js should optimize it. */
export function resolveProductImageSrc(
  src: string,
  { width, fill }: ResolveImageSrcOptions = {}
): { src: string; unoptimized: boolean } {
  if (isCloudinaryUrl(src)) {
    const targetWidth = width ?? (fill ? 1200 : 800);
    return {
      src: cloudinaryOptimizedUrl(src, targetWidth * 2),
      unoptimized: true,
    };
  }

  return { src, unoptimized: false };
}
