"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getLocale, getTranslations, withLang, type Locale } from "../lib/i18n";

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

  useEffect(() => {
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
    <div className="flex items-center gap-2">
      {(["en", "ru", "it"] as Locale[]).map((option) => (
        <Link
          key={option}
          href={buildLangHref(option)}
          scroll={false}
          replace
          className={[
            "rounded-full border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] transition",
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
      <div style={headerHeight > 0 ? { height: `${headerHeight}px` } : undefined} aria-hidden />
      <header
        id="main-nav"
        ref={headerRef}
        className={[
          "fixed inset-x-0 top-0 z-50 min-w-0 border-b border-slate-200/70 bg-white/80 backdrop-blur transition-transform duration-300 ease-out",
          isVisible ? "translate-y-0" : "-translate-y-full",
        ].join(" ")}
      >
        <div className="absolute right-3 top-3 z-10 sm:hidden">
          {langSwitcher}
        </div>
        <div className="relative flex w-full min-w-0 flex-col items-center gap-3 px-4 py-5 pr-16 text-center sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pr-6 sm:text-left">
          <Link
            href={buildHref("/")}
            className="inline-flex min-w-0 shrink-0 items-center justify-center gap-3 text-base font-semibold uppercase tracking-[0.18em] text-slate-900 transition hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:justify-start sm:text-lg"
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
            className="mt-1 max-w-full min-w-0 text-[20px] font-semibold uppercase tracking-[0.2em] text-slate-900 transition hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:absolute sm:left-1/2 sm:mt-0 sm:-translate-x-1/2 sm:text-[21px] sm:tracking-[0.24em]"
            aria-label="Pod Lopuhom home"
          >
            <span className="inline-block max-w-full break-words [overflow-wrap:anywhere]">
              Pod&nbsp;Lopuhom
            </span>
          </Link>
          <nav className="flex min-w-0 max-w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600 sm:justify-start sm:gap-7 sm:text-xs sm:tracking-[0.26em]">
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
            <div className="hidden sm:block">
              {langSwitcher}
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
