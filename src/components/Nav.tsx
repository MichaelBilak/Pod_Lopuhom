"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "GALLERY", href: "/gallery" },
  { label: "ABOUT", href: "/about" },
  { label: "ORDER & DELIVERY", href: "/order-delivery" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header
      id="main-nav"
      className="border-b border-slate-200/70 bg-white/80 backdrop-blur"
    >
      <div className="relative flex w-full flex-col items-center gap-3 px-6 py-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <Link
          href="/"
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
          href="/"
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
              href={link.href}
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
        </nav>
      </div>
    </header>
  );
}
