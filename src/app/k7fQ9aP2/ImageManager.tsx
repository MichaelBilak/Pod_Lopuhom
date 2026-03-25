"use client";

import { useCallback, useRef, useState } from "react";
import type { ProductImage } from "@/lib/supabase-products";
import ImagePositionEditor from "./ImagePositionEditor";

/** API may return snake_case or camelCase depending on serialization */
function normalizeProductImage(raw: unknown): ProductImage | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "string" ? o.id : null;
  const product_id =
    typeof o.product_id === "string"
      ? o.product_id
      : typeof o.productId === "string"
        ? o.productId
        : null;
  const image_url =
    typeof o.image_url === "string"
      ? o.image_url
      : typeof o.imageUrl === "string"
        ? o.imageUrl
        : null;
  const alt_text =
    o.alt_text === null || typeof o.alt_text === "string"
      ? (o.alt_text as string | null)
      : typeof o.altText === "string" || o.altText === null
        ? (o.altText as string | null)
        : null;
  const sort_order =
    typeof o.sort_order === "number"
      ? o.sort_order
      : typeof o.sortOrder === "number"
        ? o.sortOrder
        : 0;
  const object_position =
    o.object_position === null || typeof o.object_position === "string"
      ? (o.object_position as string | null)
      : o.objectPosition === null || typeof o.objectPosition === "string"
        ? (o.objectPosition as string | null)
        : null;
  const created_at =
    typeof o.created_at === "string"
      ? o.created_at
      : typeof o.createdAt === "string"
        ? o.createdAt
        : new Date().toISOString();
  if (!id || !product_id || !image_url) return null;
  return {
    id,
    product_id,
    image_url,
    alt_text,
    sort_order,
    object_position,
    created_at,
  };
}

type ImageManagerProps = {
  productId: string | null;
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  onImageNotFound?: () => void;
  disabled?: boolean;
};

export default function ImageManager({
  productId,
  images,
  onImagesChange,
  onImageNotFound,
  disabled,
}: ImageManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [adjustImageId, setAdjustImageId] = useState<string | null>(null);
  const [positionError, setPositionError] = useState<string | null>(null);
  const imagesRef = useRef(images);
  imagesRef.current = images;

  const uploadFiles = useCallback(
    async (files: FileList | null) => {
      if (!productId) {
        setUploadError("Сначала сохраните товар, затем загрузите изображения.");
        return;
      }
      if (!files?.length) return;
      setUploadError(null);
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
        const uploadData = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            typeof uploadData?.message === "string"
              ? uploadData.message
              : "Ошибка загрузки файла."
          );
        }
        const urls = uploadData.urls as string[] | undefined;
        if (!urls?.length) throw new Error("Сервер не вернул URL изображений.");

        const startOrder = imagesRef.current.length;
        let nextImages = [...imagesRef.current];
        for (let i = 0; i < urls.length; i++) {
          const addRes = await fetch(`/api/admin/products/${productId}/images`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageUrl: urls[i],
              sortOrder: startOrder + i,
            }),
          });
          const addData = await addRes.json().catch(() => ({}));
          if (!addRes.ok) {
            throw new Error(
              typeof addData?.message === "string"
                ? addData.message
                : "Не удалось добавить изображение к товару."
            );
          }
          const image = normalizeProductImage(addData.image);
          if (!image) throw new Error("Некорректный ответ сервера при добавлении фото.");
          nextImages = [...nextImages, image];
        }
        onImagesChange(nextImages);
      } catch (e) {
        console.error(e);
        setUploadError(e instanceof Error ? e.message : "Не удалось загрузить изображения.");
      } finally {
        setUploading(false);
      }
    },
    [productId, onImagesChange]
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
      setPositionError(null);
      const res = await fetch(
        `/api/admin/products/${productId}/images/${imageId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ objectPosition }),
        }
      );
      if (!res.ok) {
        let message = "Failed to save position. Try again.";
        try {
          const data = await res.json();
          if (typeof data?.message === "string") message = data.message;
        } catch {
          // use default message
        }
        setPositionError(message);
        if (res.status === 404) onImageNotFound?.();
        return;
      }
      let savedPosition = objectPosition;
      try {
        const data = await res.json();
        if (typeof data?.objectPosition === "string") savedPosition = data.objectPosition;
      } catch {
        // use sent value if response body is invalid
      }
      const next = savedPosition;
      onImagesChange(
        imagesRef.current.map((img) =>
          img.id === imageId ? { ...img, object_position: next } : img
        )
      );
    },
    [productId, onImagesChange, onImageNotFound]
  );

  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDropzoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDropzoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || uploading || !productId) return;
    void uploadFiles(e.dataTransfer.files);
  };
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
      {positionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          <p className="mb-2">{positionError}</p>
          {onImageNotFound && (
            <button
              type="button"
              onClick={() => {
                setPositionError(null);
                onImageNotFound();
              }}
              className="rounded border border-red-300 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
            >
              Обновить товар
            </button>
          )}
        </div>
      )}
      {uploadError && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          <p>{uploadError}</p>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="mt-2 text-xs font-medium text-red-800 underline hover:no-underline"
          >
            Закрыть
          </button>
        </div>
      )}
      {productId ? (
        <>
          {/* file input must stay visible to the layout (opacity overlay), not display:none — otherwise some browsers ignore label/area clicks */}
          <div
            className="relative flex min-h-[5.5rem] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-6 transition hover:border-slate-300 hover:bg-slate-50 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
            onDragOver={handleDropzoneDragOver}
            onDrop={handleDropzoneDrop}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
              multiple
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
              disabled={disabled || uploading}
              onChange={(e) => {
                void uploadFiles(e.target.files);
                e.target.value = "";
              }}
              aria-label="Upload product images"
            />
            <span className="pointer-events-none relative z-0 px-3 text-center text-sm text-slate-500">
              {uploading ? "Uploading…" : "Click or drop images"}
            </span>
          </div>
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
                      onClick={() => {
                        setPositionError(null);
                        setAdjustImageId(img.id);
                      }}
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
