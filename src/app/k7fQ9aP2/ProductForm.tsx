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
  description_it: string;
  price: string;
  discount: string;
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
  description_it: "",
  price: "",
  discount: "0",
  category: "Rings",
  price_on_request: false,
  is_active: true,
  is_new: false,
  sort_order: "0",
};

const toFormState = (product: Product): ProductFormState => ({
  title: product.title,
  slug: product.slug,
  description: product.description ?? "",
  description_ru: product.description_ru ?? "",
  description_it: product.description_it ?? "",
  price: product.price != null ? String(product.price) : "",
  discount: String(product.discount ?? 0),
  category: product.category ?? "Rings",
  price_on_request: product.price_on_request,
  is_active: product.is_active,
  is_new: product.is_new ?? false,
  sort_order: String(product.sort_order ?? 0),
});

type ProductFormProps = {
  product: Product | null;
  onSave: (payload: ProductFormState, images: ProductImage[]) => Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  /** Keeps admin parent `formProduct.images` in sync after upload/reorder/delete */
  onProductImagesChange?: (images: ProductImage[]) => void;
  onImageNotFound?: () => void;
  isBusy: boolean;
};

export default function ProductForm({
  product,
  onSave,
  onCancel,
  onDirtyChange,
  onProductImagesChange,
  onImageNotFound,
  isBusy,
}: ProductFormProps) {
  const isEdit = Boolean(product?.id);
  const [form, setForm] = useState<ProductFormState>(
    product ? toFormState(product) : { ...emptyForm }
  );
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);

  // Keep form values in sync when switching between products (or opening "new").
  useEffect(() => {
    if (!product?.id) {
      setForm({ ...emptyForm });
      return;
    }
    setForm(toFormState(product));
  }, [product?.id, product?.updated_at]);

  // Sync from server only when switching product or after save (updated_at changes).
  // Do NOT depend on product.images reference alone — it can reset after upload and wipe
  // locally added images before the parent state is updated.
  useEffect(() => {
    if (!product?.id) {
      setImages([]);
      return;
    }
    setImages(product.images ?? []);
  }, [product?.id, product?.updated_at]);

  useEffect(() => {
    const initialForm = product ? toFormState(product) : emptyForm;
    const initialImages = (product?.images ?? []).map((img) => ({
      id: img.id,
      image_url: img.image_url,
      object_position: img.object_position ?? null,
    }));
    const currentImages = images.map((img) => ({
      id: img.id,
      image_url: img.image_url,
      object_position: img.object_position ?? null,
    }));
    const isDirty =
      JSON.stringify(form) !== JSON.stringify(initialForm) ||
      JSON.stringify(currentImages) !== JSON.stringify(initialImages);
    onDirtyChange?.(isDirty);
  }, [form, images, product, onDirtyChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form, images);
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

      <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Описание
        </p>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">
            Описание для английской версии сайта
          </span>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={3}
            placeholder="Description (EN)"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">
            Описание для русской версии сайта
          </span>
          <textarea
            value={form.description_ru}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description_ru: e.target.value }))
            }
            rows={3}
            placeholder="Описание (RU)"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">
            Описание для итальянской версии сайта
          </span>
          <textarea
            value={form.description_it}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description_it: e.target.value }))
            }
            rows={3}
            placeholder="Descrizione (IT)"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        onImagesChange={(next) => {
          setImages(next);
          onProductImagesChange?.(next);
        }}
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
