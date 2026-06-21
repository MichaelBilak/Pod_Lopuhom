"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
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
  filterGalleryProductsByCollection,
  galleryProductImageSrc,
} from "@/lib/gallery-images";
import { prefetchGalleryImages } from "@/lib/gallery-prefetch";
import { useGalleryImageProfile } from "@/src/hooks/useGalleryImageProfile";
import ProductImage from "@/src/components/ProductImage";
import ProductImagePlaceholder from "@/src/components/ProductImagePlaceholder";

type GalleryClientProps = {
  products: Product[];
  categories: { id: string; label: string }[];
  viewDetailsLabel: string;
};

const getCategoryFromProduct = (product: Product) => {
  return product.category ?? "Rings";
};

const getCollectionFromProduct = (product: Product): CollectionId => {
  return parseCollection(product.collection);
};

function buildCategoryHref(
  pathname: string,
  searchParams: ReturnType<typeof useSearchParams>,
  categoryId: string,
  collectionId: CollectionId
) {
  const params = copySearchParams(searchParams);
  params.set("collection", collectionId);
  params.set("category", categoryId);
  const query = params.toString();
  return `${pathname}${query ? `?${query}` : ""}`;
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

  const selectedCollection = useMemo(
    () => parseCollection(searchParams?.get("collection")),
    [searchParams]
  );

  const defaultCategory = categories[0]?.id ?? "Rings";
  const selected = useMemo(() => {
    const fromUrl = searchParams?.get("category");
    if (fromUrl && categories.some((category) => category.id === fromUrl)) {
      return fromUrl;
    }
    return defaultCategory;
  }, [searchParams, categories, defaultCategory]);

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

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const category = getCategoryFromProduct(product);
      const collection = getCollectionFromProduct(product);
      return category === selected && collection === selectedCollection;
    });
  }, [products, selected, selectedCollection]);

  useEffect(() => {
    const urls = filterGalleryProductsByCollection(products, selectedCollection)
      .map((product) => productMainImageUrl(product))
      .filter((url): url is string => Boolean(url))
      .map((url) => galleryProductImageSrc(url, profile));

    const controller = prefetchGalleryImages(urls, { isMobile });
    return () => controller.abort();
  }, [products, selectedCollection, profile, isMobile]);

  const sections = useMemo(() => {
    const label = categories.find((c) => c.id === selected)?.label ?? selected;
    return [{ categoryId: selected, label, products: filteredProducts }];
  }, [selected, categories, filteredProducts]);

  const renderCategoryMenu = (innerClassName: string) => (
    <div className="category-tabs-scroll -mx-4 min-w-0 overflow-x-auto overscroll-x-contain scroll-smooth px-4 pb-1 [-webkit-overflow-scrolling:touch] sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0">
      <div
        className={[
          "flex w-max min-w-full flex-nowrap items-center justify-center gap-x-3 gap-y-2 sm:gap-x-7",
          innerClassName,
        ].join(" ")}
      >
        {categories.map((category, index) => (
          <div key={category.id} className="flex shrink-0 items-center gap-2 sm:gap-0">
            <Link
              href={buildCategoryHref(
                pathname,
                searchParams,
                category.id,
                selectedCollection
              )}
              scroll={false}
              replace
              className={[
                "inline-flex min-h-[40px] shrink-0 items-center whitespace-nowrap border-b border-transparent pb-1.5 pt-1.5 font-normal uppercase tracking-[0.22em] transition hover:border-slate-400 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:pb-2 sm:pt-0",
                selected === category.id ? "border-slate-400 text-slate-900" : "",
              ].join(" ")}
            >
              {category.label}
            </Link>
            {index < categories.length - 1 && (
              <span
                className="h-3 w-px shrink-0 bg-slate-200/50 sm:hidden"
                aria-hidden
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

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
        <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-3 sm:px-6">
          {renderCategoryMenu(
            "text-xs font-normal uppercase tracking-[0.08em] text-slate-600 sm:text-sm sm:tracking-[0.28em]"
          )}
        </div>
      </div>
      <p className="text-center text-[11px] font-normal uppercase tracking-[0.28em] text-slate-500 sm:text-xs">
        {selectedCollection}
      </p>
      {renderCategoryMenu(
        "text-xs font-normal uppercase tracking-[0.08em] text-slate-500 sm:gap-8 sm:text-sm sm:tracking-[0.3em] sm:text-base"
      )}

      <section id="gallery" className="min-w-0 space-y-16 sm:space-y-24 lg:space-y-28">
        {sections.map(({ categoryId, label, products: sectionProducts }) => (
          <div key={categoryId} className="space-y-8 sm:space-y-[45px]">
            <div className="-mx-2 flex min-w-0 items-center gap-2 sm:-mx-10 sm:gap-3 lg:-mx-16">
              <span className="home-category-band min-w-[2rem] flex-1 sm:min-w-[4rem]" aria-hidden />
              <h2 className="min-w-0 max-w-[min(100%,18rem)] shrink whitespace-nowrap text-center text-[13px] font-normal uppercase tracking-[0.2em] text-slate-600 [overflow-wrap:anywhere] sm:text-base sm:tracking-[0.28em]">
                {label}
              </h2>
              <span className="home-category-band min-w-[2rem] flex-1 sm:min-w-[4rem]" aria-hidden />
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-8 sm:gap-y-10 md:gap-x-[40px] lg:grid-cols-3 lg:gap-x-[60px] lg:gap-y-12">
              {sectionProducts.map((product, productIndex) => {
                const mainImageUrl = productMainImageUrl(product);
                const priceText = productDisplayPrice(product);
                const isPriceOnRequest =
                  priceText.toLowerCase() === "price on request";
                return (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-2xl border border-slate-100/90 bg-white transition-[box-shadow] duration-200 hover:shadow-[0_2px_12px_rgba(15,23,42,0.08)]"
                  >
                    <Link
                      href={withLang(`/products/${product.slug}`, locale)}
                      className="block h-full w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                      aria-label={`Open ${product.title} details`}
                    >
                      <div className="relative w-full overflow-hidden rounded-2xl bg-slate-50/60 aspect-[4/5] sm:aspect-auto sm:h-72 lg:h-80">
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
                              objectPosition:
                                productMainImageObjectPosition(product),
                            }}
                            loading={
                              productIndex < profile.eagerCount
                                ? "eager"
                                : isMobile
                                  ? "lazy"
                                  : "eager"
                            }
                            fetchPriority={
                              productIndex < Math.min(2, profile.eagerCount)
                                ? "high"
                                : "auto"
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
                          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/85 via-black/50 to-transparent"
                          aria-hidden
                        />
                        <div className="absolute inset-x-0 bottom-0 flex min-w-0 items-end justify-between gap-2 px-3 pb-3 sm:px-4 sm:pb-4">
                          <span
                            className={[
                              "min-w-0 shrink whitespace-nowrap font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]",
                              isPriceOnRequest
                                ? "text-[10px] sm:text-[10px]"
                                : "text-[18px] sm:text-[21px]",
                            ].join(" ")}
                          >
                            {priceText}
                          </span>
                          <span className="shrink-0 whitespace-nowrap text-[8px] uppercase tracking-[0.12em] text-white/80 transition-colors group-hover:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] sm:text-[10px] sm:tracking-[0.2em]">
                            {viewDetailsLabel}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
