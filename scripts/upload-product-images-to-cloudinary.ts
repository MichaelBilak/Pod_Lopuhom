/**
 * Upload local product images (public/images/products) to Cloudinary
 * and attach them to products in Supabase.
 *
 * - Ensures products from src/data/products.ts exist in Supabase (creates if missing).
 * - For each product, reads local image files and uploads to Cloudinary with clean names.
 * - Inserts product_images in Supabase so photos display on the site.
 *
 * Run from project root:
 *   npx tsx scripts/upload-product-images-to-cloudinary.ts
 *
 * Requires: .env with SUPABASE_*, CLOUDINARY_*, and files in public/images/products/
 */

import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { products as seedProducts } from "../src/data/products";
import {
  fetchProductsAdmin,
  createProduct,
  addProductImage,
} from "../lib/supabase-products";
import { uploadBuffer } from "../lib/cloudinary";

const FOLDER = "mama-products";
const PUBLIC_DIR = path.join(process.cwd(), "public");

/** Build Cloudinary public_id from path: earrings_1.0.JPG -> mama-products/earrings-1-0 */
function toPublicId(imagePath: string): string {
  const basename = path.basename(imagePath);
  const nameWithoutExt = basename.replace(/\.[^.]+$/, "");
  const clean = nameWithoutExt.replace(/[_.]/g, "-").toLowerCase();
  return `${FOLDER}/${clean}`;
}

function getMime(imagePath: string): string {
  const ext = path.extname(imagePath).toLowerCase();
  const mimes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
  };
  return mimes[ext] ?? "image/jpeg";
}

function categoryFromSlug(slug: string): "Rings" | "Necklaces" | "Earrings" | "Sets" {
  if (slug.startsWith("earrings")) return "Earrings";
  if (slug.startsWith("necklaces")) return "Necklaces";
  if (slug.startsWith("set")) return "Sets";
  return "Rings";
}

async function main() {
  const existing = await fetchProductsAdmin();
  const bySlug = new Map(existing.map((p) => [p.slug, p]));

  for (const seed of seedProducts) {
    let product = bySlug.get(seed.slug);
    if (!product) {
      console.log(`Creating product: ${seed.slug}`);
      product = await createProduct({
        title: seed.title,
        slug: seed.slug,
        description: seed.description,
        materials: seed.materials,
        price: null,
        price_on_request: true,
        category: categoryFromSlug(seed.slug),
        is_active: true,
        is_new: seed.isNew ?? false,
        sort_order: 0,
      });
      bySlug.set(seed.slug, product);
    }

    if (product.images.length > 0) {
      console.log(`Skip ${seed.slug}: already has ${product.images.length} image(s).`);
      continue;
    }

    for (let i = 0; i < seed.images.length; i++) {
      const imagePath = seed.images[i];
      const localPath = path.join(PUBLIC_DIR, imagePath.startsWith("/") ? imagePath.slice(1) : imagePath);

      if (!fs.existsSync(localPath)) {
        console.warn(`File not found: ${localPath}`);
        continue;
      }

      const buffer = fs.readFileSync(localPath);
      const publicId = toPublicId(imagePath);
      const mime = getMime(imagePath);

      const { secure_url } = await uploadBuffer(buffer, {
        folder: FOLDER,
        mime,
        publicId,
      });
      await addProductImage(product.id, secure_url, null, i);
      console.log(`  Uploaded ${path.basename(localPath)} -> ${publicId}`);
    }

    if (seed.images.length > 0) {
      console.log(`Done: ${seed.slug} (${seed.images.length} images).`);
    }
  }

  console.log("Upload complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
