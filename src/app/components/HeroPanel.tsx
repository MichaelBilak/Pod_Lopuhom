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
      const offset = Math.max(-90, Math.min(90, rect.top * -0.32));
      media.style.transform = `translate3d(0, ${offset}px, 0)`;
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
          src="/images/_drive_import/IMG_1351.JPG"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hero-panel__image"
        />
      </div>
      <div className="hero-panel__veil" aria-hidden />
      <div className="hero-panel__fade hero-panel__fade--bottom" aria-hidden />
      <div className="hero-panel__content">
        <p className="hero-panel__eyebrow font-brand">Pod Lopuhom</p>
        <span className="hero-panel__rule" aria-hidden />
        <h1 className="hero-tagline font-tagline" lang={locale}>
          {title}
        </h1>
      </div>
    </section>
  );
}
