"use client";

import { useLayoutEffect, useRef } from "react";

const STORAGE_KEY = "pod-lopuhom-splash-v1";
const HOLD_MS = 2600;

function markSplashSeen() {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
  document.documentElement.classList.add("splash-seen");
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

    const splash = document.getElementById("initial-splash");
    if (!splash) {
      markSplashSeen();
      return;
    }

    let shouldShow = false;
    try {
      shouldShow = !sessionStorage.getItem(STORAGE_KEY);
    } catch {
      markSplashSeen();
      hideSplashElement(splash);
      return;
    }

    if (!shouldShow) {
      markSplashSeen();
      hideSplashElement(splash);
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.body.style.overflow = "hidden";

    if (reducedMotion) {
      markSplashSeen();
      hideSplashElement(splash);
      return;
    }

    const exitTimer = window.setTimeout(() => {
      hideSplashElement(splash);
      markSplashSeen();
    }, HOLD_MS);

    return () => {
      window.clearTimeout(exitTimer);
      document.body.style.overflow = "";
    };
  }, []);

  return null;
}
