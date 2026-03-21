"use client";

import { useMemo, useState } from "react";
import ProductImagePlaceholder from "@/src/components/ProductImagePlaceholder";

type ImageWithPosition = { url: string; objectPosition: string };

type ProductGalleryProps = {
  title: string;
  images: ImageWithPosition[] | string[];
};

export default function ProductGallery({ title, images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const normalized = useMemo((): ImageWithPosition[] => {
    if (!images.length) return [];
    const first = images[0];
    if (typeof first === "string") {
      return (images as string[]).filter(Boolean).map((url) => ({
        url,
        objectPosition: "50% 50%",
      }));
    }
    return images as ImageWithPosition[];
  }, [images]);
  const safeImages = normalized.filter((i) => i.url);
  const active = safeImages[activeIndex] ?? safeImages[0];
  const activeImage = active?.url ?? "";
  const objectPosition = active?.objectPosition ?? "50% 50%";

  if (!safeImages.length) {
    return (
      <div className="mx-auto w-full min-w-0 max-w-md lg:max-w-xl">
        <div className="min-h-[50vh] overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 sm:min-h-0 sm:aspect-square">
          <ProductImagePlaceholder
            className="h-full w-full rounded-3xl"
            aria-label={title}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-md lg:max-w-xl">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:gap-4">
        <div className="order-2 flex flex-row flex-wrap gap-2 sm:order-1 sm:flex-col sm:gap-3">
          {safeImages.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={item.url}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={[
                  "flex h-14 w-14 flex-none items-center justify-center overflow-hidden rounded-xl border bg-slate-50 transition sm:h-16 sm:w-16",
                  isActive
                    ? "border-slate-900 ring-2 ring-inset ring-slate-900"
                    : "border-slate-200 hover:border-slate-300",
                ].join(" ")}
                aria-label={`View ${title} image ${index + 1}`}
              >
                <img
                  src={item.url}
                  alt=""
                  className="gallery-image h-full w-full object-cover"
                  style={{ objectPosition: item.objectPosition }}
                  loading="eager"
                />
              </button>
            );
          })}
        </div>
        <div className="order-1 h-[50vh] min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 sm:order-2 sm:h-auto sm:min-h-0 sm:aspect-square">
          <img
            src={activeImage}
            alt={title}
            className="gallery-image h-full w-full origin-center object-cover"
            style={{ objectPosition }}
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}
