"use client";

import { useEffect } from "react";

/**
 * In development, logs DOM nodes that extend past the viewport horizontally.
 * Helps catch layout regressions on narrow screens (e.g. 375px).
 */
export default function ViewportOverflowDebug() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    let frame = 0;

    const run = () => {
      const vw = window.innerWidth;
      const docW = document.documentElement.scrollWidth;
      if (docW <= vw + 0.5) {
        return;
      }

      const offenders: { tag: string; className: string; right: number; left: number; width: number }[] = [];
      const nodes = document.body.querySelectorAll<HTMLElement>("*");

      nodes.forEach((el) => {
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") return;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) return;
        if (r.right > vw + 1 || r.left < -1) {
          offenders.push({
            tag: el.tagName.toLowerCase(),
            className: typeof el.className === "string" ? el.className.slice(0, 120) : "",
            left: Math.round(r.left * 10) / 10,
            right: Math.round(r.right * 10) / 10,
            width: Math.round(r.width * 10) / 10,
          });
        }
      });

      console.warn(
        "[viewport-overflow] document wider than viewport",
        { viewportWidth: vw, documentScrollWidth: docW, overflowPx: Math.round((docW - vw) * 10) / 10 },
        offenders.length ? offenders : "(no single element matched — check margins/transforms)"
      );
    };

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (debounceTimer !== null) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          debounceTimer = null;
          run();
        }, 320);
      });
    };

    const id = window.setTimeout(schedule, 150);

    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("orientationchange", schedule, { passive: true });

    return () => {
      clearTimeout(id);
      if (debounceTimer !== null) clearTimeout(debounceTimer);
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
    };
  }, []);

  return null;
}
