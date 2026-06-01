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
const RESUME_AFTER_TOUCH_MS = 500;

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
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    let segmentWidth = origCopy.offsetWidth;
    let offset = 0;
    let paused = false;
    let interacting = false;
    let rafId = 0;
    let lastTime = 0;
    let resumeTimer = 0;
    let touchStartX = 0;
    let touchStartOffset = 0;

    const applyTransform = () => {
      track.style.transform = `translate3d(${offset}px, 0, 0)`;
    };

    const normalizeOffset = () => {
      if (segmentWidth <= 0) return;
      while (offset <= -segmentWidth * 2) {
        offset += segmentWidth;
      }
      while (offset > 0) {
        offset -= segmentWidth;
      }
    };

    const centerOffset = () => {
      offset = -segmentWidth;
      normalizeOffset();
      applyTransform();
    };

    const pause = () => {
      paused = true;
    };

    const scheduleResume = () => {
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => {
        interacting = false;
        paused = false;
        normalizeOffset();
        applyTransform();
        lastTime = 0;
      }, RESUME_AFTER_TOUCH_MS);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      interacting = true;
      paused = true;
      window.clearTimeout(resumeTimer);
      touchStartX = event.touches[0].clientX;
      touchStartOffset = offset;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!interacting || event.touches.length !== 1) return;
      const deltaX = event.touches[0].clientX - touchStartX;
      offset = touchStartOffset + deltaX;
      applyTransform();
    };

    const onTouchEnd = () => {
      if (!interacting) return;
      normalizeOffset();
      applyTransform();
      scheduleResume();
    };

    const tick = (time: number) => {
      if (!lastTime) lastTime = time;
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (!paused && !interacting && !reducedMotion && segmentWidth > 0) {
        const speed = segmentWidth / LOOP_SECONDS;
        offset -= speed * dt;
        if (offset <= -segmentWidth * 2) {
          offset += segmentWidth;
        }
        applyTransform();
      }

      rafId = window.requestAnimationFrame(tick);
    };

    track.style.willChange = "transform";
    centerOffset();

    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = origCopy.offsetWidth;
      if (nextWidth > 0 && nextWidth !== segmentWidth) {
        segmentWidth = nextWidth;
        if (!interacting) {
          centerOffset();
        }
      }
    });
    resizeObserver.observe(origCopy);

    marquee.addEventListener("touchstart", onTouchStart, { passive: true });
    marquee.addEventListener("touchmove", onTouchMove, { passive: true });
    marquee.addEventListener("touchend", onTouchEnd, { passive: true });
    marquee.addEventListener("touchcancel", onTouchEnd, { passive: true });

    const onMouseEnter = () => {
      paused = true;
    };
    const onMouseLeave = () => {
      paused = false;
      lastTime = 0;
    };

    if (!isTouchDevice) {
      marquee.addEventListener("mouseenter", onMouseEnter);
      marquee.addEventListener("mouseleave", onMouseLeave);
    }

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(resumeTimer);
      resizeObserver.disconnect();
      track.style.willChange = "";
      track.style.transform = "";
      marquee.removeEventListener("touchstart", onTouchStart);
      marquee.removeEventListener("touchmove", onTouchMove);
      marquee.removeEventListener("touchend", onTouchEnd);
      marquee.removeEventListener("touchcancel", onTouchEnd);
      if (!isTouchDevice) {
        marquee.removeEventListener("mouseenter", onMouseEnter);
        marquee.removeEventListener("mouseleave", onMouseLeave);
      }
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
