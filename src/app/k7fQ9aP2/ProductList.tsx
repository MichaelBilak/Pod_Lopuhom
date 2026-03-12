"use client";

import type { Product } from "@/lib/supabase-products";

type ProductListProps = {
  products: Product[];
  onAdd: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

function formatPrice(p: Product): string {
  if (p.price_on_request) return "On request";
  if (p.price != null) {
    if (p.discount && p.discount > 0) {
      const discounted = Number(p.price) * (1 - Number(p.discount) / 100);
      return `€${discounted.toFixed(2)} (was €${Number(p.price).toFixed(2)})`;
    }
    return `€${Number(p.price).toFixed(2)}`;
  }
  return "—";
}

export default function ProductList({
  products,
  onAdd,
  onEdit,
  onDelete,
}: ProductListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 px-5 py-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Products ({products.length})
        </span>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Add product
        </button>
      </div>
      <div className="divide-y divide-slate-100">
        {products.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-slate-500">
            No products yet. Click "Add product" to create one.
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="flex flex-wrap items-center gap-4 px-5 py-4 transition hover:bg-slate-50/50"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {product.images[0] ? (
                  <img
                    src={product.images[0].image_url}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                    No image
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-slate-900">
                    {product.title}
                  </span>
                  {!product.is_active && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                      Hidden
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500">{product.slug}</div>
                <div className="mt-0.5 text-sm text-slate-600">
                  {formatPrice(product)}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(product)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(product)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:border-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
