"use client";

import { useLayoutEffect } from "react";

const STORAGE_KEY = "pod-lopuhom-splash-v1";
const HOLD_MS = 2800;
const EXIT_MS = 900;

function finishSplash(splash: HTMLElement) {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
  document.documentElement.classList.add("splash-seen");
  document.body.style.overflow = "";
  window.setTimeout(() => splash.remove(), EXIT_MS + 50);
}

export default function FirstVisitSplash() {
  useLayoutEffect(() => {
    const splash = document.getElementById("initial-splash");
    if (!splash) return;

    let shouldShow = false;
    try {
      shouldShow = !sessionStorage.getItem(STORAGE_KEY);
    } catch {
      document.documentElement.classList.add("splash-seen");
      return;
    }

    if (!shouldShow) {
      splash.remove();
      document.documentElement.classList.add("splash-seen");
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.body.style.overflow = "hidden";

    if (reducedMotion) {
      finishSplash(splash);
      return;
    }

    const exitTimer = window.setTimeout(() => {
      splash.classList.add("splash-screen--exit");
    }, HOLD_MS);

    const doneTimer = window.setTimeout(() => {
      finishSplash(splash);
    }, HOLD_MS + EXIT_MS);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
      document.body.style.overflow = "";
    };
  }, []);

  return null;
}
