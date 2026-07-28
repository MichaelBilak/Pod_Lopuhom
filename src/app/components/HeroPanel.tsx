"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Locale } from "@/src/lib/i18n";

type HeroPanelProps = {
  title: string;
  locale: Locale;
};

export default function HeroPanel({ title, locale }: HeroPanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    const media = mediaRef.current;
    if (!panel || !media) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = panel.getBoundingClientRect();
      const viewHeight = window.innerHeight || 1;
      // Move background slower than scroll while hero is in view.
      const offset = Math.max(-80, Math.min(80, rect.top * -0.28));
      const progress = Math.min(
        1,
        Math.max(0, (viewHeight - rect.top) / (viewHeight + rect.height))
      );
      media.style.transform = `translate3d(0, ${offset}px, 0) scale(${1.08 + progress * 0.04})`;
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={panelRef} className="hero-panel">
      <div ref={mediaRef} className="hero-panel__media" aria-hidden>
        <Image
          src="/images/_drive_import/IMG_1352.JPG"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hero-panel__image"
        />
      </div>
      <div className="hero-panel__veil" aria-hidden />
      <div className="hero-panel__fade" aria-hidden />
      <div className="hero-panel__content relative z-10">
        <p className="hero-panel__eyebrow font-brand">Pod Lopuhom</p>
        <span className="hero-panel__rule" aria-hidden />
        <h1 className="hero-tagline font-tagline" lang={locale}>
          {title}
        </h1>
      </div>
    </section>
  );
}
