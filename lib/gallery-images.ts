import { parseCollection } from "@/src/lib/collections";
import { resolveProductImageSrc } from "@/lib/image-url";
import { productMainImageUrl, type Product } from "@/lib/products";

export const GALLERY_CATEGORIES = ["Rings", "Necklaces", "Earrings", "Sets"] as const;

export type GalleryImageProfile = {
  displayWidth: number;
  quality: number;
  pixelRatio: number;
  eagerCount: number;
  preloadLimit: number;
};

/** One URL for SSR + client — avoids hydration mismatch and double downloads. */
export const GALLERY_IMAGE_UNIVERSAL: GalleryImageProfile = {
  displayWidth: 480,
  quality: 72,
  pixelRatio: 1.35,
  eagerCount: 4,
  preloadLimit: 6,
};

/** Loading strategy only — same CDN URL as universal profile. */
export const GALLERY_LOADING_MOBILE: Pick<
  GalleryImageProfile,
  "eagerCount" | "preloadLimit"
> = {
  eagerCount: 4,
  preloadLimit: 4,
};

export const GALLERY_LOADING_DESKTOP: Pick<
  GalleryImageProfile,
  "eagerCount" | "preloadLimit"
> = {
  eagerCount: 6,
  preloadLimit: 8,
};

/** @deprecated Use GALLERY_IMAGE_UNIVERSAL.displayWidth instead. */
export const GALLERY_IMAGE_DISPLAY_WIDTH = GALLERY_IMAGE_UNIVERSAL.displayWidth;

export function getGalleryLoadingProfile(isMobile: boolean): Pick<
  GalleryImageProfile,
  "eagerCount" | "preloadLimit"
> {
  return isMobile ? GALLERY_LOADING_MOBILE : GALLERY_LOADING_DESKTOP;
}

export function resolveGalleryCategory(
  category: string | null | undefined,
  fallback = GALLERY_CATEGORIES[0]
): string {
  if (category && GALLERY_CATEGORIES.includes(category as (typeof GALLERY_CATEGORIES)[number])) {
    return category;
  }
  return fallback;
}

export function filterGalleryProducts(
  products: Product[],
  category: string,
  collection: string | null | undefined
): Product[] {
  const selectedCollection = parseCollection(collection);
  return products.filter((product) => {
    const productCategory = product.category ?? "Rings";
    const productCollection = parseCollection(product.collection);
    return productCategory === category && productCollection === selectedCollection;
  });
}

export function filterGalleryProductsByCollection(
  products: Product[],
  collection: string | null | undefined
): Product[] {
  const selectedCollection = parseCollection(collection);
  return products.filter(
    (product) => parseCollection(product.collection) === selectedCollection
  );
}

export function galleryProductImageSrc(
  url: string,
  profile: GalleryImageProfile = GALLERY_IMAGE_UNIVERSAL
): string {
  return resolveProductImageSrc(url, {
    fill: true,
    displayWidth: profile.displayWidth,
    quality: profile.quality,
    pixelRatio: profile.pixelRatio,
  }).src;
}

export function galleryProductImageUrls(
  products: Product[],
  profile: GalleryImageProfile = GALLERY_IMAGE_UNIVERSAL
): string[] {
  return products
    .map((product) => productMainImageUrl(product))
    .filter((url): url is string => Boolean(url))
    .map((url) => galleryProductImageSrc(url, profile));
}
