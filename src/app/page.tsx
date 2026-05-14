import Link from "next/link";
import FooterSocial from "@/src/components/FooterSocial";
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

export const revalidate = 300;

const heroImages = [
  "/images/hero%20img/07f7770a-2ca1-441e-916d-74066ce348be.jpg",
  "/images/hero%20img/IMG_2028.JPG",
  "/images/hero%20img/IMG_3292.JPG",
  "/images/hero%20img/IMG_6353%20(2).JPG",
  "/images/hero%20img/IMG_6912.jpg",
  "/images/hero%20img/IMG_9258.JPG",
];

const shuffle = (images: string[]) => {
  const result = [...images];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

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
  const randomizedHeroImages = shuffle(heroImages);

  return (
    <>
      <Nav />
      <main className="mx-auto w-full min-w-0 max-w-6xl space-y-20 px-4 pb-28 pt-12 sm:px-6">
        <div className="min-w-0 space-y-4">
          <section className="hero-panel text-center">
            <div className="hero-backdrop" aria-hidden="true">
              {randomizedHeroImages.map((src, index) => (
                <img
                  key={src}
                  className="hero-slide"
                  src={src}
                  alt=""
                  decoding="async"
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "low"}
                />
              ))}
              <span className="hero-wash" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="space-y-6">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl md:text-5xl md:tracking-normal">
                  {t.home.title}
                </h1>
                <p className="mx-auto max-w-xl text-base text-slate-700 [overflow-wrap:anywhere]">
                  {t.home.subtitle}
                </p>
              </div>
            </div>
          </section>
          <div className="category-tabs-scroll -mx-4 flex w-full min-w-0 justify-center overflow-x-auto overscroll-x-contain scroll-smooth px-4 pb-1 [-webkit-overflow-scrolling:touch] sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0">
            <div className="inline-flex min-w-max flex-nowrap items-center gap-2 text-center sm:gap-6">
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
                  className="inline-flex shrink-0 whitespace-nowrap px-2 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:px-3 sm:py-2 sm:text-sm sm:tracking-[0.24em] md:text-base md:tracking-[0.28em]"
                >
                  <span className="border-b border-transparent pb-2 transition hover:border-slate-400">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
        {newProducts.length > 0 ? (
          <NewProductsScroll
            products={newProducts}
            newLabel={t.home.newLabel}
            newTitle={t.home.newTitle}
            viewDetails={t.home.viewDetails}
          />
        ) : null}
      </main>
      <FooterSocial />
    </>
  );
}
