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
    <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="flex w-full flex-col gap-4 px-6 py-6 text-left sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/"
          className="inline-flex items-center justify-start text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-900 transition hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:text-xs"
          aria-label="Pod Lopuhom home"
        >
          Pod&nbsp;Lopuhom
        </Link>
        <nav className="flex flex-wrap items-center justify-start gap-5 text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-600 sm:gap-7 sm:text-xs">
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
