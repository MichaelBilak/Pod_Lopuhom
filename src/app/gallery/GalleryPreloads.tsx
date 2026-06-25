import {
  filterGalleryProductsForView,
  galleryProductImageSrc,
  GALLERY_IMAGE_UNIVERSAL,
  GALLERY_LOADING_DESKTOP,
  GALLERY_LOADING_MOBILE,
  resolveGalleryCategory,
  resolveGalleryViewMode,
} from "@/lib/gallery-images";
import type { Product } from "@/lib/products";

type GalleryPreloadsProps = {
  products: Product[];
  category?: string | null;
  collection?: string | null;
};

function preloadUrls(products: Product[], limit: number): string[] {
  return products
    .slice(0, limit)
    .map((product) => product.images?.[0]?.image_url)
    .filter((url): url is string => Boolean(url))
    .map((url) => galleryProductImageSrc(url, GALLERY_IMAGE_UNIVERSAL));
}

export default function GalleryPreloads({
  products,
  category,
  collection,
}: GalleryPreloadsProps) {
  const selectedCategory = resolveGalleryCategory(category);
  const viewMode = resolveGalleryViewMode(category, collection);
  const filtered = filterGalleryProductsForView(
    products,
    viewMode,
    selectedCategory,
    collection
  );

  const mobileUrls = preloadUrls(filtered, GALLERY_LOADING_MOBILE.preloadLimit);
  const desktopUrls = preloadUrls(
    filtered,
    GALLERY_LOADING_DESKTOP.preloadLimit
  );

  return (
    <>
      {mobileUrls.map((href) => (
        <link
          key={`mobile-${href}`}
          rel="preload"
          as="image"
          href={href}
          media="(max-width: 640px)"
        />
      ))}
      {desktopUrls.map((href) => (
        <link
          key={`desktop-${href}`}
          rel="preload"
          as="image"
          href={href}
          media="(min-width: 641px)"
        />
      ))}
    </>
  );
}
