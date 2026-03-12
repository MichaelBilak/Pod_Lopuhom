"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
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

export default function NewProductsScroll({
  products,
  newLabel,
  newTitle,
  viewDetails,
}: NewProductsScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showRightFade, setShowRightFade] = useState(false);

  const checkOverflow = () => {
    const el = scrollRef.current;
    if (!el) return;
    const hasMore = el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
    setShowRightFade(hasMore);
  };

  useEffect(() => {
    checkOverflow();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(checkOverflow);
    ro.observe(el);
    el.addEventListener("scroll", checkOverflow);
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", checkOverflow);
    };
  }, [products.length]);

  if (products.length === 0) return null;

  return (
    <section className="space-y-8">
      <div className="text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-slate-400">
          {newLabel}
        </p>
        <h2 className="mt-1.5 text-2xl font-medium tracking-tight text-slate-800">
          {newTitle}
        </h2>
      </div>
      <div className="relative -mx-6 px-6">
        <div
          ref={scrollRef}
          className="new-products-scroll flex gap-5 overflow-x-auto scroll-smooth pb-3 pt-1"
          role="region"
          aria-label="Latest pieces"
        >
          {products.map((product) => (
            <article
              key={product.id}
              className="group w-[248px] flex-shrink-0 overflow-hidden rounded-2xl border border-slate-100/90 bg-white transition-shadow duration-200 hover:shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
            >
              <Link
                href={`/products/${product.slug}`}
                className="flex h-full w-full flex-col rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                aria-label={`Open ${product.title} details`}
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-2xl bg-slate-50/80">
                  {productMainImageUrl(product) ? (
                    <img
                      src={productMainImageUrl(product)}
                      alt={product.title}
                      className="h-full w-full object-cover object-center transition duration-500 ease-out group-hover:scale-[1.03]"
                      style={{
                        objectPosition: productMainImageObjectPosition(product),
                      }}
                      loading="eager"
                      decoding="async"
                    />
                  ) : (
                    <ProductImagePlaceholder
                      className="h-full w-full"
                      aria-label={product.title}
                    />
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
                <div className="flex flex-1 flex-col gap-1.5 px-3 pb-3 pt-2">
                  <p className="truncate text-sm font-medium tracking-tight text-slate-800">
                    {product.title}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {productDisplayPrice(product)}
                    </span>
                    <span className="shrink-0 text-[10px] uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-600">
                      {viewDetails}
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
        {showRightFade && (
          <div
            className="pointer-events-none absolute right-0 top-1 bottom-3 w-24 bg-gradient-to-l from-white via-white/80 to-transparent"
            aria-hidden
          />
        )}
      </div>
    </section>
  );
}
