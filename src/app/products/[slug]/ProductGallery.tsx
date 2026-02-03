"use client";

import { useMemo, useState } from "react";

type ProductGalleryProps = {
  title: string;
  images: string[];
};

export default function ProductGallery({ title, images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0] ?? "";
  const isNecklaces21 =
    activeImage.includes("/necklaces_21.0.") ||
    activeImage.includes("necklaces_21.0.");
  const imageFocus: Record<string, string> = {
    "/images/products/necklaces_21.0.jpg": "60% 70%",
    "/images/products/necklaces_21.0.JPG": "60% 70%",
  };
  const objectPosition = isNecklaces21
    ? imageFocus[activeImage] ?? "60% 70%"
    : "50% 50%";

  const safeImages = useMemo(() => images.filter(Boolean), [images]);

  if (!activeImage) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <div className="aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
        <img
          src={activeImage}
          alt={title}
          className={[
            "h-full w-full origin-center",
            "object-cover",
          ].join(" ")}
          style={{ objectPosition }}
          loading="eager"
          fetchPriority="high"
        />
      </div>
      <div className="flex justify-center gap-3 overflow-x-auto pb-1">
        {safeImages.map((image, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={[
                "flex h-16 w-16 flex-none items-center justify-center overflow-hidden rounded-2xl border bg-slate-50 transition sm:h-20 sm:w-20",
                isActive
                  ? "border-slate-900 ring-2 ring-inset ring-slate-900"
                  : "border-slate-200 hover:border-slate-300",
              ].join(" ")}
              aria-label={`View ${title} image ${index + 1}`}
            >
              <img
                src={image}
                alt=""
                className="h-full w-full object-cover"
                loading="eager"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
