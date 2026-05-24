"use client";

import {
  productDisplayPrice,
} from "@/lib/products";
import type { ProductFormState } from "./ProductForm";
import type { ProductImage } from "@/lib/supabase-products";
import ProductImagePlaceholder from "@/src/components/ProductImagePlaceholder";

type ProductPreviewProps = {
  form: ProductFormState;
  images: ProductImage[];
};

/** Build a product-like object from form + images for display helpers */
function previewProduct(
  form: ProductFormState,
  images: ProductImage[]
): {
  price: number | null;
  discount: number;
  price_on_request: boolean;
  title: string;
  images: ProductImage[];
} {
  const priceNum = form.price ? parseFloat(form.price) : null;
  const discountNum = form.discount ? parseFloat(form.discount) : 0;
  return {
    title: form.title || "Product title",
    price: priceNum != null && Number.isFinite(priceNum) ? priceNum : null,
    discount: Number.isFinite(discountNum) ? discountNum : 0,
    price_on_request: form.price_on_request,
    images,
  };
}

function mainImageUrl(images: ProductImage[]): string | undefined {
  return images[0]?.image_url;
}

function mainObjectPosition(images: ProductImage[]): string {
  const pos = images[0]?.object_position;
  return pos && /^\d+(\.\d+)?% \d+(\.\d+)?%$/.test(pos) ? pos : "50% 50%";
}

export default function ProductPreview({ form, images }: ProductPreviewProps) {
  const product = previewProduct(form, images);
  const mainUrl = mainImageUrl(images);
  const objectPosition = mainObjectPosition(images);
  const priceText = productDisplayPrice(product as Parameters<typeof productDisplayPrice>[0]);

  const imagesWithPosition = images.map((img) => ({
    url: img.image_url,
    objectPosition: img.object_position && /^\d+(\.\d+)?% \d+(\.\d+)?%$/.test(img.object_position)
      ? img.object_position
      : "50% 50%",
  }));

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 lg:p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Preview — as users will see
      </p>

      {/* Card (gallery / home block) */}
      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-slate-400">
          Card (gallery &amp; home)
        </p>
        <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="relative h-40 w-full overflow-hidden rounded-t-2xl bg-slate-50/60">
            {mainUrl ? (
              <img
                src={mainUrl}
                alt=""
                className="h-full w-full object-cover"
                style={{ objectPosition }}
              />
            ) : (
              <ProductImagePlaceholder className="h-full w-full" aria-hidden />
            )}
          </div>
          <div className="flex items-center justify-between gap-2 px-3 py-2.5">
            <span className="text-sm font-semibold text-slate-900">
              {priceText || "—"}
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
              View details
            </span>
          </div>
        </article>
      </div>

      {/* Product page (main image + thumbnails + info) */}
      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-slate-400">
          Product page
        </p>
        <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
          <div className="flex gap-2">
            {imagesWithPosition.length > 0 ? (
              <>
                <div className="flex flex-col gap-1">
                  {imagesWithPosition.slice(0, 3).map((img, i) => (
                    <div
                      key={i}
                      className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="h-full w-full object-cover"
                        style={{ objectPosition: img.objectPosition }}
                      />
                    </div>
                  ))}
                </div>
                <div className="min-w-0 flex-1 aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <img
                    src={imagesWithPosition[0].url}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ objectPosition: imagesWithPosition[0].objectPosition }}
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 aspect-square">
                <ProductImagePlaceholder className="h-16 w-16 opacity-50" aria-hidden />
              </div>
            )}
          </div>
          <h3 className="mt-2 truncate text-sm font-semibold text-slate-900">
            {form.title || "Product title"}
          </h3>
          <p className="mt-0.5 whitespace-pre-line text-xs text-slate-600">
            {form.description || "No description."}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{priceText || "—"}</p>
        </div>
      </div>
    </div>
  );
}
