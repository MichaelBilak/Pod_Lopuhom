"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CollectionTile from "@/src/components/CollectionTile";
import { COLLECTIONS } from "@/src/lib/collections";
import type { Locale } from "@/src/lib/i18n";

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  galleryLabel: string;
  aboutLabel: string;
  orderLabel: string;
  buildHref: (href: string) => string;
  headerOffset: number;
  isGalleryActive: boolean;
  isAboutActive: boolean;
  isOrderActive: boolean;
};

export default function MobileNavDrawer({
  open,
  onClose,
  locale,
  galleryLabel,
  aboutLabel,
  orderLabel,
  buildHref,
  headerOffset,
  isGalleryActive,
  isAboutActive,
  isOrderActive,
}: MobileNavDrawerProps) {
  const [galleryExpanded, setGalleryExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setGalleryExpanded(false);
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const navItemClass = (active: boolean) =>
    [
      "mobile-nav-drawer__link flex min-h-[44px] w-full items-center justify-between border-b border-slate-200 px-1 py-2.5 text-left text-xs font-normal uppercase tracking-[0.22em] transition-colors",
      active ? "text-slate-900" : "text-slate-700 hover:text-slate-900",
    ].join(" ");

  return createPortal(
    <div className="mobile-nav-drawer fixed inset-0 z-[80]" role="presentation">
      <button
        type="button"
        aria-label="Close menu"
        className="mobile-nav-drawer__backdrop fixed inset-0 bg-slate-900/25"
        onClick={onClose}
      />
      <nav
        id="mobile-nav-drawer"
        aria-label="Primary"
        className="mobile-nav-drawer__panel fixed inset-x-0 overflow-y-auto rounded-b-2xl border-b border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.14)]"
        style={{
          top: headerOffset > 0 ? `${headerOffset}px` : undefined,
          maxHeight:
            headerOffset > 0
              ? `min(calc(100dvh - ${headerOffset}px), 28rem)`
              : "min(100dvh, 28rem)",
        }}
      >
        <div className="mx-auto w-full max-w-lg px-5 pb-4 pt-2 sm:px-6">
          <div className="flex flex-col">
            <button
              type="button"
              aria-expanded={galleryExpanded}
              onClick={() => setGalleryExpanded((value) => !value)}
              className={navItemClass(isGalleryActive)}
            >
              <span>{galleryLabel}</span>
              <svg
                viewBox="0 0 20 20"
                aria-hidden="true"
                className={[
                  "h-4 w-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none",
                  galleryExpanded ? "rotate-180" : "rotate-0",
                ].join(" ")}
              >
                <path
                  fill="currentColor"
                  d="M5.5 7.5a.75.75 0 0 1 1.06 0L10 10.94l3.44-3.44a.75.75 0 1 1 1.06 1.06l-3.97 3.97a.75.75 0 0 1-1.06 0L5.5 8.56a.75.75 0 0 1 0-1.06Z"
                />
              </svg>
            </button>
            {galleryExpanded ? (
              <div className="mobile-nav-drawer__collections grid grid-cols-2 gap-3 pb-3 pt-1">
                {COLLECTIONS.map((collection) => (
                  <CollectionTile
                    key={collection}
                    collection={collection}
                    locale={locale}
                    variant="drawer"
                    onNavigate={onClose}
                  />
                ))}
              </div>
            ) : null}
            <Link
              href={buildHref("/about")}
              onClick={onClose}
              className={navItemClass(isAboutActive)}
            >
              {aboutLabel}
            </Link>
            <Link
              href={buildHref("/order-delivery")}
              onClick={onClose}
              className={navItemClass(isOrderActive)}
            >
              {orderLabel}
            </Link>
          </div>
        </div>
      </nav>
    </div>,
    document.body
  );
}
