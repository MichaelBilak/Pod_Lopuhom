"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { getLocale, getTranslations, withLang, type Locale } from "../lib/i18n";

export default function Nav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = getLocale(searchParams?.get("lang"));
  const t = getTranslations(locale);
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

  return (
    <header
      id="main-nav"
      className="border-b border-slate-200/70 bg-white/80 backdrop-blur"
    >
      <div className="relative flex w-full flex-col items-center gap-3 px-6 py-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <Link
          href={buildHref("/")}
          className="inline-flex items-center justify-center gap-3 text-base font-semibold uppercase tracking-[0.18em] text-slate-900 transition hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:justify-start sm:text-lg"
          aria-label="Pod Lopuhom home"
        >
          <img
            src="/images/products/Logo.%20pod_lopuhom.jpeg"
            alt=""
            className="h-10 w-10 rounded-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
        </Link>
        <Link
          href={buildHref("/")}
          className="mt-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-900 transition hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:absolute sm:left-1/2 sm:-translate-x-1/2 sm:mt-0 sm:text-xs"
          aria-label="Pod Lopuhom home"
        >
          <span className="inline-block origin-center scale-[1.9]">
            Pod&nbsp;Lopuhom
          </span>
        </Link>
        <nav className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-600 sm:justify-start sm:gap-7 sm:text-xs">
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
          <div className="flex items-center gap-2">
            {(["en", "ru"] as Locale[]).map((option) => (
              <Link
                key={option}
                href={buildLangHref(option)}
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
        </nav>
      </div>
    </header>
  );
}
