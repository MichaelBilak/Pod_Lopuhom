"use client";

import Image from "next/image";
import { useState } from "react";
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
};

function isRemoteImage(src: string) {
  return src.startsWith("http://") || src.startsWith("https://");
}

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
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

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
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      className={className}
      style={style}
      priority={priority}
      loading={loading}
      unoptimized={isRemoteImage(src)}
      onError={() => setFailed(true)}
    />
  );
}
