import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const TARGET_DIRS = [
  "public/images/hero img",
  "public/images/about",
];
const MAX_WIDTH = 1800;
const QUALITY = 80;

const isJpeg = (filename) => /\.(jpe?g)$/i.test(filename);

const optimizeImage = async (filePath) => {
  const image = sharp(filePath);
  const metadata = await image.metadata();
  const resizeOptions = metadata.width && metadata.width > MAX_WIDTH
    ? { width: MAX_WIDTH }
    : null;

  const tempPath = `${filePath}.tmp`;
  await image
    .resize(resizeOptions || undefined)
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(tempPath);

  await fs.unlink(filePath);
  await fs.rename(tempPath, filePath);
};

for (const relativeDir of TARGET_DIRS) {
  const fullDir = path.join(ROOT, relativeDir);
  const entries = await fs.readdir(fullDir);

  for (const entry of entries) {
    if (!isJpeg(entry)) continue;
    const filePath = path.join(fullDir, entry);
    await optimizeImage(filePath);
  }
}

console.log("Image optimization complete.");
