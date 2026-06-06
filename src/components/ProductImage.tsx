"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { resolveProductImageSrc } from "@/lib/image-url";
import ProductImagePlaceholder from "@/src/components/ProductImagePlaceholder";

type ProductImageProps = {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  loading?: "eager" | "lazy";
  quality?: number;
};

export default function ProductImage({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  className = "",
  style,
  priority,
  loading,
  quality,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = useMemo(
    () => resolveProductImageSrc(src, { width, fill }),
    [src, width, fill]
  );

  if (!src || failed) {
    return (
      <ProductImagePlaceholder
        className={fill ? "h-full w-full" : className}
        aria-label={alt}
      />
    );
  }

  return (
    <Image
      src={resolved.src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      className={className}
      style={style}
      priority={priority}
      loading={loading}
      quality={quality}
      unoptimized={resolved.unoptimized}
      onError={() => setFailed(true)}
    />
  );
}
