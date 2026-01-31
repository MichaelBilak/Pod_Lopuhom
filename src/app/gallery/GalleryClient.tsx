"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Product } from "../../../lib/products";

type GalleryClientProps = {
  products: Product[];
};

const categories = ["All", "Rings", "Necklaces", "Earrings"] as const;

const imageFocus: Record<string, string> = {
  "/images/products/product_7.0.JPG": "35% 55%",
};

const getObjectPosition = (src: string) => imageFocus[src] ?? "50% 50%";

const getCategoryFromImage = (image?: string | null) => {
  if (!image) return "Rings";
  const normalized = image.toLowerCase();
  if (normalized.includes("earrings_")) return "Earrings";
  if (normalized.includes("necklaces_")) return "Necklaces";
  return "Rings";
};

export default function GalleryClient({ products }: GalleryClientProps) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get("category");
  const [selected, setSelected] = useState<string>(
    initialCategory && categories.includes(initialCategory as (typeof categories)[number])
      ? initialCategory
      : "All"
  );

  const filteredProducts = useMemo(() => {
    if (selected === "All") return products;
    return products.filter((product) => {
      const category = getCategoryFromImage(product.images[0]);
      return category === selected;
    });
  }, [products, selected]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-semibold uppercase tracking-[0.34em] text-slate-500">
        {categories.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setSelected(label)}
            className={[
              "border-b border-transparent pb-2 transition hover:border-slate-400 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
              selected === label ? "border-slate-400 text-slate-900" : "",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      <section id="gallery" className="space-y-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <article
              key={product.id}
              className="group overflow-hidden rounded-3xl border border-slate-100 bg-white transition hover:border-slate-200"
            >
              <Link
                href={`/products/${product.slug}`}
                className="flex h-full w-full flex-col gap-3 rounded-3xl p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                aria-label={`Open ${product.title} details`}
              >
                <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-slate-50 sm:h-72 lg:h-80">
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="h-full w-full origin-center rounded-2xl object-cover object-center transition duration-300 group-hover:scale-[1.04]"
                      style={{
                        objectPosition: getObjectPosition(product.images[0]),
                      }}
                      loading="eager"
                      fetchPriority="high"
                    />
                  ) : null}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100"></div>
                </div>
                <div className="flex flex-1 flex-col gap-2 px-1 pb-1">
                  <p className="whitespace-nowrap text-xs font-medium tracking-[0.02em] text-slate-900 sm:text-sm">
                    {product.title}
                  </p>
                  <p className="whitespace-nowrap text-xs text-slate-500 sm:block">
                    {product.materials}
                  </p>
                  <div className="mt-auto flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="whitespace-nowrap text-base font-semibold leading-tight text-slate-900 sm:text-lg">
                      {product.price}
                    </span>
                    <span className="hidden whitespace-nowrap text-[10px] uppercase tracking-[0.22em] text-slate-400 sm:inline sm:text-right">
                      View details
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
