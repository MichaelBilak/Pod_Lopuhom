import Link from "next/link";
import { Suspense } from "react";
import FooterSocial from "@/src/components/FooterSocial";
import HomeCollectionPromo from "@/src/components/HomeCollectionPromo";
import Nav from "@/src/components/Nav";
import NewProductsScroll from "@/src/app/components/NewProductsScroll";
import { fetchNewProducts } from "@/lib/products-server";
import {
  getLocaleFromSearchParams,
  getTranslations,
  withLang,
} from "@/src/lib/i18n";

export const metadata = {
  title: "Pod Lopuhom | Gallery",
};

export const dynamic = "force-dynamic";

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
      <main className="home-page page-x page-pb-20 page-main page-shell mx-auto w-full min-w-0 sm:page-pb-28">
        <div className="page-main-tight flex min-w-0 flex-col">
          <section className="hero-panel text-center">
            <div className="hero-panel__content relative z-10">
                <h1 className="hero-tagline font-tagline">
                {t.home.title}
              </h1>
            </div>
          </section>
          <nav
            aria-label="Shop categories"
            className="home-category-menu min-w-0"
          >
            <div className="home-category-band" aria-hidden />
            <div className="category-tabs-scroll overflow-x-auto overscroll-x-contain scroll-smooth py-3 [-webkit-overflow-scrolling:touch] sm:overflow-visible sm:py-4">
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
                      `/gallery?category=${encodeURIComponent(item.id)}`,
                      locale
                    )}
                    className="home-category-link inline-flex min-h-[40px] shrink-0 items-center whitespace-nowrap px-2 py-1 text-[11px] font-normal uppercase tracking-[0.2em] text-slate-700 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:px-3 sm:py-1 sm:text-sm sm:tracking-[0.24em] md:text-base md:tracking-[0.28em]"
                  >
                    <span className="border-b border-transparent pb-1 transition hover:border-slate-500 sm:pb-1.5">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="home-category-band" aria-hidden />
          </nav>
          <HomeCollectionPromo
            locale={locale}
            collectionsLabel={t.home.collectionsLabel}
          />
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
