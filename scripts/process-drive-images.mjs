import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "public/images/_drive_import");
const QUALITY = 80;
const MAX_WIDTH = 1800;

async function processHero() {
  const input = path.join(SRC, "IMG_3292.png");
  const output = path.join(ROOT, "public/images/hero/hero-market.jpg");
  const meta = await sharp(input).metadata();
  const w = meta.width ?? 1024;
  const h = meta.height ?? 682;
  const cropW = Math.round(w * 0.88);
  const cropH = Math.round(h * 0.92);
  const left = Math.round((w - cropW) * 0.28);
  const top = Math.round((h - cropH) / 2);

  await sharp(input)
    .extract({ left, top, width: cropW, height: cropH })
    .resize({ width: 1600 })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(output);

  console.log("hero done", output);
}

async function processCollection(inputName, outputName, crop) {
  const input = path.join(SRC, inputName);
  const output = path.join(ROOT, "public/images/collections", outputName);
  const meta = await sharp(input).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  const size = Math.min(w, h);
  const left = crop?.left ?? Math.round((w - size) / 2);
  const top = crop?.top ?? Math.round((h - size) * 0.35);

  await sharp(input)
    .extract({ left, top, width: size, height: size })
    .resize({ width: 1200, height: 1200, fit: "cover" })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(output);

  console.log("collection done", outputName);
}

async function processGnome() {
  const input = path.join(SRC, "gnome.png");
  const outDir = path.join(ROOT, "public/images/about");
  await fs.mkdir(outDir, { recursive: true });
  const output = path.join(outDir, "gnome.png");

  await sharp(input)
    .resize({ width: 240, height: 240, fit: "inside" })
    .png({ compressionLevel: 9 })
    .toFile(output);

  console.log("gnome done", output);
}

await processHero();
await processCollection("IMG_1350.JPG", "herbarium.jpg", {
  left: 3848 - 2128,
  top: 0,
});
await processCollection("IMG_9943.JPG", "folia.jpg", {
  left: 0,
  top: Math.round((4032 - 3024) * 0.12),
});
await processGnome();
