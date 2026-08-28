"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { type Locale } from "@/src/lib/i18n";

type HeroPanelProps = {
  title: string;
  scrollHintLabel: string;
  locale: Locale;
};

export default function HeroPanel({
  title,
  scrollHintLabel,
  locale,
}: HeroPanelProps) {
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

    const mobileQuery = window.matchMedia("(max-width: 639px)");
    let frame = 0;

    const clear = () => {
      media.style.transform = "";
    };

    const update = () => {
      frame = 0;
      if (mobileQuery.matches) {
        clear();
        return;
      }
      const rect = panel.getBoundingClientRect();
      const range = Math.min(72, panel.offsetHeight * 0.14);
      const offset = Math.max(-range, Math.min(range, rect.top * -0.28));
      media.style.transform = `translate3d(0, ${offset}px, 0)`;
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    mobileQuery.addEventListener("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      mobileQuery.removeEventListener("change", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      clear();
    };
  }, []);

  const scrollToNext = () => {
    const target = document.getElementById("home-after-hero");
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollIcon = (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

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
        <div className="hero-panel__tagline-block">
          <h1 className="hero-tagline font-tagline" lang={locale}>
            {title}
          </h1>
          <button
            type="button"
            className="hero-panel__scroll hero-panel__scroll--tagline"
            onClick={scrollToNext}
            aria-label={scrollHintLabel}
          >
            {scrollIcon}
          </button>
        </div>
      </div>
      <button
        type="button"
        className="hero-panel__scroll hero-panel__scroll--bottom"
        onClick={scrollToNext}
        aria-label={scrollHintLabel}
      >
        {scrollIcon}
      </button>
    </section>
  );
}
