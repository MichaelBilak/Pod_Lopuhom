import "server-only";

import { unstable_cache } from "next/cache";
import {
  fetchNewProductsForHome,
  fetchProductBySlug as fetchProductBySlugFromDb,
  fetchProductsForPublic,
  type Product,
} from "./supabase-products";

const PRODUCTS_REVALIDATE_SECONDS = 300;

const fetchProductsCached = unstable_cache(
  async () => fetchProductsForPublic(),
  ["products-public"],
  { revalidate: PRODUCTS_REVALIDATE_SECONDS, tags: ["products"] }
);

const fetchNewProductsCached = unstable_cache(
  async (limit: number) => fetchNewProductsForHome(limit),
  ["products-new"],
  { revalidate: PRODUCTS_REVALIDATE_SECONDS, tags: ["products"] }
);

const fetchProductBySlugCached = unstable_cache(
  async (slug: string) => fetchProductBySlugFromDb(slug),
  ["product-by-slug"],
  { revalidate: PRODUCTS_REVALIDATE_SECONDS, tags: ["products"] }
);

export async function fetchProducts(): Promise<Product[]> {
  try {
    return await fetchProductsCached();
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[fetchProducts] Failed to load products:", err);
    }
    return [];
  }
}

export async function fetchNewProducts(limit = 8): Promise<Product[]> {
  try {
    return await fetchNewProductsCached(limit);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[fetchNewProducts] Failed to load new products:", err);
    }
    return [];
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    return await fetchProductBySlugCached(slug);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[fetchProductBySlug] Failed to load product:", err);
    }
    return null;
  }
}
