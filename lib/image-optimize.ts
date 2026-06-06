import sharp from "sharp";

const MAX_DIMENSION = 2000;
const WEBP_QUALITY = 82;

export type OptimizedImage = {
  buffer: Buffer;
  mime: string;
};

/** Resize, auto-orient, and compress product photos before storage. */
export async function optimizeProductImage(
  input: Buffer,
  mime: string
): Promise<OptimizedImage> {
  const normalizedMime = mime.toLowerCase().split(";")[0]?.trim() || "image/jpeg";

  if (normalizedMime === "image/gif") {
    const meta = await sharp(input, { animated: true }).metadata();
    if (meta.pages && meta.pages > 1) {
      return { buffer: input, mime: normalizedMime };
    }
  }

  const image = sharp(input, { animated: false });
  const metadata = await image.metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  const needsResize = width > MAX_DIMENSION || height > MAX_DIMENSION;

  let pipeline = image.rotate();

  if (needsResize) {
    pipeline = pipeline.resize({
      width: width >= height ? MAX_DIMENSION : undefined,
      height: height > width ? MAX_DIMENSION : undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const buffer = await pipeline
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer();

  return { buffer, mime: "image/webp" };
}
