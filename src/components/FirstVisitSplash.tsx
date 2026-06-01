"use client";

import { useLayoutEffect, useRef } from "react";

const STORAGE_KEY = "pod-lopuhom-splash-v1";
const HOLD_MS = 2600;
const EXIT_MS = 700;

function markSplashSeen() {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
  document.documentElement.classList.add("splash-seen");
  document.body.style.overflow = "";
}

export default function FirstVisitSplash() {
  const startedRef = useRef(false);

  useLayoutEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const splash = document.getElementById("initial-splash");
    if (!splash) return;

    let shouldShow = false;
    try {
      shouldShow = !sessionStorage.getItem(STORAGE_KEY);
    } catch {
      markSplashSeen();
      splash.remove();
      return;
    }

    if (!shouldShow) {
      markSplashSeen();
      splash.remove();
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.body.style.overflow = "hidden";

    if (reducedMotion) {
      markSplashSeen();
      splash.remove();
      return;
    }

    const exitTimer = window.setTimeout(() => {
      splash.classList.add("splash-screen--exit");
      markSplashSeen();
    }, HOLD_MS);

    const removeTimer = window.setTimeout(() => {
      splash.remove();
    }, HOLD_MS + EXIT_MS);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
      document.body.style.overflow = "";
    };
  }, []);

  return null;
}
