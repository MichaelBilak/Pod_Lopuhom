"use client";

import { useEffect, useState } from "react";

type HeroBackdropProps = {
  images: readonly string[];
};

function shuffle(images: string[]) {
  const result = [...images];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function HeroBackdrop({ images }: HeroBackdropProps) {
  const [orderedImages, setOrderedImages] = useState(() => [...images]);

  useEffect(() => {
    setOrderedImages(shuffle([...images]));
  }, [images]);

  return (
    <div className="hero-backdrop" aria-hidden="true">
      {orderedImages.map((src, index) => (
        <img
          key={src}
          className="hero-slide"
          src={src}
          alt=""
          decoding="async"
          loading={index === 0 ? "eager" : "lazy"}
          fetchPriority={index === 0 ? "high" : "low"}
        />
      ))}
      <span className="hero-wash" />
    </div>
  );
}
