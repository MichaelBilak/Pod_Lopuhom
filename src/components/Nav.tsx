"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import CollectionTile from "@/src/components/CollectionTile";
import MobileNavDrawer from "@/src/components/MobileNavDrawer";
import { COLLECTIONS } from "@/src/lib/collections";
import { getLocale, getTranslations, withLang, type Locale } from "../lib/i18n";
import { buildQueryHref } from "../lib/search-params";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const localeOptions: Locale[] = ["it", "en", "ru"];

const navLinkClass =
  "relative whitespace-nowrap py-1 font-normal uppercase tracking-[0.22em] transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 after:absolute after:-bottom-0.5 after:left-0 after:h-[1px] after:w-full after:origin-left after:scale-x-0 after:bg-slate-900 after:transition hover:after:scale-x-100 lg:after:-bottom-2";

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
          "inline-flex min-h-[40px] min-w-[68px] items-center justify-center gap-1 rounded-full border px-3.5 py-2 text-xs font-normal uppercase tracking-[0.2em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
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
                      "flex items-center justify-between px-4 py-2.5 text-xs font-normal uppercase tracking-[0.22em] transition",
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

type GalleryDropdownProps = {
  label: string;
  locale: Locale;
  isActive: boolean;
};

const galleryNavClass =
  "relative whitespace-nowrap py-1 font-normal uppercase tracking-[0.22em] transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 after:absolute after:-bottom-0.5 after:left-0 after:h-[1px] after:w-full after:origin-left after:scale-x-0 after:bg-slate-900 after:transition lg:after:-bottom-2";

