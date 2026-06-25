"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  COLLECTIONS,
  type CollectionId,
} from "@/src/lib/collections";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Product } from "@/lib/supabase-products";
import { adminProductImageSrc } from "@/lib/admin-images";

type ProductListProps = {
  products: Product[];
  highlightedId?: string | null;
  onAdd: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onReorder?: (orderedIds: string[]) => void;
};

const CATEGORY_ORDER = ["Necklaces", "Rings", "Earrings", "Sets"] as const;
const UNCATEGORIZED = "Uncategorized";

type CollectionFilter = "all" | CollectionId;

type CollectionGroup = {
  collection: CollectionId;
  categories: Array<{ category: string; products: Product[] }>;
};

function categoryOrder(name: string) {
  const idx = (CATEGORY_ORDER as readonly string[]).indexOf(name);
  if (idx !== -1) return idx;
  if (name === UNCATEGORIZED) return Number.MAX_SAFE_INTEGER;
  return CATEGORY_ORDER.length;
}

function groupProducts(products: Product[]): CollectionGroup[] {
  const byCollection = new Map<string, Map<string, Product[]>>();

  for (const product of products) {
    const collection =
      product.collection && product.collection.trim().length > 0
        ? product.collection
        : "Herbarium";
    const category =
      product.category && product.category.trim().length > 0
        ? product.category
        : UNCATEGORIZED;

    if (!byCollection.has(collection)) {
      byCollection.set(collection, new Map());
    }
    const categories = byCollection.get(collection)!;
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(product);
  }

  return COLLECTIONS.map((collection) => {
    const categories = byCollection.get(collection);
    if (!categories) {
      return { collection, categories: [] };
    }
    return {
      collection,
      categories: Array.from(categories.entries())
        .sort(([a], [b]) => categoryOrder(a) - categoryOrder(b))
        .map(([category, list]) => ({ category, products: list })),
    };
  }).filter((group) => group.categories.length > 0);
}

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

function collectionBadgeClass(collection: string) {
  return collection === "Folia"
    ? "bg-emerald-100 text-emerald-800"
    : "bg-sky-100 text-sky-800";
}

function productCollection(product: Product): CollectionId {
  const value = product.collection?.trim();
  return value === "Folia" ? "Folia" : "Herbarium";
}

type SortableRowProps = {
  product: Product;
  highlighted: boolean;
  draggable: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  registerRef: (id: string, el: HTMLDivElement | null) => void;
};

