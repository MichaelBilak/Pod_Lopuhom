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

const MARQUEE_DURATION_SEC = 48;
const MOBILE_MQ = "(max-width: 639px)";
const SCROLL_SETTLE_MS = 120;

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

    const mobileQuery = window.matchMedia(MOBILE_MQ);
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    let rafId = 0;
    let lastTime = 0;
    let segmentWidth = 0;
    let initialized = false;
    let isTouching = false;
    let isUserScrolling = false;
    let scrollEndTimer: ReturnType<typeof setTimeout> | null = null;

    const getOrigSegment = () =>
      marquee.querySelector<HTMLElement>('[data-copy="orig"]');

    const measureSegment = () => {
      segmentWidth = getOrigSegment()?.offsetWidth ?? 0;
      return segmentWidth;
    };

    const normalizeScroll = () => {
      if (segmentWidth <= 0) return;
      if (marquee.scrollLeft >= segmentWidth * 2 - 1) {
        marquee.scrollLeft -= segmentWidth;
      } else if (marquee.scrollLeft <= 1) {
        marquee.scrollLeft += segmentWidth;
      }
    };

    const initMobileScroll = () => {
      if (!mobileQuery.matches || segmentWidth <= 0) return;
      marquee.scrollLeft = segmentWidth;
      initialized = true;
    };

    const scheduleScrollEnd = () => {
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => {
        isUserScrolling = false;
        normalizeScroll();
      }, SCROLL_SETTLE_MS);
    };

    const tick = (time: number) => {
      rafId = requestAnimationFrame(tick);

      if (!mobileQuery.matches || !initialized || segmentWidth <= 0) return;

      const dt = lastTime ? (time - lastTime) / 1000 : 0;
      lastTime = time;

      if (
        !isTouching &&
        !isUserScrolling &&
        !reducedMotionQuery.matches
      ) {
        marquee.scrollLeft += (segmentWidth / MARQUEE_DURATION_SEC) * dt;
        normalizeScroll();
      }
    };

    const onTouchStart = () => {
      if (!mobileQuery.matches) return;
      isTouching = true;
      isUserScrolling = true;
    };

    const onTouchEnd = () => {
      if (!mobileQuery.matches) return;
      isTouching = false;
      normalizeScroll();
      scheduleScrollEnd();
    };

    const onScroll = () => {
      if (!mobileQuery.matches) return;
      if (isTouching || isUserScrolling) {
        normalizeScroll();
        scheduleScrollEnd();
      }
    };

    const onScrollEnd = () => {
      if (!mobileQuery.matches) return;
      isUserScrolling = false;
      normalizeScroll();
    };

    const pauseDesktop = () => {
      if (!mobileQuery.matches) marquee.classList.add("is-paused");
    };

    const resumeDesktop = () => {
      if (!mobileQuery.matches) marquee.classList.remove("is-paused");
    };

    const onMobileChange = () => {
      measureSegment();
      if (mobileQuery.matches) {
        marquee.classList.remove("is-paused");
        initMobileScroll();
      } else {
        isTouching = false;
        isUserScrolling = false;
        initialized = false;
        marquee.scrollLeft = 0;
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      const hadSegment = segmentWidth > 0;
      measureSegment();
      if (!mobileQuery.matches || segmentWidth <= 0) return;
      if (!initialized || !hadSegment) {
        initMobileScroll();
      }
    });

    const orig = getOrigSegment();
    if (orig) resizeObserver.observe(orig);

    measureSegment();
    initMobileScroll();
    rafId = requestAnimationFrame(tick);

    marquee.addEventListener("touchstart", onTouchStart, { passive: true });
    marquee.addEventListener("touchend", onTouchEnd, { passive: true });
    marquee.addEventListener("touchcancel", onTouchEnd, { passive: true });
    marquee.addEventListener("scroll", onScroll, { passive: true });
    marquee.addEventListener("scrollend", onScrollEnd, { passive: true });
    marquee.addEventListener("mouseenter", pauseDesktop);
    marquee.addEventListener("mouseleave", resumeDesktop);
    mobileQuery.addEventListener("change", onMobileChange);
    reducedMotionQuery.addEventListener("change", onMobileChange);

    return () => {
      cancelAnimationFrame(rafId);
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      resizeObserver.disconnect();
      marquee.removeEventListener("touchstart", onTouchStart);
      marquee.removeEventListener("touchend", onTouchEnd);
      marquee.removeEventListener("touchcancel", onTouchEnd);
      marquee.removeEventListener("scroll", onScroll);
      marquee.removeEventListener("scrollend", onScrollEnd);
      marquee.removeEventListener("mouseenter", pauseDesktop);
      marquee.removeEventListener("mouseleave", resumeDesktop);
      mobileQuery.removeEventListener("change", onMobileChange);
      reducedMotionQuery.removeEventListener("change", onMobileChange);
      marquee.classList.remove("is-paused");
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
          className="pointer-events-none absolute right-0 top-1 bottom-3 hidden w-12 bg-gradient-to-l from-white via-white/80 to-transparent sm:block sm:w-24"
          aria-hidden
        />
      </div>
    </section>
  );
}
