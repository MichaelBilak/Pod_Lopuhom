"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getLocale, getTranslations, withLang, type Locale } from "../lib/i18n";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const localeOptions: Locale[] = ["it", "en", "ru"];

type LangDropdownProps = {
  locale: Locale;
  labels: Record<Locale, string>;
  buildLangHref: (next: Locale) => string;
};

function LangDropdown({ locale, labels, buildLangHref }: LangDropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target || !wrapRef.current) return;
      if (!wrapRef.current.contains(target)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [locale]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Change language"
        onClick={() => setOpen((value) => !value)}
        className={[
          "inline-flex min-h-[36px] min-w-[60px] items-center justify-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
          open
            ? "border-slate-900 bg-white text-slate-900"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900",
        ].join(" ")}
      >
        <span>{labels[locale]}</span>
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className={[
            "h-3 w-3 transition-transform duration-200",
            open ? "rotate-180" : "rotate-0",
          ].join(" ")}
        >
          <path
            fill="currentColor"
            d="M5.5 7.5a.75.75 0 0 1 1.06 0L10 10.94l3.44-3.44a.75.75 0 1 1 1.06 1.06l-3.97 3.97a.75.75 0 0 1-1.06 0L5.5 8.56a.75.75 0 0 1 0-1.06Z"
          />
        </svg>
      </button>
      {open ? (
        <div
          role="menu"
          aria-label="Language"
          className="absolute right-0 top-full z-50 mt-2 w-[120px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)] ring-1 ring-black/[0.02]"
        >
          <ul className="py-1.5">
            {localeOptions.map((option) => {
              const isActive = option === locale;
              return (
                <li key={option} role="none">
                  <Link
                    role="menuitem"
                    href={buildLangHref(option)}
                    scroll={false}
                    replace
                    onClick={() => setOpen(false)}
                    className={[
                      "flex items-center justify-between px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] transition",
                      isActive
                        ? "bg-slate-50 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    ].join(" ")}
                  >
                    <span>{labels[option]}</span>
                    {isActive ? (
                      <svg
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        className="h-3 w-3 text-slate-900"
                      >
                        <path
                          fill="currentColor"
                          d="M16.704 5.293a1 1 0 0 1 .003 1.414l-7.07 7.116a1 1 0 0 1-1.418.003L3.293 8.9a1 1 0 1 1 1.414-1.414l3.214 3.214 6.366-6.41a1 1 0 0 1 1.417.003Z"
                        />
                      </svg>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

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
  const isHome = pathname === "/";
  const brandTitleClass =
    "text-[13px] tracking-[0.18em] sm:text-[17px] sm:tracking-[0.22em]";
  const brandTitleDesktopClass = "text-[14px] tracking-[0.24em]";

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
    let ticking = false;
    let frameId = 0;

    const updateVisibility = () => {
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
      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      frameId = window.requestAnimationFrame(updateVisibility);
    };

    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const desktopLangPills = (
    <div className="flex items-center gap-2">
      {localeOptions.map((option) => (
        <Link
          key={option}
          href={buildLangHref(option)}
          scroll={false}
          replace
          className={[
            "inline-flex min-h-[28px] items-center justify-center rounded-full border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] transition",
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

  const mobileLangSwitcher = (
    <LangDropdown
      locale={locale}
      labels={t.language}
      buildLangHref={buildLangHref}
    />
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
          "site-nav-shell fixed inset-x-0 top-0 z-50 min-w-0 border-b border-slate-200/70 bg-white/80 backdrop-blur transition-transform duration-300 ease-out",
          "pt-[env(safe-area-inset-top)]",
          isVisible ? "translate-y-0" : "-translate-y-full",
        ].join(" ")}
      >
        {/* Phones + tablets (<lg): two-row compact layout */}
        <div className="lg:hidden">
          {isHome ? (
            <div className="grid w-full min-w-0 grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 pt-3 sm:px-5 sm:pt-4">
              <Link
                href={buildHref("/")}
                className="inline-flex shrink-0 items-center justify-self-start rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
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
                className={[
                  "min-w-0 max-w-[min(100vw-8.5rem,16rem)] truncate text-center font-semibold uppercase text-slate-900 transition-all duration-300 ease-out hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:max-w-[min(100vw-10rem,18rem)]",
                  brandTitleClass,
                ].join(" ")}
                aria-label="Pod Lopuhom home"
              >
                Pod&nbsp;Lopuhom
              </Link>
              <div className="justify-self-end shrink-0">{mobileLangSwitcher}</div>
            </div>
          ) : (
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
              <div className="shrink-0">{mobileLangSwitcher}</div>
            </div>
          )}
          <nav
            aria-label="Primary"
            className="category-tabs-scroll min-w-0 overflow-x-auto overscroll-x-contain scroll-smooth px-3 py-3 [-webkit-overflow-scrolling:touch] sm:px-5 sm:py-4"
          >
            <div className="flex w-max min-w-full flex-nowrap items-center justify-center gap-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 sm:gap-7 sm:text-xs sm:tracking-[0.24em]">
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

        {/* Desktop (lg+): brand left, nav center, language right */}
        <div className="relative hidden w-full min-w-0 grid-cols-[1fr_auto_1fr] items-center gap-3 px-6 py-5 text-left lg:grid">
          <Link
            href={buildHref("/")}
            className="inline-flex min-w-0 shrink-0 items-center gap-2.5 justify-self-start font-semibold uppercase text-slate-900 transition-all duration-300 ease-out hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:gap-3"
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
            <span className={["truncate", brandTitleDesktopClass].join(" ")}>
              Pod&nbsp;Lopuhom
            </span>
          </Link>
          <nav
            aria-label="Primary"
            className="flex min-w-0 items-center justify-self-center gap-x-7 text-xs font-semibold uppercase tracking-[0.26em] text-slate-600"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={buildHref(link.href)}
                className={[
                  "relative whitespace-nowrap transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
                  "after:absolute after:-bottom-2 after:left-0 after:h-[1px] after:w-full after:origin-left after:scale-x-0 after:bg-slate-900 after:transition",
                  "hover:after:scale-x-100",
                  pathname === link.href ? "text-slate-900 after:scale-x-100" : "",
                ].join(" ")}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="justify-self-end shrink-0">{desktopLangPills}</div>
        </div>
      </header>
    </>
  );
}
