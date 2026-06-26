"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type JewelryCareProps = {
  linkLabel: string;
  title: string;
  tips: readonly string[];
  closeLabel: string;
};

export default function JewelryCare({
  linkLabel,
  title,
  tips,
  closeLabel,
}: JewelryCareProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  const modal =
    open && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <button
              type="button"
              aria-label={closeLabel}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-[3px]"
              onClick={close}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="jewelry-care-title"
              className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.14)] sm:max-w-md sm:p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={close}
                aria-label={closeLabel}
                className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <span aria-hidden className="text-xl leading-none">
                  ×
                </span>
              </button>
              <h2
                id="jewelry-care-title"
                className="pr-8 text-sm font-medium uppercase tracking-[0.14em] text-slate-800 sm:text-[15px] sm:tracking-[0.16em]"
              >
                {title}
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                {tips.map((tip) => (
                  <li key={tip} className="flex gap-2.5">
                    <span
                      className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-slate-400"
                      aria-hidden
                    />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group mt-4 inline-flex items-center gap-1.5 border-b border-dashed border-slate-400/80 pb-0.5 text-sm text-slate-700 transition hover:border-slate-700 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:text-[15px]"
      >
        <span>{linkLabel}</span>
        <span
          aria-hidden
          className="text-[10px] text-slate-400 transition group-hover:text-slate-600"
        >
          ↗
        </span>
      </button>
      {modal}
    </>
  );
}
