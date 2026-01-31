import Link from "next/link";

const navLinks = [
  { label: "GALLERY", href: "/gallery" },
  { label: "ABOUT", href: "/about" },
  { label: "ORDER & DELIVERY", href: "/order-delivery" },
];

export default function Nav() {
  return (
    <header className="border-b border-slate-200">
      <div className="flex w-full flex-col gap-4 px-6 py-6 text-left sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/"
          className="inline-flex items-center justify-start text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-900 transition hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:text-xs"
          aria-label="Pod Lopuhom home"
        >
          Pod&nbsp;Lopuhom
        </Link>
        <nav className="flex flex-wrap items-center justify-start gap-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-700 sm:gap-6 sm:text-xs">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
