"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  COLLECTIONS,
  parseCollection,
  type CollectionId,
} from "@/src/lib/collections";
import { getLocale, withLang } from "@/src/lib/i18n";
import { copySearchParams } from "@/src/lib/search-params";
import type { Product } from "@/lib/products";
import {
  productMainImageUrl,
  productDisplayPrice,
  productMainImageObjectPosition,
} from "@/lib/products";
import {
  filterGalleryProductsForView,
  resolveGalleryCategory,
  resolveGalleryViewMode,
  type GalleryViewMode,
} from "@/lib/gallery-images";
import { galleryProductImageSrc } from "@/lib/gallery-images";
import { prefetchGalleryImages } from "@/lib/gallery-prefetch";
import { useGalleryImageProfile } from "@/src/hooks/useGalleryImageProfile";
import ProductImage from "@/src/components/ProductImage";
import ProductImagePlaceholder from "@/src/components/ProductImagePlaceholder";

type GalleryClientProps = {
  products: Product[];
  categories: { id: string; label: string }[];
  viewDetailsLabel: string;
};

type GallerySection = {
  sectionId: string;
  label: string;
  products: Product[];
};

const getCategoryFromProduct = (product: Product) => product.category ?? "Rings";

const getCollectionFromProduct = (product: Product): CollectionId =>
  parseCollection(product.collection);

function buildCategoryHref(
  pathname: string,
  searchParams: ReturnType<typeof useSearchParams>,
  categoryId: string
) {
  const params = copySearchParams(searchParams);
  params.delete("collection");
  params.set("category", categoryId);
  const query = params.toString();
  return `${pathname}${query ? `?${query}` : ""}`;
}

function buildCollectionHref(
  pathname: string,
  searchParams: ReturnType<typeof useSearchParams>,
  collectionId: CollectionId
) {
  const params = copySearchParams(searchParams);
  params.delete("category");
  params.set("collection", collectionId);
  const query = params.toString();
  return `${pathname}${query ? `?${query}` : ""}`;
}

function sectionAnchorId(sectionId: string) {
  return `gallery-section-${sectionId}`;
}

function groupByCollection(
  products: Product[],
  categoryId: string
): GallerySection[] {
  return COLLECTIONS.map((collection) => ({
    sectionId: collection,
    label: collection,
    products: products.filter(
      (product) =>
        getCategoryFromProduct(product) === categoryId &&
        getCollectionFromProduct(product) === collection
    ),
  })).filter((section) => section.products.length > 0);
}

function groupByCategory(
  products: Product[],
  categories: { id: string; label: string }[],
  collectionId: CollectionId
): GallerySection[] {
  return categories
    .map((category) => ({
      sectionId: category.id,
      label: category.label,
      products: products.filter(
        (product) =>
          getCollectionFromProduct(product) === collectionId &&
          getCategoryFromProduct(product) === category.id
      ),
    }))
    .filter((section) => section.products.length > 0);
}

type ProductCardProps = {
  product: Product;
  productIndex: number;
  locale: ReturnType<typeof getLocale>;
  viewDetailsLabel: string;
  profile: ReturnType<typeof useGalleryImageProfile>["profile"];
  isMobile: boolean;
};

