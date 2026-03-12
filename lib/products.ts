/**
 * Public product API: uses Supabase, returns only active products.
 * For admin and full CRUD use lib/supabase-products.
 */

import {
  fetchProductsForPublic,
  fetchProductBySlug,
  fetchNewProductsForHome,
  type Product,
} from "./supabase-products";

export type { Product };

export { fetchProductBySlug };

/** Fetch products for public catalog; returns [] if Supabase is unavailable or errors. */
export async function fetchProducts(): Promise<Product[]> {
  try {
    return await fetchProductsForPublic();
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[fetchProducts] Failed to load products:", err);
    }
    return [];
  }
}

/** Fetch products marked as "New" for home page "Latest pieces"; returns [] on error. */
export async function fetchNewProducts(limit = 8): Promise<Product[]> {
  try {
    return await fetchNewProductsForHome(limit);
  } catch (err) {
    // On deploy, missing SUPABASE env vars or wrong DB → empty section. Log to aid debugging.
    if (process.env.NODE_ENV === "development") {
      console.error("[fetchNewProducts] Failed to load new products:", err);
    }
    return [];
  }
}

/** Format price for display (uses first image as main is in Product.images[0]) */
export function productDisplayPrice(p: Product): string {
  if (p.price_on_request) return "Price on request";
  if (p.price != null) {
    const num = Number(p.price);
    if (!Number.isFinite(num)) return "Price on request";
    if (p.discount && p.discount > 0) {
      const discounted = num * (1 - Number(p.discount) / 100);
      return `€${discounted.toFixed(2)}`;
    }
    return `€${num.toFixed(2)}`;
  }
  return "";
}

/** First image URL (main image by sort_order) */
export function productMainImageUrl(p: Product): string | undefined {
  return p.images[0]?.image_url;
}

/** All image URLs in order */
export function productImageUrls(p: Product): string[] {
  return p.images.map((i) => i.image_url);
}

/** Object position for main (first) image, for use in style.objectPosition */
const OBJECT_POSITION_RE = /^\d+(\.\d+)?% \d+(\.\d+)?%$/;

export function productMainImageObjectPosition(p: Product): string {
  const pos = p.images[0]?.object_position;
  return pos && OBJECT_POSITION_RE.test(pos) ? pos : "50% 50%";
}

/** Images with URL and position for gallery */
export function productImagesWithPosition(
  p: Product
): { url: string; objectPosition: string }[] {
  return p.images.map((i) => ({
    url: i.image_url,
    objectPosition: i.object_position && OBJECT_POSITION_RE.test(i.object_position)
      ? i.object_position
      : "50% 50%",
  }));
}
