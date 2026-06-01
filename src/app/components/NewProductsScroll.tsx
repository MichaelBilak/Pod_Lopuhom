"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import { getLocale, withLang } from "@/src/lib/i18n";
import type { Product } from "@/lib/supabase-products";
import {
  productDisplayPrice,
  productMainImageUrl,
  productMainImageObjectPosition,
} from "@/lib/products";
import ProductImagePlaceholder from "@/src/components/ProductImagePlaceholder";

type NewProductsScrollProps = {
  products: Product[];
  newLabel: string;
  newTitle: string;
  viewDetails: string;
};

const LOOP_SECONDS = 30;

export default function NewProductsScroll({
  products,
  newLabel,
  newTitle,
  viewDetails,
}: NewProductsScrollProps) {
  const searchParams = useSearchParams();
  const locale = getLocale(searchParams?.get("lang"));
  const marqueeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const marquee = marqueeRef.current;
    const track = trackRef.current;
    if (!marquee || !track) return;

    const origCopy = track.querySelector<HTMLElement>('[data-copy="orig"]');
    if (!origCopy) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let segmentWidth = origCopy.offsetWidth;
    let paused = false;
    let rafId = 0;
    let lastTime = 0;
    let scrollEndTimer = 0;

    const centerScroll = () => {
      marquee.scrollLeft = segmentWidth;
    };

    const normalizeScroll = () => {
      if (segmentWidth <= 0) return;
      const min = segmentWidth * 0.5;
      const max = segmentWidth * 2.5;
      if (marquee.scrollLeft >= max) {
        marquee.scrollLeft -= segmentWidth;
      } else if (marquee.scrollLeft < min) {
        marquee.scrollLeft += segmentWidth;
      }
    };

    const pause = () => {
      paused = true;
    };

    const resume = () => {
      normalizeScroll();
      paused = false;
      lastTime = 0;
    };

    const onScroll = () => {
      if (!paused) return;
      window.clearTimeout(scrollEndTimer);
      scrollEndTimer = window.setTimeout(() => {
        normalizeScroll();
      }, 120);
    };

    const tick = (time: number) => {
      if (!lastTime) lastTime = time;
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (!paused && !reducedMotion && segmentWidth > 0) {
        const speed = segmentWidth / LOOP_SECONDS;
        marquee.scrollLeft += speed * dt;
        if (marquee.scrollLeft >= segmentWidth * 2) {
          marquee.scrollLeft -= segmentWidth;
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    centerScroll();

    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = origCopy.offsetWidth;
      if (nextWidth > 0 && nextWidth !== segmentWidth) {
        segmentWidth = nextWidth;
        centerScroll();
      }
    });
    resizeObserver.observe(origCopy);

    marquee.addEventListener("pointerdown", pause);
    marquee.addEventListener("pointerup", resume);
    marquee.addEventListener("pointercancel", resume);
    marquee.addEventListener("mouseenter", pause);
    marquee.addEventListener("mouseleave", resume);
    marquee.addEventListener("scroll", onScroll, { passive: true });

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(scrollEndTimer);
      resizeObserver.disconnect();
      marquee.removeEventListener("pointerdown", pause);
      marquee.removeEventListener("pointerup", resume);
      marquee.removeEventListener("pointercancel", resume);
      marquee.removeEventListener("mouseenter", pause);
      marquee.removeEventListener("mouseleave", resume);
      marquee.removeEventListener("scroll", onScroll);
    };
  }, [products]);

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
        className="group w-[min(260px,calc(100vw-2.5rem))] shrink-0 overflow-hidden rounded-2xl border border-slate-100/90 bg-white transition-[box-shadow] duration-200 hover:shadow-[0_2px_12px_rgba(15,23,42,0.08)] sm:w-[298px]"
        aria-hidden={duplicate}
      >
        <Link
          href={withLang(`/products/${product.slug}`, locale)}
          className="block h-full w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          aria-label={`Open ${product.title} details`}
          tabIndex={duplicate ? -1 : undefined}
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-slate-50/60 sm:aspect-auto sm:h-[320px]">
            {mainImageUrl ? (
              <Image
                src={mainImageUrl}
                alt={product.title}
                fill
                sizes="(max-width: 640px) calc(100vw - 2.5rem), 298px"
                className="gallery-image h-full w-full origin-center object-cover object-center transition duration-500 ease-out group-hover:scale-[1.02]"
                style={{
                  objectPosition: productMainImageObjectPosition(product),
                }}
                loading={duplicate ? "lazy" : index < 2 ? "eager" : "lazy"}
                priority={!duplicate && index === 0}
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
                  isPriceOnRequest ? "text-[11px]" : "text-[22px] sm:text-[26px]",
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
    <section className="min-w-0 space-y-6 sm:space-y-8">
      <div className="text-center">
        <p className="text-[14px] font-medium uppercase tracking-[0.2em] text-slate-400 sm:text-[16px] sm:tracking-[0.28em]">
          {newLabel}
        </p>
      </div>
      <div className="relative -mx-4 min-w-0 px-4 sm:-mx-6 sm:px-6">
        <div
          ref={marqueeRef}
          className="new-products-marquee pb-3 pt-1"
          role="region"
          aria-label="Latest pieces"
        >
          <div ref={trackRef} className="new-products-track flex w-max">
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
          className="pointer-events-none absolute right-0 top-1 bottom-3 w-12 bg-gradient-to-l from-white via-white/80 to-transparent sm:w-24"
          aria-hidden
        />
      </div>
    </section>
  );
}
