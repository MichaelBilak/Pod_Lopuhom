"use client";

import { useState, useRef, useEffect } from "react";
import type { Product, ProductImage } from "@/lib/supabase-products";
import type { ProductFormState } from "./ProductForm";
import ProductForm from "./ProductForm";
import ProductList from "./ProductList";

type AdminClientProps = {
  initialProducts: Product[];
};

export default function AdminClient({ initialProducts }: AdminClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [formProduct, setFormProduct] = useState<Product | null | "add">(null);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const editPanelRef = useRef<HTMLElement | null>(null);
  const lastFormKeyRef = useRef<string | null>(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flashProduct = (id: string) => {
    setHighlightedId(id);
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedId(null);
      highlightTimeoutRef.current = null;
    }, 2200);
  };

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    };
  }, []);

  // Scroll into view only on a real "open" transition (click Add or Edit, or
  // switch from one product to another). Don't scroll when the same product
  // is re-set after save / image upload / reorder — keeps the user where they
  // were on the page.
  useEffect(() => {
    const currentKey =
      formProduct === null
        ? null
        : formProduct === "add"
          ? "add"
          : formProduct.id;
    if (currentKey === null) {
      lastFormKeyRef.current = null;
      return;
    }
    const previousKey = lastFormKeyRef.current;
    lastFormKeyRef.current = currentKey;
    if (previousKey === currentKey) return;
    if (previousKey === "add") return; // just created the product — stay in flow
    if (editPanelRef.current) {
      editPanelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [formProduct]);

  const canDiscardChanges = () => {
    if (!isFormDirty) return true;
    return window.confirm(
      "You have unsaved changes. Discard them and continue?"
    );
  };

  const openAddForm = () => {
    if (!canDiscardChanges()) return;
    setFormProduct("add");
  };

  const openEditForm = (product: Product) => {
    if (!canDiscardChanges()) return;
    setFormProduct(product);
  };

  const closeForm = () => {
    if (!canDiscardChanges()) return;
    setFormProduct(null);
    setIsFormDirty(false);
  };

  const handleSave = async (
    payload: ProductFormState,
    images: ProductImage[]
  ) => {
    setMessage(null);
    setIsBusy(true);
    try {
      const num = (v: string) => (v === "" ? null : parseFloat(v));
      const body = {
        title: payload.title,
        slug: payload.slug,
        description: payload.description || null,
        description_ru: payload.description_ru || null,
        description_it: payload.description_it || null,
        price: payload.price ? num(payload.price) : null,
        discount: payload.discount ? num(payload.discount) : 0,
        category: payload.category,
        collection: payload.collection,
        price_on_request: payload.price_on_request,
        is_active: payload.is_active,
        is_new: payload.is_new,
        sort_order: payload.sort_order ? parseInt(payload.sort_order, 10) : 0,
      };

      if (formProduct === "add" || !formProduct?.id) {
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...body,
            images: images.map((img) => ({
              imageUrl: img.image_url,
              altText: img.alt_text,
              objectPosition: img.object_position ?? null,
            })),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message ?? "Create failed");
        const product = data.product as Product;
        setProducts((prev) => [...prev, product]);
        setFormProduct(product);
        flashProduct(product.id);
        setMessage("Product created. You can add images above.");
      } else {
        const previous = formProduct;
        const res = await fetch(`/api/admin/products/${formProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...body,
            imageIds: images.map((img) => img.id),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message ?? "Update failed");
        const product = data.product as Product;
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? product : p))
        );
        setFormProduct(product);
        flashProduct(product.id);
        const categoryChanged = previous.category !== product.category;
        const collectionChanged =
          (previous.collection ?? "Herbarium") !== (product.collection ?? "Herbarium");
        setMessage(
          collectionChanged
            ? `Product moved to collection «${product.collection ?? "Herbarium"}».`
            : categoryChanged
              ? `Product moved to category «${product.category ?? "Uncategorized"}».`
              : "Product updated."
        );
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsBusy(false);
    }
  };

  const refetchProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`);
      const data = await res.json();
      if (res.ok && data?.product) {
        setFormProduct(data.product);
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? data.product : p))
        );
      }
    } catch {
      // ignore
    }
  };

  const handleReorder = async (orderedIds: string[]) => {
    const previousProducts = products;
    const byId = new Map(previousProducts.map((p) => [p.id, p] as const));
    const next: Product[] = [];
    for (const id of orderedIds) {
      const p = byId.get(id);
      if (p) {
        next.push({ ...p, sort_order: next.length });
        byId.delete(id);
      }
    }
    for (const p of byId.values()) next.push(p);
    setProducts(next);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/products/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map((p) => p.id) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? "Reorder failed");
      }
    } catch (e) {
      setProducts(previousProducts);
      setMessage(e instanceof Error ? e.message : "Reorder failed.");
    }
  };

  const handleDelete = async (product: Product) => {
    const ok = window.confirm(
      `Delete "${product.title}"? This will remove the product and all its images.`
    );
    if (!ok) return;
    setMessage(null);
    const previousProducts = products;
    const previousFormProduct = formProduct;
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    if (
      formProduct &&
      formProduct !== "add" &&
      formProduct.id === product.id
    ) {
      setFormProduct(null);
      setIsFormDirty(false);
    }
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? "Delete failed");
      }
      setMessage("Product deleted.");
    } catch (e) {
      setProducts(previousProducts);
      setFormProduct(previousFormProduct);
      setMessage(e instanceof Error ? e.message : "Delete failed.");
    }
  };

  return (
    <div className="mt-10 space-y-10">
      {message && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      )}

      {formProduct !== null ? (
        <section
          ref={editPanelRef}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            {formProduct === "add" ? "New product" : "Edit product"}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {formProduct === "add"
              ? "Fill in the fields and save to create. Then add images."
              : "Update fields and image order, then save."}
          </p>
          <div className="mt-6">
            <ProductForm
              product={formProduct === "add" ? null : formProduct}
              onSave={handleSave}
              onCancel={closeForm}
              onDirtyChange={setIsFormDirty}
              onProductImagesChange={(imgs) => {
                setFormProduct((prev) =>
                  prev && prev !== "add" ? { ...prev, images: imgs } : prev
                );
              }}
              onImageNotFound={
                formProduct !== "add" && formProduct?.id
                  ? () => refetchProduct(formProduct.id)
                  : undefined
              }
              isBusy={isBusy}
            />
          </div>
        </section>
      ) : null}

      <ProductList
        products={products}
        highlightedId={highlightedId}
        onAdd={openAddForm}
        onEdit={openEditForm}
        onDelete={handleDelete}
        onReorder={handleReorder}
      />
    </div>
  );
}
