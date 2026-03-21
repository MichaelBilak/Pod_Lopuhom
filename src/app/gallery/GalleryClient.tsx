"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getLocale, withLang } from "@/src/lib/i18n";
import type { Product } from "@/lib/products";
import {
  productMainImageUrl,
  productDisplayPrice,
  productMainImageObjectPosition,
} from "@/lib/products";
import ProductImagePlaceholder from "@/src/components/ProductImagePlaceholder";

type GalleryClientProps = {
  products: Product[];
  categories: { id: string; label: string }[];
  viewDetailsLabel: string;
};

const getCategoryFromProduct = (product: Product) => {
  return product.category ?? "Rings";
};

const getProductNumber = (product: Product) => {
  const candidates = [
    product.title,
    product.slug,
    productMainImageUrl(product) ?? "",
  ];
  for (const value of candidates) {
    const match = value.match(/(\d+)/);
    if (match) return Number(match[1]);
  }
  return Number.MAX_SAFE_INTEGER;
};

export default function GalleryClient({
  products,
  categories,
  viewDetailsLabel,
}: GalleryClientProps) {
  const searchParams = useSearchParams();
  const locale = getLocale(searchParams?.get("lang"));
  const initialCategory = searchParams?.get("category");
  const categoryIds = categories.map((category) => category.id);
  const [selected, setSelected] = useState<string>(
    initialCategory && categoryIds.includes(initialCategory)
      ? initialCategory
      : "All"
  );
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
    const handleScroll = () => {
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
        if (showStickyMenu) setShowStickyMenu(false);
      } else if (isScrollingUp) {
        if (showTimerRef.current === null) {
          showTimerRef.current = window.setTimeout(() => {
            setShowStickyMenu(true);
            showTimerRef.current = null;
          }, 140);
        }
      } else if (isScrollingDown && showStickyMenu) {
        if (showTimerRef.current !== null) {
          window.clearTimeout(showTimerRef.current);
          showTimerRef.current = null;
        }
        setShowStickyMenu(false);
      }

      lastScrollY.current = currentY;
    };

    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (showTimerRef.current !== null) {
        window.clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
    };
  }, [showStickyMenu]);

  const filteredProducts = useMemo(() => {
    if (selected === "All") return products;
    return products.filter((product) => {
      const category = getCategoryFromProduct(product);
      return category === selected;
    });
  }, [products, selected]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort(
      (a, b) => getProductNumber(a) - getProductNumber(b)
    );
  }, [filteredProducts]);

  const categoryOrder = useMemo(
    () => categories.filter((c) => c.id !== "All").map((c) => c.id),
    [categories]
  );

  const sections = useMemo(() => {
    if (selected === "All") {
      return categoryOrder.map((categoryId) => {
        const label = categories.find((c) => c.id === categoryId)?.label ?? categoryId;
        const items = products
          .filter((p) => getCategoryFromProduct(p) === categoryId)
          .sort((a, b) => getProductNumber(a) - getProductNumber(b));
        return { categoryId, label, products: items };
      }).filter((s) => s.products.length > 0);
    }
    const label = categories.find((c) => c.id === selected)?.label ?? selected;
    return [{ categoryId: selected, label, products: sortedProducts }];
  }, [selected, products, categoryOrder, categories, sortedProducts]);

  const renderCategoryMenu = (innerClassName: string) => (
    <div className="category-tabs-scroll w-full min-w-0 overflow-x-auto overscroll-x-contain scroll-smooth px-1 pb-1 [-webkit-overflow-scrolling:touch] sm:overflow-visible sm:px-0 sm:pb-0">
      <div
        className={[
          "inline-flex min-w-max flex-nowrap items-center justify-center gap-x-2 gap-y-2 sm:gap-x-7",
          innerClassName,
        ].join(" ")}
      >
        {categories.map((category, index) => (
          <div key={category.id} className="flex shrink-0 items-center gap-1.5 sm:gap-0">
            <button
              type="button"
              onClick={() => setSelected(category.id)}
              className={[
                "shrink-0 whitespace-nowrap border-b border-transparent pb-2 transition hover:border-slate-400 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
                selected === category.id ? "border-slate-400 text-slate-900" : "",
              ].join(" ")}
            >
              {category.label}
            </button>
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
          "fixed inset-x-0 top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur transition duration-300 ease-out",
          showStickyMenu
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none",
        ].join(" ")}
      >
        <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-3 sm:px-6">
          {renderCategoryMenu(
            "text-xs font-semibold uppercase tracking-[0.08em] text-slate-600 sm:text-sm sm:tracking-[0.28em]"
          )}
        </div>
      </div>
      {renderCategoryMenu(
        "text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 sm:gap-8 sm:text-sm sm:tracking-[0.3em] sm:text-base"
      )}

      <section id="gallery" className="min-w-0 space-y-14">
        {sections.map(({ categoryId, label, products: sectionProducts }) => (
          <div key={categoryId} className="space-y-6">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <span className="h-0.5 min-w-[1rem] flex-1 bg-slate-300" aria-hidden />
              <h2 className="min-w-0 max-w-[min(100%,28rem)] shrink text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 [overflow-wrap:anywhere] sm:text-sm sm:tracking-[0.24em]">
                {label}
              </h2>
              <span className="h-0.5 min-w-[1rem] flex-1 bg-slate-300" aria-hidden />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3 lg:gap-12">
              {sectionProducts.map((product) => (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-slate-100/90 bg-white transition-[box-shadow] duration-200 hover:shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
                >
                  <Link
                    href={withLang(`/products/${product.slug}`, locale)}
                    className="flex h-full w-full flex-col rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                    aria-label={`Open ${product.title} details`}
                  >
                    <div className="relative w-full overflow-hidden rounded-t-2xl bg-slate-50/60 aspect-[16/15] sm:aspect-auto sm:h-72 lg:h-80">
                      {productMainImageUrl(product) ? (
                        <img
                          src={productMainImageUrl(product)}
                          alt={product.title}
                          className="gallery-image h-full w-full origin-center object-cover object-center transition duration-500 ease-out group-hover:scale-[1.02]"
                          style={{
                            objectPosition: productMainImageObjectPosition(product),
                          }}
                          loading="eager"
                          fetchPriority="high"
                          decoding="async"
                        />
                      ) : (
                        <ProductImagePlaceholder
                          className="h-full w-full"
                          aria-label={product.title}
                        />
                      )}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                      <span className="pointer-events-none absolute bottom-3 right-3 opacity-0 transition duration-300 group-hover:opacity-60 text-white/90 text-[10px] uppercase tracking-widest">
                        →
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-1 px-2 pt-2 pb-2 sm:gap-2 sm:px-4 sm:pt-4 sm:pb-4">
                      <div className="flex min-w-0 items-end justify-between gap-2">
                        <span className="min-w-0 shrink whitespace-nowrap text-sm font-semibold text-slate-900 sm:text-xs">
                          {productDisplayPrice(product)}
                        </span>
                        <span className="shrink-0 whitespace-nowrap text-[8px] uppercase tracking-[0.12em] text-slate-400 group-hover:text-slate-600 sm:text-[10px] sm:tracking-[0.2em]">
                          {viewDetailsLabel}
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
