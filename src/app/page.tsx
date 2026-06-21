import Link from "next/link";
import { Suspense } from "react";
import FooterSocial from "@/src/components/FooterSocial";
import Nav from "@/src/components/Nav";
import NewProductsScroll from "@/src/app/components/NewProductsScroll";
import HeroBackdrop from "@/src/app/components/HeroBackdrop";
import { fetchNewProducts } from "@/lib/products-server";
import { DEFAULT_COLLECTION } from "@/src/lib/collections";
import {
  getLocaleFromSearchParams,
  getTranslations,
  withLang,
} from "@/src/lib/i18n";

export const metadata = {
  title: "Pod Lopuhom | Gallery",
};

export const dynamic = "force-dynamic";

const heroImages = [
  "/images/hero%20img/07f7770a-2ca1-441e-916d-74066ce348be.jpg",
  "/images/hero%20img/IMG_2028.JPG",
  "/images/hero%20img/IMG_3292.JPG",
  "/images/hero%20img/IMG_6353%20(2).JPG",
  "/images/hero%20img/IMG_6912.jpg",
  "/images/hero%20img/IMG_9258.JPG",
];

type PageProps = {
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = getLocaleFromSearchParams(resolvedSearchParams);
  const t = getTranslations(locale);
  const newProducts = await fetchNewProducts(8);

  return (
    <>
      <Nav />
      <main className="mx-auto w-full min-w-0 max-w-6xl space-y-14 px-4 pb-20 pt-8 sm:space-y-20 sm:px-6 sm:pb-28 sm:pt-12">
        <div className="min-w-0 space-y-5 sm:space-y-4">
          <section className="hero-panel text-center">
            <HeroBackdrop images={heroImages} />
            <div className="relative z-10 space-y-5 sm:space-y-6">
              <div className="space-y-4 sm:space-y-6">
                <h1
                  className={[
                    "hero-tagline font-tagline",
                    locale === "ru" ? "font-tagline--cyrillic" : "",
                  ].join(" ")}
                >
                  {t.home.title}
                </h1>
              </div>
            </div>
          </section>
          <nav
            aria-label="Shop categories"
            className="home-category-menu -mx-4 min-w-0 sm:mx-0"
          >
            <div className="home-category-band mx-4 sm:mx-0" aria-hidden />
            <div className="category-tabs-scroll overflow-x-auto overscroll-x-contain scroll-smooth px-4 py-3 [-webkit-overflow-scrolling:touch] sm:overflow-visible sm:px-0 sm:py-4">
              <div className="flex w-max min-w-full flex-nowrap items-center justify-center gap-3 sm:gap-6">
                {[
                  { id: "Rings", label: t.categories.rings },
                  { id: "Necklaces", label: t.categories.necklaces },
                  { id: "Earrings", label: t.categories.earrings },
                  { id: "Sets", label: t.categories.sets },
                ].map((item) => (
                  <Link
                    key={item.id}
                    href={withLang(
                      `/gallery?collection=${encodeURIComponent(DEFAULT_COLLECTION)}&category=${encodeURIComponent(item.id)}`,
                      locale
                    )}
                    className="inline-flex min-h-[40px] shrink-0 items-center whitespace-nowrap px-2 py-1 text-[11px] font-normal uppercase tracking-[0.2em] text-slate-700 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:px-3 sm:py-1 sm:text-sm sm:tracking-[0.24em] md:text-base md:tracking-[0.28em]"
                  >
                    <span className="border-b border-transparent pb-1 transition hover:border-slate-500 sm:pb-1.5">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="home-category-band mx-4 sm:mx-0" aria-hidden />
          </nav>
        </div>
        {newProducts.length > 0 ? (
          <Suspense fallback={null}>
            <NewProductsScroll
              products={newProducts}
              locale={locale}
              newLabel={t.home.newLabel}
              newTitle={t.home.newTitle}
              viewDetails={t.home.viewDetails}
            />
          </Suspense>
        ) : null}
      </main>
      <FooterSocial />
    </>
  );
}
