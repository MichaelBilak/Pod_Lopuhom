"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ProductImage from "@/src/components/ProductImage";
import { withLang, type Locale } from "@/src/lib/i18n";
import type { Product } from "@/lib/supabase-products";
import {
  productDisplayPrice,
  productMainImageUrl,
  productMainImageObjectPosition,
} from "@/lib/products";
import ProductImagePlaceholder from "@/src/components/ProductImagePlaceholder";

type NewProductsScrollProps = {
  products: Product[];
  locale: Locale;
  newLabel: string;
  newTitle: string;
  viewDetails: string;
};

export default function NewProductsScroll({
  products,
  locale,
  newLabel,
  viewDetails,
}: NewProductsScrollProps) {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    const pause = () => marquee.classList.add("is-paused");
    const resume = () => marquee.classList.remove("is-paused");

    const updateScrollHint = () => {
      const atEnd =
        marquee.scrollLeft + marquee.clientWidth >= marquee.scrollWidth - 12;
      setShowScrollHint(!atEnd);
    };

    marquee.addEventListener("touchstart", pause, { passive: true });
    marquee.addEventListener("touchend", resume, { passive: true });
    marquee.addEventListener("touchcancel", resume, { passive: true });
    marquee.addEventListener("mouseenter", pause);
    marquee.addEventListener("mouseleave", resume);
    marquee.addEventListener("scroll", updateScrollHint, { passive: true });
    updateScrollHint();

    return () => {
      marquee.classList.remove("is-paused");
      marquee.removeEventListener("touchstart", pause);
      marquee.removeEventListener("touchend", resume);
      marquee.removeEventListener("touchcancel", resume);
      marquee.removeEventListener("mouseenter", pause);
      marquee.removeEventListener("mouseleave", resume);
      marquee.removeEventListener("scroll", updateScrollHint);
    };
  }, [products.length]);

  if (products.length === 0) return null;

  const renderCard = (
    product: Product,
    index: number,
    copyTag: "pre" | "orig" | "post" = "orig"
  ) => {
    const duplicate = copyTag !== "orig";
    const mainImageUrl = productMainImageUrl(product);
    const priceText = productDisplayPrice(product);
    const isPriceOnRequest = priceText.toLowerCase() === "price on request";
    return (
      <article
        key={`${copyTag}-${product.id}-${index}`}
        className="new-products-card group w-[clamp(9.5rem,42vw,12rem)] shrink-0 overflow-hidden rounded-2xl border border-slate-100/90 bg-white transition-[box-shadow] duration-200 hover:shadow-[0_2px_12px_rgba(15,23,42,0.08)] sm:w-[320px]"
        aria-hidden={duplicate}
      >
        <Link
          href={withLang(`/products/${product.slug}`, locale)}
          className="block h-full w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          aria-label={`Open ${product.title} details`}
          tabIndex={duplicate ? -1 : undefined}
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-slate-50/60 sm:aspect-square">
            {mainImageUrl ? (
              <ProductImage
                src={mainImageUrl}
                alt={product.title}
                fill
                sizes="(max-width: 430px) 72vw, (max-width: 640px) 280px, 320px"
                className="gallery-image h-full w-full origin-center object-cover object-center transition duration-500 ease-out group-hover:scale-[1.02]"
                style={{
                  objectPosition: productMainImageObjectPosition(product),
                }}
                loading={duplicate || index > 1 ? "lazy" : "eager"}
                priority={!duplicate && index <= 1}
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
                {viewDetails}
              </span>
            </div>
          </div>
        </Link>
      </article>
    );
  };

  return (
    <section className="new-products-section flex min-w-0 flex-col gap-6 sm:gap-8">
      <div className="text-center">
        <p className="new-products-label text-[14px] font-medium uppercase tracking-[0.2em] text-slate-400 sm:text-[16px] sm:tracking-[0.28em]">
          {newLabel}
        </p>
      </div>
      <div className="relative min-w-0 edge-bleed-x sm:no-edge-bleed">
        <div
          ref={marqueeRef}
          className="new-products-marquee new-products-scroll pb-3 pt-1 sm:overflow-hidden"
          role="region"
          aria-label="Latest pieces"
        >
          <div className="new-products-track flex w-max">
            <div
              className="new-products-copy flex gap-3 pr-3 sm:gap-5 sm:pr-5"
              data-copy="pre"
              aria-hidden
            >
              {products.map((product, index) => renderCard(product, index, "pre"))}
            </div>
            <div
              className="new-products-copy flex gap-3 pr-3 sm:gap-5 sm:pr-5"
              data-copy="orig"
            >
              {products.map((product, index) => renderCard(product, index, "orig"))}
            </div>
            <div
              className="new-products-copy flex gap-3 pr-3 sm:gap-5 sm:pr-5"
              data-copy="post"
              aria-hidden
            >
              {products.map((product, index) => renderCard(product, index, "post"))}
            </div>
          </div>
        </div>
        <div
          className={[
            "new-products-scroll-hint pointer-events-none absolute right-0 top-1 bottom-3 z-10 flex w-12 items-center justify-end pr-0.5 transition-opacity duration-300 sm:hidden",
            showScrollHint ? "opacity-100" : "opacity-0",
          ].join(" ")}
          aria-hidden
        >
          <div className="absolute inset-0 bg-gradient-to-l from-white via-white/90 to-transparent" />
          <svg
            viewBox="0 0 20 20"
            className="relative h-4 w-4 text-slate-400"
            aria-hidden
          >
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M8 5l5 5-5 5"
            />
          </svg>
        </div>
        <div
          className="pointer-events-none absolute right-0 top-1 bottom-3 hidden w-12 bg-gradient-to-l from-white via-white/80 to-transparent sm:block sm:w-24"
          aria-hidden
        />
      </div>
    </section>
  );
}