function SortableRow({
  product,
  highlighted,
  draggable,
  onEdit,
  onDelete,
  registerRef,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id, disabled: !draggable });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : "auto",
  };

  return (
    <div
      ref={(el) => {
        setNodeRef(el);
        registerRef(product.id, el);
      }}
      style={style}
      {...attributes}
      className={`relative flex flex-wrap items-center gap-4 bg-white px-5 py-4 transition-[background-color,box-shadow] duration-200 hover:bg-slate-50/50 ${
        highlighted
          ? "bg-amber-50 ring-2 ring-inset ring-amber-300"
          : ""
      } ${
        isDragging
          ? "shadow-[0_18px_36px_rgba(15,23,42,0.18)] ring-1 ring-slate-200 cursor-grabbing"
          : ""
      }`}
    >
      {draggable && (
        <button
          type="button"
          aria-label="Drag to reorder"
          title="Drag to reorder"
          {...listeners}
          className="flex h-8 w-5 shrink-0 cursor-grab touch-none items-center justify-center text-slate-400 transition hover:text-slate-700 active:cursor-grabbing"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden
          >
            <circle cx="7" cy="5" r="1.2" />
            <circle cx="7" cy="10" r="1.2" />
            <circle cx="7" cy="15" r="1.2" />
            <circle cx="13" cy="5" r="1.2" />
            <circle cx="13" cy="10" r="1.2" />
            <circle cx="13" cy="15" r="1.2" />
          </svg>
        </button>
      )}
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        {product.images[0] ? (
          <img
            src={adminProductImageSrc(product.images[0].image_url, "thumb")}
            alt={product.title}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
            No image
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-slate-900">{product.title}</span>
          <span
            className={[
              "rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
              collectionBadgeClass(productCollection(product)),
            ].join(" ")}
          >
            {productCollection(product)}
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
  );
}

type SortableCategorySectionProps = {
  list: Product[];
  highlightedId?: string | null;
  draggable: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  registerRef: (id: string, el: HTMLDivElement | null) => void;
  onDragEnd: (event: DragEndEvent) => void;
};

function SortableCategorySection({
  list,
  highlightedId,
  draggable,
  onEdit,
  onDelete,
  registerRef,
  onDragEnd,
}: SortableCategorySectionProps) {
  const dndId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    })
  );
  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={list.map((p) => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="divide-y divide-slate-100">
          {list.map((product) => (
            <SortableRow
              key={product.id}
              product={product}
              highlighted={highlightedId === product.id}
              draggable={draggable}
              onEdit={onEdit}
              onDelete={onDelete}
              registerRef={registerRef}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export default function ProductList({
  products,
  highlightedId,
  onAdd,
  onEdit,
  onDelete,
  onReorder,
}: ProductListProps) {
  const [collectionFilter, setCollectionFilter] = useState<CollectionFilter>("all");
  const grouped = useMemo(() => groupProducts(products), [products]);
  const filteredGroups = useMemo(() => {
    if (collectionFilter === "all") return grouped;
    return grouped.filter((group) => group.collection === collectionFilter);
  }, [grouped, collectionFilter]);

  const collectionCounts = useMemo(() => {
    const counts: Record<CollectionId, number> = { Herbarium: 0, Folia: 0 };
    for (const product of products) {
      counts[productCollection(product)] += 1;
    }
    return counts;
  }, [products]);

  const rowRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  const registerRef = (id: string, el: HTMLDivElement | null) => {
    if (el) rowRefs.current.set(id, el);
    else rowRefs.current.delete(id);
  };

  useEffect(() => {
    if (!highlightedId) return;
    const el = rowRefs.current.get(highlightedId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightedId]);

  const handleDragEnd = (event: DragEndEvent, categoryProducts: Product[]) => {
    const { active, over } = event;
    if (!onReorder || !over || active.id === over.id) return;
    const oldIndex = categoryProducts.findIndex((p) => p.id === active.id);
    const newIndex = categoryProducts.findIndex((p) => p.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(categoryProducts, oldIndex, newIndex);
    const newGlobalOrder: string[] = [];
    for (const group of grouped) {
      for (const section of group.categories) {
        if (section.products === categoryProducts) {
          for (const p of reordered) newGlobalOrder.push(p.id);
        } else {
          for (const p of section.products) newGlobalOrder.push(p.id);
        }
      }
    }
    onReorder(newGlobalOrder);
  };

  const filterOptions: Array<{ id: CollectionFilter; label: string; count: number }> = [
    { id: "all", label: "All", count: products.length },
    { id: "Herbarium", label: "Herbarium", count: collectionCounts.Herbarium },
    { id: "Folia", label: "Folia", count: collectionCounts.Folia },
  ];

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
      {products.length > 0 ? (
        <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-white px-5 py-3">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setCollectionFilter(option.id)}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                collectionFilter === option.id
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900",
              ].join(" ")}
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>
      ) : null}
      {products.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-slate-500">
          No products yet. Click &quot;Add product&quot; to create one.
        </div>
      ) : (
        <div>
          {filteredGroups.map((group) => (
            <section key={group.collection}>
              <div className="border-y border-[#74939f]/30 bg-[#74939f]/10 px-5 py-3">
                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-800">
                  {group.collection}
                </span>
              </div>
              {group.categories.map(({ category, products: list }) => (
                <div key={`${group.collection}-${category}`}>
                  <div className="admin-sticky-shell sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-slate-200 bg-slate-100/95 px-5 py-2 backdrop-blur">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                      {category}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      {list.length}
                    </span>
                  </div>
                  <SortableCategorySection
                    list={list}
                    highlightedId={highlightedId}
                    draggable={Boolean(onReorder)}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    registerRef={registerRef}
                    onDragEnd={(e) => handleDragEnd(e, list)}
                  />
                </div>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