function ProductCard({
  product,
  productIndex,
  locale,
  viewDetailsLabel,
  profile,
  isMobile,
}: ProductCardProps) {
  const mainImageUrl = productMainImageUrl(product);
  const priceText = productDisplayPrice(product);
  const isPriceOnRequest = priceText.toLowerCase() === "price on request";

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-100/90 bg-white transition-[box-shadow] duration-200 hover:shadow-[0_2px_12px_rgba(15,23,42,0.08)]">
      <Link
        href={withLang(`/products/${product.slug}`, locale)}
        className="block h-full w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        aria-label={`Open ${product.title} details`}
      >
        <div className="relative w-full overflow-hidden rounded-2xl bg-slate-50/60 aspect-[4/5] sm:aspect-square">
          {mainImageUrl ? (
            <ProductImage
              src={mainImageUrl}
              alt={product.title}
              fill
              displayWidth={profile.displayWidth}
              pixelRatio={profile.pixelRatio}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
              className="gallery-image h-full w-full origin-center object-cover object-center sm:transition sm:duration-500 sm:ease-out sm:group-hover:scale-[1.02]"
              style={{
                objectPosition: productMainImageObjectPosition(product),
              }}
              loading={
                productIndex < profile.eagerCount
                  ? "eager"
                  : isMobile
                    ? "lazy"
                    : "eager"
              }
              fetchPriority={
                productIndex < Math.min(2, profile.eagerCount) ? "high" : "auto"
              }
              priority={productIndex < profile.eagerCount}
              quality={profile.quality}
            />
          ) : (
            <ProductImagePlaceholder
              className="h-full w-full"
              aria-label={product.title}
            />
          )}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/85 via-black/50 to-transparent sm:h-16"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 flex min-w-0 items-end justify-between gap-2 px-2.5 pb-2.5 sm:px-4 sm:pb-4">
            <span
              className={[
                "font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]",
                isPriceOnRequest
                  ? "text-[9px] leading-tight sm:text-[10px]"
                  : "text-[15px] leading-none sm:text-[21px]",
              ].join(" ")}
            >
              {priceText}
            </span>
            <span className="shrink-0 text-right text-[7px] uppercase leading-none tracking-[0.1em] text-white/80 transition-colors group-hover:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] sm:text-[10px] sm:tracking-[0.2em]">
              {viewDetailsLabel}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function GalleryClient({
  products,
  categories,
  viewDetailsLabel,
}: GalleryClientProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname() ?? "/gallery";
  const locale = getLocale(searchParams?.get("lang"));
  const { isMobile, profile } = useGalleryImageProfile();

  const categoryParam = searchParams?.get("category");
  const collectionParam = searchParams?.get("collection");

  const viewMode: GalleryViewMode = useMemo(
    () => resolveGalleryViewMode(categoryParam, collectionParam),
    [categoryParam, collectionParam]
  );

  const selectedCategory = useMemo(
    () => resolveGalleryCategory(categoryParam),
    [categoryParam]
  );

  const selectedCollection = useMemo(
    () => parseCollection(collectionParam),
    [collectionParam]
  );

  const sections = useMemo(() => {
    if (viewMode === "collection") {
      return groupByCategory(products, categories, selectedCollection);
    }
    return groupByCollection(products, selectedCategory);
  }, [viewMode, products, categories, selectedCollection, selectedCategory]);

  const [showStickyMenu, setShowStickyMenu] = useState(false);
  const [isMainNavVisible, setIsMainNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const showTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const navElement = document.getElementById("main-nav");
    if (!navElement || typeof IntersectionObserver === "undefined") {
      setIsMainNavVisible(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsMainNavVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(navElement);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let ticking = false;
    let frameId = 0;

    const updateStickyMenu = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;
      const isScrollingUp = delta < -8;
      const isScrollingDown = delta > 8;
      const isNearTop = currentY < 80 || isMainNavVisible;

      if (isNearTop) {
        if (showTimerRef.current !== null) {
          window.clearTimeout(showTimerRef.current);
          showTimerRef.current = null;
        }
        setShowStickyMenu(false);
      } else if (isScrollingUp) {
        if (showTimerRef.current === null) {
          showTimerRef.current = window.setTimeout(() => {
            setShowStickyMenu(true);
            showTimerRef.current = null;
          }, 140);
        }
      } else if (isScrollingDown) {
        if (showTimerRef.current !== null) {
          window.clearTimeout(showTimerRef.current);
          showTimerRef.current = null;
        }
        setShowStickyMenu(false);
      }

      lastScrollY.current = currentY;
      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      frameId = window.requestAnimationFrame(updateStickyMenu);
    };

    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.cancelAnimationFrame(frameId);
      if (showTimerRef.current !== null) {
        window.clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
    };
  }, [isMainNavVisible]);

  useEffect(() => {
    const filtered = filterGalleryProductsForView(
      products,
      viewMode,
      selectedCategory,
      selectedCollection
    );
    const urls = filtered
      .map((product) => productMainImageUrl(product))
      .filter((url): url is string => Boolean(url))
      .map((url) => galleryProductImageSrc(url, profile));

    const controller = prefetchGalleryImages(urls, { isMobile });
    return () => controller.abort();
  }, [
    products,
    viewMode,
    selectedCategory,
    selectedCollection,
    profile,
    isMobile,
  ]);

  const renderCategoryMenu = (innerClassName: string) => (
    <div className="category-tabs-scroll min-w-0 overflow-x-auto overscroll-x-contain scroll-smooth pb-1 [-webkit-overflow-scrolling:touch] sm:overflow-visible sm:pb-0">
      <div
        className={[
          "flex w-max min-w-full flex-nowrap items-center justify-center gap-x-3 gap-y-2 sm:gap-x-7",
          innerClassName,
        ].join(" ")}
      >
        {categories.map((category, index) => {
          const isActive =
            viewMode === "category" && selectedCategory === category.id;
          const href =
            viewMode === "collection"
              ? `#${sectionAnchorId(category.id)}`
              : buildCategoryHref(pathname, searchParams, category.id);

          return (
            <div
              key={category.id}
              className="flex shrink-0 items-center gap-2 sm:gap-0"
            >
              {viewMode === "collection" ? (
                <a
                  href={href}
                  className={[
                    "inline-flex min-h-[40px] shrink-0 items-center whitespace-nowrap border-b border-transparent pb-1.5 pt-1.5 font-normal uppercase tracking-[0.22em] transition hover:border-slate-400 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:pb-2 sm:pt-0",
                  ].join(" ")}
                >
                  {category.label}
                </a>
              ) : (
                <Link
                  href={href}
                  scroll={false}
                  replace
                  className={[
                    "inline-flex min-h-[40px] shrink-0 items-center whitespace-nowrap border-b border-transparent pb-1.5 pt-1.5 font-normal uppercase tracking-[0.22em] transition hover:border-slate-400 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:pb-2 sm:pt-0",
                    isActive ? "border-slate-400 text-slate-900" : "",
                  ].join(" ")}
                >
                  {category.label}
                </Link>
              )}
              {index < categories.length - 1 && (
                <span
                  className="h-3 w-px shrink-0 bg-slate-200/50 sm:hidden"
                  aria-hidden
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderCollectionMenu = (innerClassName: string) => (
    <div className="category-tabs-scroll min-w-0 overflow-x-auto overscroll-x-contain scroll-smooth pb-1 [-webkit-overflow-scrolling:touch] sm:overflow-visible sm:pb-0">
      <div
        className={[
          "flex w-max min-w-full flex-nowrap items-center justify-center gap-x-3 gap-y-2 sm:gap-x-7",
          innerClassName,
        ].join(" ")}
      >
        {COLLECTIONS.map((collection, index) => {
          const isActive = selectedCollection === collection;
          return (
            <div
              key={collection}
              className="flex shrink-0 items-center gap-2 sm:gap-0"
            >
              <Link
                href={buildCollectionHref(pathname, searchParams, collection)}
                scroll={false}
                replace
                className={[
                  "inline-flex min-h-[40px] shrink-0 items-center whitespace-nowrap border-b border-transparent pb-1.5 pt-1.5 font-normal uppercase tracking-[0.22em] transition hover:border-slate-400 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:pb-2 sm:pt-0",
                  isActive ? "border-slate-400 text-slate-900" : "",
                ].join(" ")}
              >
                {collection}
              </Link>
              {index < COLLECTIONS.length - 1 && (
                <span
                  className="h-3 w-px shrink-0 bg-slate-200/50 sm:hidden"
                  aria-hidden
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  let productOffset = 0;

  return (
    <>
      <div
        className={[
          "gallery-sticky-shell fixed inset-x-0 top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur transition duration-300 ease-out",
          showStickyMenu
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none",
        ].join(" ")}
      >
        <div className="page-shell mx-auto w-full min-w-0 px-4 py-3 sm:px-6">
          {viewMode === "category"
            ? renderCategoryMenu(
                "text-xs font-normal uppercase tracking-[0.08em] text-slate-600 sm:text-sm sm:tracking-[0.28em]"
              )
            : renderCollectionMenu(
                "text-xs font-normal uppercase tracking-[0.08em] text-slate-600 sm:text-sm sm:tracking-[0.28em]"
              )}
        </div>
      </div>

      {viewMode === "category"
        ? renderCategoryMenu(
            "text-xs font-normal uppercase tracking-[0.08em] text-slate-500 sm:gap-8 sm:text-sm sm:tracking-[0.3em] sm:text-base"
          )
        : renderCollectionMenu(
            "text-xs font-normal uppercase tracking-[0.08em] text-slate-500 sm:gap-8 sm:text-sm sm:tracking-[0.3em] sm:text-base"
          )}

      <section id="gallery" className="min-w-0 space-y-16 sm:space-y-24 lg:space-y-28">
        {sections.map(({ sectionId, label, products: sectionProducts }) => (
          <div
            key={sectionId}
            id={sectionAnchorId(sectionId)}
            className="scroll-mt-28 space-y-8 sm:space-y-[45px] sm:scroll-mt-32"
          >
            <div className="-mx-2 flex min-w-0 items-center gap-2 sm:-mx-10 sm:gap-3 lg:-mx-16">
              <span
                className="home-category-band min-w-[2rem] flex-1 sm:min-w-[4rem]"
                aria-hidden
              />
              <h2 className="min-w-0 max-w-[min(100%,18rem)] shrink whitespace-nowrap text-center text-[13px] font-normal uppercase tracking-[0.2em] text-slate-600 [overflow-wrap:anywhere] sm:text-base sm:tracking-[0.28em]">
                {label}
              </h2>
              <span
                className="home-category-band min-w-[2rem] flex-1 sm:min-w-[4rem]"
                aria-hidden
              />
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-8 sm:gap-y-10 md:gap-x-[40px] lg:grid-cols-3 lg:gap-x-[60px] lg:gap-y-12">
              {sectionProducts.map((product) => {
                const index = productOffset;
                productOffset += 1;
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    productIndex={index}
                    locale={locale}
                    viewDetailsLabel={viewDetailsLabel}
                    profile={profile}
                    isMobile={isMobile}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
