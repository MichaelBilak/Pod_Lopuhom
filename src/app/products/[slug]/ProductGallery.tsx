"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import ProductImage from "@/src/components/ProductImage";
import ProductImagePlaceholder from "@/src/components/ProductImagePlaceholder";
import { buildQueryHref } from "@/src/lib/search-params";

type ImageWithPosition = { url: string; objectPosition: string };

type ProductGalleryProps = {
  title: string;
  images: ImageWithPosition[] | string[];
};

function ProductGalleryContent({ title, images }: ProductGalleryProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname() ?? "";

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
  const queryImage = searchParams?.get("image");
  const queryIndex = Number.parseInt(queryImage ?? "", 10) - 1;
  const resolvedActiveIndex =
    Number.isFinite(queryIndex) && queryIndex >= 0 && queryIndex < safeImages.length
      ? queryIndex
      : 0;
  const active = safeImages[resolvedActiveIndex] ?? safeImages[0];
  const activeImage = active?.url ?? "";
  const objectPosition = active?.objectPosition ?? "50% 50%";

  const buildImageHref = (index: number) =>
    buildQueryHref(pathname, searchParams, {
      image: index === 0 ? null : String(index + 1),
    });

  if (!safeImages.length) {
    return (
      <div className="mx-auto w-full min-w-0 max-w-md md:max-w-none lg:max-w-xl">
        <div className="aspect-[4/5] overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 md:aspect-square">
          <ProductImagePlaceholder
            className="h-full w-full rounded-3xl"
            aria-label={title}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-md md:max-w-none lg:max-w-xl">
      <div className="flex min-w-0 flex-col gap-3 md:flex-row md:gap-4">
        <div className="order-2 -mx-1 flex flex-row flex-nowrap gap-2 overflow-x-auto overscroll-x-contain px-1 pb-1 [-webkit-overflow-scrolling:touch] md:order-1 md:mx-0 md:flex-col md:gap-3 md:overflow-visible md:px-0 md:pb-0">
          {safeImages.map((item, index) => (
            <Link
              key={item.url}
              href={buildImageHref(index)}
              scroll={false}
              replace
              className={[
                "flex h-16 w-16 flex-none items-center justify-center overflow-hidden rounded-xl border bg-slate-50 transition",
                index === resolvedActiveIndex
                  ? "border-slate-900 ring-2 ring-inset ring-slate-900"
                  : "border-slate-200 hover:border-slate-300",
              ].join(" ")}
              aria-label={`View ${title} image ${index + 1}`}
            >
              <ProductImage
                src={item.url}
                alt=""
                width={64}
                height={64}
                sizes="64px"
                className="gallery-image h-full w-full object-cover"
                style={{ objectPosition: item.objectPosition }}
                loading="eager"
              />
            </Link>
          ))}
        </div>
        <div className="relative order-1 min-w-0 flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 aspect-[4/5] max-h-[70vh] max-h-[70svh] max-h-[70dvh] md:order-2 md:aspect-square md:max-h-none">
          <ProductImage
            src={activeImage}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 55vw, 40vw"
            className="gallery-image h-full w-full origin-center object-cover"
            style={{ objectPosition }}
            priority
          />
        </div>
      </div>
    </div>
  );
}

export default function ProductGallery(props: ProductGalleryProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto aspect-[4/5] w-full max-w-md animate-pulse rounded-3xl bg-slate-100 md:aspect-square md:max-w-none lg:max-w-xl" />
      }
    >
      <ProductGalleryContent {...props} />
    </Suspense>
  );
}
