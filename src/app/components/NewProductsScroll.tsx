"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
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

export default function NewProductsScroll({
  products,
  newLabel,
  newTitle,
  viewDetails,
}: NewProductsScrollProps) {
  const searchParams = useSearchParams();
  const locale = getLocale(searchParams?.get("lang"));

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
        className="group w-[min(298px,calc(100vw-2rem))] shrink-0 overflow-hidden rounded-2xl border border-slate-100/90 bg-white transition-[box-shadow] duration-200 hover:shadow-[0_2px_12px_rgba(15,23,42,0.08)] sm:w-[298px]"
        aria-hidden={duplicate}
      >
        <Link
          href={withLang(`/products/${product.slug}`, locale)}
          className="block h-full w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          aria-label={`Open ${product.title} details`}
          tabIndex={duplicate ? -1 : undefined}
        >
          <div className="relative h-[320px] w-full overflow-hidden rounded-2xl bg-slate-50/60">
            {mainImageUrl ? (
              <Image
                src={mainImageUrl}
                alt={product.title}
                fill
                sizes="(max-width: 640px) calc(100vw - 2rem), 298px"
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
                  isPriceOnRequest ? "text-[11px]" : "text-[17px]",
                ].join(" ")}
              >
                {priceText}
              </span>
              <span className="shrink-0 whitespace-nowrap text-xs uppercase tracking-[0.2em] text-white/80 transition-colors group-hover:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                {viewDetails}
              </span>
            </div>
          </div>
        </Link>
      </article>
    );
  };

  return (
    <section className="min-w-0 space-y-8">
      <div className="text-center">
        <p className="text-[16px] font-medium uppercase tracking-[0.2em] text-slate-400 sm:tracking-[0.28em]">
          {newLabel}
        </p>
      </div>
      <div className="relative -mx-4 min-w-0 px-4 sm:-mx-6 sm:px-6">
        <div
          className="new-products-marquee overflow-hidden pb-3 pt-1"
          role="region"
          aria-label="Latest pieces"
        >
          <div className="new-products-track flex w-max">
            <div className="flex gap-4 pr-4 sm:gap-5 sm:pr-5" aria-hidden>
              {products.map((product, index) => renderCard(product, index, "pre"))}
            </div>
            <div className="flex gap-4 pr-4 sm:gap-5 sm:pr-5">
              {products.map((product, index) => renderCard(product, index, "orig"))}
            </div>
            <div className="flex gap-4 pr-4 sm:gap-5 sm:pr-5" aria-hidden>
              {products.map((product, index) => renderCard(product, index, "post"))}
            </div>
          </div>
        </div>
        <div
          className="pointer-events-none absolute right-0 top-1 bottom-3 w-24 bg-gradient-to-l from-white via-white/80 to-transparent"
          aria-hidden
        />
      </div>
    </section>
  );
}
