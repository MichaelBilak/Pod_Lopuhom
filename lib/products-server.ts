import "server-only";

import { unstable_cache } from "next/cache";
import {
  fetchNewProductsForHome,
  fetchProductBySlug as fetchProductBySlugFromDb,
  fetchProductsForPublic,
  type Product,
} from "./supabase-products";

const PRODUCTS_REVALIDATE_SECONDS = 300;

// We intentionally throw inside the cached function on empty results so that
// `unstable_cache` does not memoize an empty array across a 5-minute window
// when the very first request after a fresh deploy or cold-start hits a
// transient error path (e.g. brief Supabase blip).

const fetchProductsCached = unstable_cache(
  async () => {
    const result = await fetchProductsForPublic();
    if (result.length === 0) throw new Error("EMPTY_PRODUCTS");
    return result;
  },
  ["products-public"],
  { revalidate: PRODUCTS_REVALIDATE_SECONDS, tags: ["products"] }
);

const fetchNewProductsCached = unstable_cache(
  async (limit: number) => {
    const result = await fetchNewProductsForHome(limit);
    if (result.length === 0) throw new Error("EMPTY_NEW_PRODUCTS");
    return result;
  },
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
    const message = err instanceof Error ? err.message : String(err);
    if (message === "EMPTY_PRODUCTS") {
      // Sentinel error: cache refused to memoize. Do a direct fetch so we
      // recover immediately if data is actually there now.
      try {
        return await fetchProductsForPublic();
      } catch (innerErr) {
        console.error("[fetchProducts] Direct fetch failed:", innerErr);
        return [];
      }
    }
    console.error("[fetchProducts] Cached fetch failed:", err);
    try {
      return await fetchProductsForPublic();
    } catch (innerErr) {
      console.error("[fetchProducts] Direct fallback failed:", innerErr);
      return [];
    }
  }
}

export async function fetchNewProducts(limit = 8): Promise<Product[]> {
  try {
    return await fetchNewProductsCached(limit);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === "EMPTY_NEW_PRODUCTS") {
      try {
        return await fetchNewProductsForHome(limit);
      } catch (innerErr) {
        console.error("[fetchNewProducts] Direct fetch failed:", innerErr);
        return [];
      }
    }
    console.error("[fetchNewProducts] Cached fetch failed:", err);
    try {
      return await fetchNewProductsForHome(limit);
    } catch (innerErr) {
      console.error("[fetchNewProducts] Direct fallback failed:", innerErr);
      return [];
    }
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    return await fetchProductBySlugCached(slug);
  } catch (err) {
    console.error("[fetchProductBySlug] Cached fetch failed:", err);
    try {
      return await fetchProductBySlugFromDb(slug);
    } catch (innerErr) {
      console.error("[fetchProductBySlug] Direct fallback failed:", innerErr);
      return null;
    }
  }
}
