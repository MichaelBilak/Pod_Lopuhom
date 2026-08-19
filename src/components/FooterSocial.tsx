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

import {
  InstagramIcon,
  WhatsappIcon,
} from "@/src/components/SocialIcons";

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
  const rightsMobile = t.footer.rights.replace(/\.\s*$/, "");

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

        <div className="mt-6 text-center text-[11px] tracking-[0.2em] text-slate-500 sm:text-[12px] sm:tracking-[0.22em]">
          <p suppressHydrationWarning>
            <span className="block uppercase sm:inline">
              © {year} Pod&nbsp;Lopuhom<span className="hidden sm:inline">.</span>
            </span>
            <span className="mt-1 block text-[11px] lowercase tracking-[0.14em] sm:mt-0 sm:inline sm:uppercase sm:text-[12px] sm:tracking-[0.22em]">
              <span className="sm:hidden">{rightsMobile}</span>
              <span className="hidden sm:inline"> {t.footer.rights}</span>
            </span>
          </p>
          <p className="mt-2 text-[11px] normal-case tracking-[0.08em] text-slate-500 sm:text-[12px] sm:tracking-[0.1em]">
            {t.footer.websiteByBefore}{" "}
            <a
              href="https://www.dormup-it.com/"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-slate-300 underline-offset-2 transition hover:text-slate-900 hover:decoration-slate-900"
            >
              {t.footer.studioName}
            </a>
            {" • "}
            {t.footer.illustrationBy}
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
