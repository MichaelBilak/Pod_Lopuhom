import Link from "next/link";
import FooterSocial from "@/src/components/FooterSocial";
import Nav from "@/src/components/Nav";
import NewProductsScroll from "@/src/app/components/NewProductsScroll";
import { fetchNewProducts } from "@/lib/products";
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
      <main className="mx-auto w-full max-w-6xl space-y-20 px-6 pb-28 pt-12">
        <section className="hero-panel text-center">
          <div className="hero-backdrop" aria-hidden="true">
            {randomizedHeroImages.map((src) => (
              <img
                key={src}
                className="hero-slide"
                src={src}
                alt=""
                decoding="async"
                loading="eager"
                fetchPriority="high"
              />
            ))}
            <span className="hero-wash" />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="space-y-6">
              <h1 className="text-3xl font-semibold text-slate-900 md:text-5xl">
                {t.home.title}
              </h1>
              <p className="mx-auto max-w-xl text-base text-slate-700">
                {t.home.subtitle}
              </p>
            </div>
          </div>
        </section>
        <div className="flex flex-nowrap items-center justify-center gap-2 overflow-x-auto text-center sm:gap-6">
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
              className="shrink-0 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:px-3 sm:py-2 sm:text-sm sm:tracking-[0.28em] md:text-base"
            >
              <span className="border-b border-transparent pb-2 transition hover:border-slate-400">
                {item.label}
              </span>
            </Link>
          ))}
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
