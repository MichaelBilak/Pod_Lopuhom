"use client";

import { useCallback, useState } from "react";
import type { ProductImage } from "@/lib/supabase-products";
import ImagePositionEditor from "./ImagePositionEditor";

type ImageManagerProps = {
  productId: string | null;
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  disabled?: boolean;
};

export default function ImageManager({
  productId,
  images,
  onImagesChange,
  disabled,
}: ImageManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [adjustImageId, setAdjustImageId] = useState<string | null>(null);

  const uploadFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length || !productId) return;
      setUploading(true);
      try {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
          formData.append("files", files[i]);
        }
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
        const { urls } = await res.json();
        const startOrder = images.length;
        let nextImages = [...images];
        for (let i = 0; i < urls.length; i++) {
          const addRes = await fetch(`/api/admin/products/${productId}/images`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageUrl: urls[i],
              sortOrder: startOrder + i,
            }),
          });
          if (!addRes.ok) throw new Error("Failed to add image");
          const { image } = await addRes.json();
          nextImages = [...nextImages, image];
        }
        onImagesChange(nextImages);
      } catch (e) {
        console.error(e);
      } finally {
        setUploading(false);
      }
    },
    [productId, images, onImagesChange]
  );

  const removeImage = useCallback(
    async (imageId: string) => {
      if (!productId) return;
      const res = await fetch(
        `/api/admin/products/${productId}/images/${imageId}`,
        { method: "DELETE" }
      );
      if (!res.ok) return;
      onImagesChange(images.filter((img) => img.id !== imageId));
    },
    [productId, images, onImagesChange]
  );

  const moveImage = useCallback(
    async (fromIndex: number, toIndex: number) => {
      if (!productId || toIndex < 0 || toIndex >= images.length) return;
      const reordered = [...images];
      const [removed] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, removed);
      const imageIds = reordered.map((img) => img.id);
      const res = await fetch(`/api/admin/products/${productId}/images`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageIds }),
      });
      if (!res.ok) return;
      onImagesChange(reordered);
    },
    [productId, images, onImagesChange]
  );

  const updatePosition = useCallback(
    async (imageId: string, objectPosition: string) => {
      if (!productId) return;
      const res = await fetch(
        `/api/admin/products/${productId}/images/${imageId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ objectPosition }),
        }
      );
      if (!res.ok) return;
      onImagesChange(
        images.map((img) =>
          img.id === imageId ? { ...img, object_position: objectPosition } : img
        )
      );
    },
    [productId, images, onImagesChange]
  );

  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === toIndex) return;
    moveImage(dragIndex, toIndex);
    setDragIndex(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Images
        </span>
        {images.length > 0 && (
          <span className="text-xs text-slate-400">
            First image = main. Drag to reorder.
          </span>
        )}
      </div>
      {productId ? (
        <>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-6 transition hover:border-slate-300 hover:bg-slate-50">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={disabled || uploading}
              onChange={(e) => uploadFiles(e.target.files)}
            />
            <span className="text-sm text-slate-500">
              {uploading ? "Uploading…" : "Click or drop images"}
            </span>
          </label>
          {images.length > 0 && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {images.map((img, index) => (
                <li
                  key={img.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white"
                >
                  <img
                    src={img.image_url}
                    alt={img.alt_text ?? ""}
                    className="h-28 w-full object-cover"
                    style={{
                      objectPosition: img.object_position ?? "50% 50%",
                    }}
                  />
                  <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-1 bg-black/50 opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => moveImage(index, Math.max(0, index - 1))}
                      disabled={index === 0}
                      className="rounded bg-white/90 px-2 py-1 text-xs font-medium text-slate-800 disabled:opacity-50"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        moveImage(index, Math.min(images.length - 1, index + 1))
                      }
                      disabled={index === images.length - 1}
                      className="rounded bg-white/90 px-2 py-1 text-xs font-medium text-slate-800 disabled:opacity-50"
                    >
                      →
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustImageId(img.id)}
                      className="rounded bg-white/90 px-2 py-1 text-xs font-medium text-slate-800"
                      title="Adjust position / crop focus"
                    >
                      Adjust
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="rounded bg-red-500/90 px-2 py-1 text-xs font-medium text-white"
                    >
                      Delete
                    </button>
                  </div>
                  {adjustImageId === img.id && (
                    <ImagePositionEditor
                      imageUrl={img.image_url}
                      objectPosition={img.object_position}
                      onSave={(objectPosition) => updatePosition(img.id, objectPosition)}
                      onClose={() => setAdjustImageId(null)}
                    />
                  )}
                  {index === 0 && (
                    <span className="absolute left-1 top-1 rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      Main
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p className="text-xs text-slate-400">
          Save the product first to upload images.
        </p>
      )}
    </div>
  );
}
