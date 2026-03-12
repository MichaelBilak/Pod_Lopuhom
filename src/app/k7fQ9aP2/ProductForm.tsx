"use client";

import { useState, useEffect } from "react";
import ImageManager from "./ImageManager";
import ProductPreview from "./ProductPreview";
import type { Product, ProductImage } from "@/lib/supabase-products";

const CATEGORIES = ["Rings", "Necklaces", "Earrings", "Sets"];

export type ProductFormState = {
  title: string;
  slug: string;
  description: string;
  description_ru: string;
  price: string;
  discount: string;
  materials: string;
  category: string;
  price_on_request: boolean;
  is_active: boolean;
  is_new: boolean;
  sort_order: string;
};

const emptyForm: ProductFormState = {
  title: "",
  slug: "",
  description: "",
  description_ru: "",
  price: "",
  discount: "0",
  materials: "",
  category: "Rings",
  price_on_request: false,
  is_active: true,
  is_new: false,
  sort_order: "0",
};

type ProductFormProps = {
  product: Product | null;
  onSave: (payload: ProductFormState, imageIds: string[]) => Promise<void>;
  onCancel: () => void;
  onImageNotFound?: () => void;
  isBusy: boolean;
};

export default function ProductForm({
  product,
  onSave,
  onCancel,
  onImageNotFound,
  isBusy,
}: ProductFormProps) {
  const isEdit = Boolean(product?.id);
  const [form, setForm] = useState<ProductFormState>(
    product
      ? {
          title: product.title,
          slug: product.slug,
          description: product.description ?? "",
          description_ru: product.description_ru ?? "",
          price: product.price != null ? String(product.price) : "",
          discount: String(product.discount ?? 0),
          materials: product.materials ?? "",
          category: product.category ?? "Rings",
          price_on_request: product.price_on_request,
          is_active: product.is_active,
          is_new: product.is_new ?? false,
          sort_order: String(product.sort_order ?? 0),
        }
      : emptyForm
  );
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);

  useEffect(() => {
    if (product?.images) setImages(product.images);
  }, [product?.id, product?.images]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const imageIds = images.map((img) => img.id);
    await onSave(form, imageIds);
  };

  const deriveSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  return (
    <form onSubmit={handleSubmit} className="space-y-6 lg:grid lg:grid-cols-[1fr_320px] lg:gap-8 lg:items-start">
      <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Title
          </span>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                title: e.target.value,
                slug: prev.slug || deriveSlug(e.target.value),
              }))
            }
            onBlur={() => {
              if (!isEdit && !form.slug) {
                setForm((prev) => ({ ...prev, slug: deriveSlug(prev.title) }));
              }
            }}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Slug
          </span>
          <input
            type="text"
            required
            value={form.slug}
            onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Description (EN)
        </span>
        <textarea
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Description (RU)
        </span>
        <textarea
          value={form.description_ru}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, description_ru: e.target.value }))
          }
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Price
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={form.price}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, price: e.target.value }))
            }
            disabled={form.price_on_request}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none disabled:bg-slate-50"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Discount
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={form.discount}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, discount: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Materials
          </span>
          <input
            type="text"
            value={form.materials}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, materials: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Category
          </span>
          <select
            value={form.category}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, category: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.price_on_request}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                price_on_request: e.target.checked,
              }))
            }
            className="h-4 w-4 rounded border-slate-300 text-slate-900"
          />
          <span className="text-sm text-slate-700">Price on request</span>
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, is_active: e.target.checked }))
            }
            className="h-4 w-4 rounded border-slate-300 text-slate-900"
          />
          <span className="text-sm text-slate-700">Visible on site</span>
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.is_new}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, is_new: e.target.checked }))
            }
            className="h-4 w-4 rounded border-slate-300 text-slate-900"
          />
          <span className="text-sm text-slate-700">Show in New / Latest pieces (home)</span>
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Sort order
        </span>
        <input
          type="number"
          min={0}
          value={form.sort_order}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, sort_order: e.target.value }))
          }
          className="mt-1 w-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
        />
      </label>

      <ImageManager
        productId={product?.id ?? null}
        images={images}
        onImagesChange={setImages}
        onImageNotFound={onImageNotFound}
        disabled={isBusy}
      />

      <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isBusy}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {isBusy ? "Saving…" : isEdit ? "Save changes" : "Create product"}
        </button>
      </div>
      </div>

      <div className="lg:sticky lg:top-6">
        <ProductPreview form={form} images={images} />
      </div>
    </form>
  );
}
