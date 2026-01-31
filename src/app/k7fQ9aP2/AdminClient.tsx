"use client";

import { useMemo, useState } from "react";
import type { Product } from "../../../lib/products";

type FormState = {
  slug: string;
  title: string;
  category: string;
  materials: string;
  price: string;
  description: string;
  images: string;
};

type AdminClientProps = {
  initialProducts: Product[];
};

const emptyForm = (): FormState => ({
  slug: "",
  title: "",
  category: "Rings",
  materials: "",
  price: "",
  description: "",
  images: "",
});

const imagesToTextarea = (images: string[]) => images.join("\n");

const textareaToImages = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

export default function AdminClient({ initialProducts }: AdminClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm());
  const [message, setMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const sortedProducts = useMemo(() => {
    const getSortValue = (value: unknown) => {
      if (typeof value === "string") {
        const parsed = Date.parse(value);
        return Number.isNaN(parsed) ? 0 : parsed;
      }
      if (value instanceof Date) {
        return value.getTime();
      }
      return 0;
    };
    return [...products].sort(
      (a, b) => getSortValue(a.created_at) - getSortValue(b.created_at)
    );
  }, [products]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setIsBusy(true);
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: form.slug,
          title: form.title,
          category: form.category,
          materials: form.materials,
          price: form.price,
          description: form.description,
          images: textareaToImages(form.images),
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message || "Unable to create product.");
      }
      setProducts((prev) => [...prev, payload.product]);
      setForm(emptyForm());
      setMessage("Product created.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to create product."
      );
    } finally {
      setIsBusy(false);
    }
  };

  const handleEditStart = (product: Product) => {
    setEditingId(product.id);
    setEditForm({
      slug: product.slug,
      title: product.title,
      category: product.category ?? "Rings",
      materials: product.materials ?? "",
      price: product.price ?? "",
      description: product.description ?? "",
      images: imagesToTextarea(product.images),
    });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm(emptyForm());
  };

  const handleEditSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingId) return;
    setMessage(null);
    setIsBusy(true);
    try {
      const response = await fetch(`/api/admin/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: editForm.slug,
          title: editForm.title,
          category: editForm.category,
          materials: editForm.materials,
          price: editForm.price,
          description: editForm.description,
          images: textareaToImages(editForm.images),
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message || "Unable to update product.");
      }
      setProducts((prev) =>
        prev.map((item) => (item.id === editingId ? payload.product : item))
      );
      setEditingId(null);
      setEditForm(emptyForm());
      setMessage("Product updated.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to update product."
      );
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(
      `Delete "${product.title}"? This cannot be undone.`
    );
    if (!confirmed) return;
    setMessage(null);
    setIsBusy(true);
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message || "Unable to delete product.");
      }
      setProducts((prev) => prev.filter((item) => item.id !== product.id));
      setMessage("Product deleted.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to delete product."
      );
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="mt-10 space-y-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Create product
            </h2>
            <p className="text-xs text-slate-500">
              Add a new item to the catalog.
            </p>
          </div>
          {message ? (
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
              {message}
            </div>
          ) : null}
        </div>
        <form className="mt-6 grid gap-4" onSubmit={handleCreate}>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-xs text-slate-500">
              Slug
              <input
                value={form.slug}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, slug: event.target.value }))
                }
                required
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
              />
            </label>
            <label className="text-xs text-slate-500">
              Title
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
                required
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
              />
            </label>
            <label className="text-xs text-slate-500">
              Category
              <select
                value={form.category}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, category: event.target.value }))
                }
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
              >
                <option value="Rings">Rings</option>
                <option value="Necklaces">Necklaces</option>
                <option value="Earrings">Earrings</option>
              </select>
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-xs text-slate-500">
              Materials
              <input
                value={form.materials}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    materials: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
              />
            </label>
            <label className="text-xs text-slate-500">
              Price
              <input
                value={form.price}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, price: event.target.value }))
                }
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
              />
            </label>
          </div>
          <label className="text-xs text-slate-500">
            Description
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              rows={3}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
            />
          </label>
          <label className="text-xs text-slate-500">
            Images (one URL per line)
            <textarea
              value={form.images}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, images: event.target.value }))
              }
              rows={4}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={isBusy}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBusy ? "Saving..." : "Create product"}
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
        <div className="flex items-center justify-between bg-slate-50 px-5 py-3">
          <div className="text-xs uppercase tracking-widest text-slate-500">
            Products ({sortedProducts.length})
          </div>
          <div className="text-xs text-slate-500">
            Click a product to edit.
          </div>
        </div>
        <div className="divide-y divide-slate-200">
          {sortedProducts.map((product) => {
            const isEditing = editingId === product.id;
            return (
              <div key={product.id} className="bg-white px-5 py-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-900">
                      {product.title}
                    </div>
                    <div className="text-xs text-slate-500">
                      {product.slug}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        isEditing
                          ? handleEditCancel()
                          : handleEditStart(product)
                      }
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 transition hover:border-slate-300"
                    >
                      {isEditing ? "Cancel" : "Edit"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product)}
                      className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-700 transition hover:border-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {isEditing ? (
                  <form className="mt-6 grid gap-4" onSubmit={handleEditSave}>
                    <div className="grid gap-4 md:grid-cols-3">
                      <label className="text-xs text-slate-500">
                        Slug
                        <input
                          value={editForm.slug}
                          onChange={(event) =>
                            setEditForm((prev) => ({
                              ...prev,
                              slug: event.target.value,
                            }))
                          }
                          required
                          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                        />
                      </label>
                      <label className="text-xs text-slate-500">
                        Title
                        <input
                          value={editForm.title}
                          onChange={(event) =>
                            setEditForm((prev) => ({
                              ...prev,
                              title: event.target.value,
                            }))
                          }
                          required
                          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                        />
                      </label>
                      <label className="text-xs text-slate-500">
                        Category
                        <select
                          value={editForm.category}
                          onChange={(event) =>
                            setEditForm((prev) => ({
                              ...prev,
                              category: event.target.value,
                            }))
                          }
                          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                        >
                          <option value="Rings">Rings</option>
                          <option value="Necklaces">Necklaces</option>
                          <option value="Earrings">Earrings</option>
                        </select>
                      </label>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="text-xs text-slate-500">
                        Materials
                        <input
                          value={editForm.materials}
                          onChange={(event) =>
                            setEditForm((prev) => ({
                              ...prev,
                              materials: event.target.value,
                            }))
                          }
                          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                        />
                      </label>
                      <label className="text-xs text-slate-500">
                        Price
                        <input
                          value={editForm.price}
                          onChange={(event) =>
                            setEditForm((prev) => ({
                              ...prev,
                              price: event.target.value,
                            }))
                          }
                          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                        />
                      </label>
                    </div>
                    <label className="text-xs text-slate-500">
                      Description
                      <textarea
                        value={editForm.description}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            description: event.target.value,
                          }))
                        }
                        rows={3}
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                      />
                    </label>
                    <label className="text-xs text-slate-500">
                      Images (one URL per line)
                      <textarea
                        value={editForm.images}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            images: event.target.value,
                          }))
                        }
                        rows={4}
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                      />
                    </label>
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleEditCancel}
                        className="rounded-full border border-slate-200 px-4 py-2 text-xs text-slate-700 transition hover:border-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isBusy}
                        className="rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isBusy ? "Saving..." : "Save changes"}
                      </button>
                    </div>
                  </form>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