function GalleryDropdown({
  label,
  locale,
  isActive,
}: GalleryDropdownProps) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const prefersHoverMenu = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const scheduleOpen = () => {
    if (!prefersHoverMenu()) return;
    clearTimers();
    openTimerRef.current = window.setTimeout(() => setOpen(true), 320);
  };

  const scheduleClose = () => {
    if (!prefersHoverMenu()) return;
    clearTimers();
    closeTimerRef.current = window.setTimeout(() => setOpen(false), 180);
  };

  useEffect(() => () => clearTimers(), []);

  useLayoutEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return;
    }

    const updateMenuPosition = () => {
      if (!wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const width = Math.min(352, window.innerWidth - 32);
      let left = rect.left + rect.width / 2 - width / 2;
      left = Math.max(16, Math.min(left, window.innerWidth - width - 16));

      setMenuStyle({
        top: rect.bottom + 8,
        left,
        width,
      });
    };

    updateMenuPosition();
    window.addEventListener("scroll", updateMenuPosition, { passive: true });
    window.addEventListener("resize", updateMenuPosition);
    return () => {
      window.removeEventListener("scroll", updateMenuPosition);
      window.removeEventListener("resize", updateMenuPosition);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (wrapRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
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

  const renderMenuPanel = (
    className: string,
    style?: CSSProperties
  ) => (
    <div
      ref={menuRef}
      role="menu"
      aria-label={label}
      className={className}
      style={style}
    >
      <div className="grid grid-cols-2 gap-2">
        {COLLECTIONS.map((collection) => (
          <CollectionTile
            key={collection}
            collection={collection}
            locale={locale}
            variant="dropdown"
            onNavigate={() => setOpen(false)}
          />
        ))}
      </div>
    </div>
  );

  const handleToggleClick = () => {
    clearTimers();
    setOpen((value) => !value);
  };

  const menuPanelClass =
    "overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.12)] ring-1 ring-black/[0.02]";

  return (
    <div
      ref={wrapRef}
      className="relative shrink-0"
      onMouseEnter={scheduleOpen}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={handleToggleClick}
        className={[
          galleryNavClass,
          "text-xs text-slate-600",
          isActive || open ? "text-slate-900 after:scale-x-100" : "",
        ].join(" ")}
      >
        <span className="inline-flex items-center gap-1">
          {label}
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
        </span>
      </button>
      {open && menuStyle && typeof document !== "undefined"
        ? createPortal(
            <div
              onMouseEnter={() => {
                clearTimers();
                setOpen(true);
              }}
              onMouseLeave={scheduleClose}
            >
              {renderMenuPanel(`${menuPanelClass} fixed z-[70]`, {
                top: menuStyle.top,
                left: menuStyle.left,
                width: menuStyle.width,
              })}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

function NavFallback() {
  return (
    <div
      className="h-[72px] sm:h-[80px] lg:h-[88px]"
      aria-hidden
    />
  );
}

export default function Nav() {
  return (
    <Suspense fallback={<NavFallback />}>
      <NavBar />
    </Suspense>
  );
}

function NavBar() {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const locale = getLocale(searchParams?.get("lang"));
  const t = getTranslations(locale);
  const [isVisible, setIsVisible] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const lastScrollY = useRef(0);
  const headerRef = useRef<HTMLElement>(null);
  const isGalleryActive = pathname === "/gallery";
  const isAboutActive = pathname === "/about";
  const isOrderActive = pathname === "/order-delivery";
  const secondaryLinks = [
    { label: t.nav.about, href: "/about" },
    { label: t.nav.orderDelivery, href: "/order-delivery" },
  ];

  const buildHref = (href: string) => withLang(href, locale);
  const buildLangHref = (nextLocale: Locale) =>
    buildQueryHref(pathname, searchParams, { lang: nextLocale });
  const isHome = pathname === "/";
  const brandTitleClass =
    "font-brand text-[19px] sm:text-[25px] lg:text-[30px]";

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
    setMobileNavOpen(false);
  }, [pathname]);

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
            "inline-flex min-h-[32px] items-center justify-center rounded-full border px-2.5 py-1.5 text-[10px] font-normal uppercase tracking-[0.2em] transition sm:text-[11px]",
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

  const mobileHeaderActions = (
    <div className="flex shrink-0 items-center gap-2">
      {mobileLangSwitcher}
      <button
        type="button"
        aria-expanded={mobileNavOpen}
        aria-controls="mobile-nav-drawer"
        aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
        onClick={() => setMobileNavOpen((value) => !value)}
        className="mobile-nav-toggle inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
          {mobileNavOpen ? (
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.5"
              d="M6 6l12 12M18 6L6 18"
            />
          ) : (
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.5"
              d="M4 7h16M4 12h16M4 17h16"
            />
          )}
        </svg>
      </button>
    </div>
  );

  const renderNavLinks = () => (
    <>
      <GalleryDropdown
        label={t.nav.gallery}
        locale={locale}
        isActive={isGalleryActive}
      />
      {secondaryLinks.map((link) => (
        <Link
          key={link.href}
          href={buildHref(link.href)}
          className={[
            navLinkClass,
            "text-xs text-slate-600",
            pathname === link.href ? "text-slate-900 after:scale-x-100" : "",
          ].join(" ")}
        >
          {link.label}
        </Link>
      ))}
    </>
  );

  return (
    <>
      <div
        className="nav-spacer"
        style={headerHeight > 0 ? { height: `${headerHeight}px` } : undefined}
        aria-hidden
      />
      <header
        id="main-nav"
        ref={headerRef}
        className={[
          "site-nav-shell fixed inset-x-0 top-0 z-50 min-w-0 border-b border-slate-200/70 bg-white/80 backdrop-blur transition-transform duration-300 ease-out",
          isVisible ? "translate-y-0" : "-translate-y-full",
        ].join(" ")}
      >
        <div className="lg:hidden pb-3">
          {isHome ? (
            <div className="flex w-full min-w-0 items-center justify-between gap-3 pt-3 sm:pt-4">
              <Link
                href={buildHref("/")}
                className="inline-flex min-w-0 shrink items-center gap-2 text-slate-900 transition-all duration-300 ease-out hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:gap-2.5"
                aria-label="Pod Lopuhom home"
              >
                <Image
                  src="/images/products/Logo.%20pod_lopuhom.jpeg"
                  alt=""
                  width={48}
                  height={48}
                  sizes="48px"
                  className="h-10 w-10 shrink-0 rounded-full object-cover sm:h-12 sm:w-12"
                  priority
                />
                <span className={["min-w-0 truncate", brandTitleClass].join(" ")}>
                  Pod&nbsp;Lopuhom
                </span>
              </Link>
              {mobileHeaderActions}
            </div>
          ) : (
            <div className="flex w-full min-w-0 items-center justify-between gap-3 px-0 pt-3 sm:pt-4">
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
              {mobileHeaderActions}
            </div>
          )}
          <MobileNavDrawer
            open={mobileNavOpen}
            onClose={() => setMobileNavOpen(false)}
            locale={locale}
            galleryLabel={t.nav.gallery}
            aboutLabel={t.nav.about}
            orderLabel={t.nav.orderDelivery}
            buildHref={buildHref}
            headerOffset={headerHeight}
            isGalleryActive={isGalleryActive}
            isAboutActive={isAboutActive}
            isOrderActive={isOrderActive}
          />
        </div>

        <div className="relative hidden w-full min-w-0 grid-cols-[1fr_auto_1fr] items-center gap-3 px-6 py-5 text-left lg:grid">
          <Link
            href={buildHref("/")}
            className="inline-flex min-w-0 shrink-0 items-center gap-2.5 justify-self-start text-slate-900 transition-all duration-300 ease-out hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:gap-3"
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
            <span className={["truncate", brandTitleClass].join(" ")}>
              Pod&nbsp;Lopuhom
            </span>
          </Link>
          <nav
            aria-label="Primary"
            className="flex min-w-0 items-center justify-self-center gap-x-7"
          >
            {renderNavLinks()}
          </nav>
          <div className="justify-self-end shrink-0">{desktopLangPills}</div>
        </div>
      </header>
    </>
  );
}
