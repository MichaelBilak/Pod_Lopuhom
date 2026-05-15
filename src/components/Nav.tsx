"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getLocale, getTranslations, withLang, type Locale } from "../lib/i18n";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function Nav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = getLocale(searchParams?.get("lang"));
  const t = getTranslations(locale);
  const [isVisible, setIsVisible] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(0);
  const lastScrollY = useRef(0);
  const headerRef = useRef<HTMLElement>(null);
  const navLinks = [
    { label: t.nav.gallery, href: "/gallery" },
    { label: t.nav.about, href: "/about" },
    { label: t.nav.orderDelivery, href: "/order-delivery" },
  ];

  const buildHref = (href: string) => withLang(href, locale);
  const buildLangHref = (nextLocale: Locale) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("lang", nextLocale);
    const query = params.toString();
    return `${pathname}${query ? `?${query}` : ""}`;
  };

  useIsomorphicLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const updateHeight = () => setHeaderHeight(header.getBoundingClientRect().height);
    updateHeight();

    if (typeof ResizeObserver === "undefined") return;
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(header);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const threshold = 8;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;
      const isScrollingUp = delta < -threshold;
      const isScrollingDown = delta > threshold;
      const nearTop = currentY < 24;

      if (nearTop || isScrollingUp) {
        setIsVisible(true);
      } else if (isScrollingDown) {
        setIsVisible(false);
      }

      lastScrollY.current = currentY;
    };

    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const langSwitcher = (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {(["en", "ru", "it"] as Locale[]).map((option) => (
        <Link
          key={option}
          href={buildLangHref(option)}
          scroll={false}
          replace
          className={[
            "inline-flex min-h-[28px] items-center justify-center rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] transition sm:text-[9px] sm:tracking-[0.2em]",
            option === locale
              ? "border-slate-900 text-slate-900"
              : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700",
          ].join(" ")}
        >
          {t.language[option]}
        </Link>
      ))}
    </div>
  );

  return (
    <>
      <div
        className="h-[104px] sm:h-[120px] lg:h-[88px]"
        style={headerHeight > 0 ? { height: `${headerHeight}px` } : undefined}
        aria-hidden
      />
      <header
        id="main-nav"
        ref={headerRef}
        className={[
          "fixed inset-x-0 top-0 z-50 min-w-0 border-b border-slate-200/70 bg-white/80 backdrop-blur transition-transform duration-300 ease-out",
          "pt-[env(safe-area-inset-top)]",
          isVisible ? "translate-y-0" : "-translate-y-full",
        ].join(" ")}
      >
        {/* Phones + tablets (<lg): two-row compact layout */}
        <div className="lg:hidden">
          <div className="flex w-full min-w-0 items-center justify-between gap-3 px-3 pt-3 sm:px-5 sm:pt-4">
            <Link
              href={buildHref("/")}
              className="inline-flex shrink-0 items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              aria-label="Pod Lopuhom home"
            >
              <Image
                src="/images/products/Logo.%20pod_lopuhom.jpeg"
                alt=""
                width={48}
                height={48}
                sizes="48px"
                className="h-10 w-10 rounded-full object-cover sm:h-12 sm:w-12"
                priority
              />
            </Link>
            <Link
              href={buildHref("/")}
              className="min-w-0 flex-1 truncate text-center text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-900 transition hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:text-[17px] sm:tracking-[0.22em]"
              aria-label="Pod Lopuhom home"
            >
              Pod&nbsp;Lopuhom
            </Link>
            <div className="shrink-0">{langSwitcher}</div>
          </div>
          <nav
            aria-label="Primary"
            className="category-tabs-scroll flex w-full min-w-0 items-center overflow-x-auto overscroll-x-contain scroll-smooth px-3 py-3 [-webkit-overflow-scrolling:touch] sm:px-5 sm:py-4"
          >
            <div className="mx-auto inline-flex min-w-max flex-nowrap items-center gap-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 sm:gap-7 sm:text-xs sm:tracking-[0.24em]">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={buildHref(link.href)}
                  className={[
                    "relative whitespace-nowrap py-1 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
                    "after:absolute after:-bottom-0.5 after:left-0 after:h-[1px] after:w-full after:origin-left after:scale-x-0 after:bg-slate-900 after:transition",
                    "hover:after:scale-x-100",
                    pathname === link.href ? "text-slate-900 after:scale-x-100" : "",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        {/* Desktop (lg+): 3-zone centered layout */}
        <div className="relative hidden w-full min-w-0 items-center justify-between gap-3 px-6 py-5 text-left lg:flex">
          <Link
            href={buildHref("/")}
            className="inline-flex min-w-0 shrink-0 items-center gap-3 text-lg font-semibold uppercase tracking-[0.18em] text-slate-900 transition hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            aria-label="Pod Lopuhom home"
          >
            <Image
              src="/images/products/Logo.%20pod_lopuhom.jpeg"
              alt=""
              width={48}
              height={48}
              sizes="48px"
              className="h-12 w-12 rounded-full object-cover"
              priority
            />
          </Link>
          <Link
            href={buildHref("/")}
            className="absolute left-1/2 max-w-[44%] -translate-x-1/2 truncate text-[21px] font-semibold uppercase tracking-[0.24em] text-slate-900 transition hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            aria-label="Pod Lopuhom home"
          >
            Pod&nbsp;Lopuhom
          </Link>
          <nav
            aria-label="Primary"
            className="flex min-w-0 max-w-full flex-wrap items-center justify-end gap-x-7 gap-y-2 text-xs font-semibold uppercase tracking-[0.26em] text-slate-600"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={buildHref(link.href)}
                className={[
                  "relative transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
                  "after:absolute after:-bottom-2 after:left-0 after:h-[1px] after:w-full after:origin-left after:scale-x-0 after:bg-slate-900 after:transition",
                  "hover:after:scale-x-100",
                  pathname === link.href ? "text-slate-900 after:scale-x-100" : "",
                ].join(" ")}
              >
                {link.label}
              </Link>
            ))}
            {langSwitcher}
          </nav>
        </div>
      </header>
    </>
  );
}
