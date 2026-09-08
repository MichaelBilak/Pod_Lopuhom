"use client";

import { useLayoutEffect, useRef } from "react";
import { SPLASH_STORAGE_KEY } from "@/src/lib/splash";

const HOLD_MS = 2600;

function markSplashSeen() {
  try {
    sessionStorage.setItem(SPLASH_STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
  document.documentElement.classList.remove("splash-active");
  document.body.style.overflow = "";
}

function hideSplashElement(splash: HTMLElement) {
  splash.classList.add("splash-screen--exit");
  splash.setAttribute("aria-hidden", "true");
}

export default function FirstVisitSplash() {
  const startedRef = useRef(false);

  useLayoutEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const html = document.documentElement;
    const splash = document.getElementById("initial-splash");

    if (html.classList.contains("splash-skip") || !splash) {
      html.classList.remove("splash-active");
      document.body.style.overflow = "";
      return;
    }

    try {
      if (sessionStorage.getItem(SPLASH_STORAGE_KEY)) {
        markSplashSeen();
        hideSplashElement(splash);
        return;
      }
    } catch {
      markSplashSeen();
      hideSplashElement(splash);
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      markSplashSeen();
      hideSplashElement(splash);
      return;
    }

    html.classList.add("splash-active");
    document.body.style.overflow = "hidden";

    const exitTimer = window.setTimeout(() => {
      hideSplashElement(splash);
      markSplashSeen();
    }, HOLD_MS);

    return () => {
      window.clearTimeout(exitTimer);
      html.classList.remove("splash-active");
      document.body.style.overflow = "";
    };
  }, []);

  return null;
}
