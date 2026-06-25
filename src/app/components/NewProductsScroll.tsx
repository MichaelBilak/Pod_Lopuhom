"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
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

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    const pause = () => marquee.classList.add("is-paused");
    const resume = () => marquee.classList.remove("is-paused");

    marquee.addEventListener("touchstart", pause, { passive: true });
    marquee.addEventListener("touchend", resume, { passive: true });
    marquee.addEventListener("touchcancel", resume, { passive: true });
    marquee.addEventListener("mouseenter", pause);
    marquee.addEventListener("mouseleave", resume);

    return () => {
      marquee.classList.remove("is-paused");
      marquee.removeEventListener("touchstart", pause);
      marquee.removeEventListener("touchend", resume);
      marquee.removeEventListener("touchcancel", resume);
      marquee.removeEventListener("mouseenter", pause);
      marquee.removeEventListener("mouseleave", resume);
    };
  }, []);

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
        className="new-products-card group w-[clamp(11rem,76vw,16.5rem)] shrink-0 overflow-hidden rounded-2xl border border-slate-100/90 bg-white transition-[box-shadow] duration-200 hover:shadow-[0_2px_12px_rgba(15,23,42,0.08)] sm:w-[320px]"
        aria-hidden={duplicate}
      >
        <Link
          href={withLang(`/products/${product.slug}`, locale)}
          className="block h-full w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          aria-label={`Open ${product.title} details`}
          tabIndex={duplicate ? -1 : undefined}
        >
          <div className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl bg-slate-50/60 sm:aspect-auto sm:h-[298px]">
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
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/85 via-black/50 to-transparent"
              aria-hidden
            />
            <div className="absolute inset-x-0 bottom-0 flex min-w-0 items-end justify-between gap-2 px-3 pb-3 sm:px-4 sm:pb-4">
              <span
                className={[
                  "min-w-0 truncate font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]",
                  isPriceOnRequest ? "text-[11px]" : "text-[20px] sm:text-[26px]",
                ].join(" ")}
              >
                {priceText}
              </span>
              <span className="shrink-0 whitespace-nowrap text-[10px] uppercase tracking-[0.16em] text-white/80 transition-colors group-hover:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] sm:text-xs sm:tracking-[0.2em]">
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
          className="pointer-events-none absolute right-0 top-1 bottom-3 hidden w-12 bg-gradient-to-l from-white via-white/80 to-transparent sm:block sm:w-24"
          aria-hidden
        />
      </div>
    </section>
  );
}
