"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DEFAULT_COLLECTION } from "@/src/lib/collections";
import {
  instagramUrl,
  whatsappDisplay,
  whatsappUrl,
} from "@/src/lib/contact";
import { getLocale, getTranslations, withLang } from "../lib/i18n";

function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 448 512" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9 114.9-51.3 114.9-114.9S287.7 141 224.1 141zm0 189.6c-41.3 0-74.7-33.4-74.7-74.7s33.4-74.7 74.7-74.7 74.7 33.4 74.7 74.7-33.4 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.9-26.9 26.9s-26.9-12-26.9-26.9 12-26.9 26.9-26.9 26.9 12 26.9 26.9zM398.8 80c-12.5-12.5-29.4-19.5-47.1-19.5H96.3C58.6 60.5 28 91.1 28 128.8v254.4c0 37.7 30.6 68.3 68.3 68.3h255.4c37.7 0 68.3-30.6 68.3-68.3V128.8c0-17.7-7-34.6-19.2-46.8zM384 383.2c0 17.4-14.1 31.5-31.5 31.5H95.5c-17.4 0-31.5-14.1-31.5-31.5V128.8c0-17.4 14.1-31.5 31.5-31.5h257.1c17.4 0 31.5 14.1 31.5 31.5v254.4z"
      />
    </svg>
  );
}

function WhatsappIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 448 512" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M380.9 97.1C339.1 55.3 283.2 32 224 32c-122.8 0-222 99.2-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.8 27 106.3 27h.1c122.7 0 222-99.2 222-222 0-59.3-23.3-115.2-65.5-157zM224 438.7c-33.7 0-66.7-9-95.7-26.1l-6.8-4-69.8 18.3 18.6-68.1-4.4-7c-18.5-29.4-28.2-63.4-28.2-98.3 0-100.2 81.5-181.7 181.7-181.7 48.5 0 94.1 18.9 128.4 53.1 34.3 34.3 53.2 80 53.2 128.4 0 100.2-81.5 181.7-181.7 181.7zm101.7-138.5c-5.6-2.8-33-16.3-38.1-18.2-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18.2-17.5 22-3.2 3.7-6.5 4.2-12.1 1.4-5.6-2.8-23.7-8.7-45.1-27.7-16.7-14.9-28-33.2-31.3-38.8-3.2-5.6-.3-8.6 2.4-11.4 2.5-2.5 5.6-6.5 8.4-9.7 2.8-3.2 3.7-5.6 5.6-9.3 1.9-3.7.9-7-0.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-7-.2-10.7-.2-3.7 0-9.7 1.4-14.8 7-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.8 53.7 22.6 57.4 2.8 3.7 39 59.6 94.5 83.6 13.2 5.7 23.5 9.1 31.6 11.7 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 33-13.5 37.7-26.5 4.6-13 4.6-24.1 3.2-26.5-1.4-2.3-5.1-3.7-10.7-6.5z"
      />
    </svg>
  );
}

export default function FooterSocial() {
  return (
    <Suspense fallback={null}>
      <FooterSocialContent />
    </Suspense>
  );
}

function FooterSocialContent() {
  const searchParams = useSearchParams();
  const locale = getLocale(searchParams?.get("lang"));
  const t = getTranslations(locale);
  const year = new Date().getFullYear();

  const exploreLinks = [
    { label: t.nav.gallery, href: `/gallery?collection=${encodeURIComponent(DEFAULT_COLLECTION)}` },
    { label: t.nav.about, href: "/about" },
    { label: t.nav.orderDelivery, href: "/order-delivery" },
  ];

  const categoryLinks = [
    { label: t.categories.necklaces, id: "Necklaces" },
    { label: t.categories.rings, id: "Rings" },
    { label: t.categories.earrings, id: "Earrings" },
    { label: t.categories.sets, id: "Sets" },
  ];

  return (
    <footer className="relative mt-12 min-w-0 border-t border-slate-200 bg-slate-50/70 text-slate-700 sm:mt-16">
      <div className="page-x page-shell mx-auto w-full min-w-0 pt-12 pb-6 sm:pt-14 sm:pb-8">
        <div className="grid min-w-0 gap-y-10 gap-x-8 sm:grid-cols-2 sm:gap-y-12 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="min-w-0 space-y-4 sm:col-span-2 md:col-span-1">
            <Link
              href={withLang("/", locale)}
              className="inline-flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              aria-label="Pod Lopuhom home"
            >
              <Image
                src="/images/products/Logo.%20pod_lopuhom.jpeg"
                alt=""
                width={48}
                height={48}
                sizes="48px"
                className="h-11 w-11 rounded-full object-cover"
              />
              <span className="font-brand text-lg text-slate-900">
                Pod&nbsp;Lopuhom
              </span>
            </Link>
            <p className="max-w-sm text-[13px] leading-relaxed text-slate-600 [overflow-wrap:anywhere]">
              {t.footer.tagline}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:border-slate-900 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                <InstagramIcon className="h-[18px] w-[18px]" />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:border-slate-900 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                <WhatsappIcon className="h-[18px] w-[18px]" />
              </a>
            </div>
          </div>

          <nav aria-label="Footer explore" className="min-w-0">
            <h3 className="text-[11px] font-normal uppercase tracking-[0.28em] text-slate-900">
              {t.footer.exploreTitle}
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={withLang(link.href, locale)}
                    className="inline-flex transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer shop" className="min-w-0">
            <h3 className="text-[11px] font-normal uppercase tracking-[0.28em] text-slate-900">
              {t.footer.shopTitle}
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {categoryLinks.map((category) => (
                <li key={category.id}>
                  <Link
                    href={withLang(
                      `/gallery?category=${encodeURIComponent(category.id)}`,
                      locale
                    )}
                    className="inline-flex transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0 sm:col-span-2 md:col-span-1">
            <h3 className="text-[11px] font-normal uppercase tracking-[0.28em] text-slate-900">
              {t.footer.contactTitle}
            </h3>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-slate-600">
              {t.footer.contactHint}
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                >
                  <WhatsappIcon className="h-4 w-4 text-slate-500" />
                  <span>{whatsappDisplay}</span>
                </a>
              </li>
              <li>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                >
                  <InstagramIcon className="h-4 w-4 text-slate-500" />
                  <span>@pod_lopuhom</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 h-px w-full bg-slate-200 sm:mt-14" />

        <div className="mt-6 text-center text-[11px] uppercase tracking-[0.2em] text-slate-500 sm:text-[12px] sm:tracking-[0.22em]">
          <p suppressHydrationWarning>
            © {year} Pod&nbsp;Lopuhom. {t.footer.rights}
          </p>
        </div>
      </div>
      <div
        aria-hidden
        className="h-[env(safe-area-inset-bottom,0px)] w-full"
      />
    </footer>
  );
}
