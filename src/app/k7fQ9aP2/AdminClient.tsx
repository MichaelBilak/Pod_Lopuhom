"use client";

import { useState, useRef, useEffect } from "react";
import type { Product } from "@/lib/supabase-products";
import type { ProductFormState } from "./ProductForm";
import ProductForm from "./ProductForm";
import ProductList from "./ProductList";

type AdminClientProps = {
  initialProducts: Product[];
};

export default function AdminClient({ initialProducts }: AdminClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [formProduct, setFormProduct] = useState<Product | null | "add">(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const editPanelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (formProduct !== null && editPanelRef.current) {
      editPanelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [formProduct]);

  const handleSave = async (
    payload: ProductFormState,
    imageIds: string[]
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
        price: payload.price ? num(payload.price) : null,
        discount: payload.discount ? num(payload.discount) : 0,
        materials: payload.materials || null,
        category: payload.category,
        price_on_request: payload.price_on_request,
        is_active: payload.is_active,
        is_new: payload.is_new,
        sort_order: payload.sort_order ? parseInt(payload.sort_order, 10) : 0,
      };

      if (formProduct === "add" || !formProduct?.id) {
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message ?? "Create failed");
        const product = data.product as Product;
        setProducts((prev) => [...prev, product]);
        setFormProduct(product);
        setMessage("Product created. You can add images above.");
      } else {
        const res = await fetch(`/api/admin/products/${formProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, imageIds }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message ?? "Update failed");
        const product = data.product as Product;
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? product : p))
        );
        setFormProduct(product);
        setMessage("Product updated.");
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

  const handleDelete = async (product: Product) => {
    const ok = window.confirm(
      `Delete "${product.title}"? This will remove the product and all its images.`
    );
    if (!ok) return;
    setMessage(null);
    setIsBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Delete failed");
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      if (
        formProduct &&
        formProduct !== "add" &&
        formProduct.id === product.id
      )
        setFormProduct(null);
      setMessage("Product deleted.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setIsBusy(false);
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
              onCancel={() => setFormProduct(null)}
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
        onAdd={() => setFormProduct("add")}
        onEdit={(p) => setFormProduct(p)}
        onDelete={handleDelete}
      />
    </div>
  );
}
