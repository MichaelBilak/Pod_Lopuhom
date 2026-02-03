import Link from "next/link";
import FooterSocial from "../components/FooterSocial";
import Nav from "../components/Nav";
import { fetchProducts } from "../../lib/products";
import {
  getLocaleFromSearchParams,
  getTranslations,
  withLang,
} from "../lib/i18n";

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
  const products = await fetchProducts();
  const newProducts = products.filter((product) => product.is_new).slice(0, 4);
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
            <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_6px_18px_rgba(15,23,42,0.06)] sm:h-28 sm:w-28">
              <img
                src="/images/products/Logo.%20pod_lopuhom.jpeg"
                alt="Pod Lopuhom logo"
                className="h-full w-full object-cover object-center"
                loading="eager"
                fetchPriority="high"
              />
            </div>
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
        <div className="flex flex-wrap items-center justify-center gap-6 text-center">
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
              className="px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-600 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:text-xs"
            >
              <span className="border-b border-transparent pb-2 transition hover:border-slate-400">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
        {newProducts.length > 0 ? (
          <section className="space-y-6">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">
                {t.home.newLabel}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                {t.home.newTitle}
              </h2>
            </div>
            <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
              {newProducts.map((product) => (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-3xl border border-slate-100 bg-white transition hover:border-slate-200"
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="flex h-full w-full flex-col gap-3 rounded-3xl p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                    aria-label={`Open ${product.title} details`}
                  >
                    <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-slate-50 sm:h-52">
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="h-full w-full origin-center rounded-2xl object-cover object-center transition duration-300 group-hover:scale-[1.04]"
                          loading="eager"
                          fetchPriority="high"
                        />
                      ) : null}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100"></div>
                    </div>
                    <div className="flex flex-1 flex-col gap-2 px-1 pb-1">
                      <p className="whitespace-nowrap text-xs font-medium tracking-[0.02em] text-slate-900 sm:text-sm">
                        {product.title}
                      </p>
                      <p className="whitespace-nowrap text-xs text-slate-500 sm:block">
                        {product.materials}
                      </p>
                      <div className="mt-auto flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
                        <span className="whitespace-nowrap text-base font-semibold leading-tight text-slate-900 sm:text-lg">
                          {product.price}
                        </span>
                        <span className="hidden whitespace-nowrap text-[10px] uppercase tracking-[0.22em] text-slate-400 sm:inline sm:text-right">
                          {t.home.viewDetails}
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <FooterSocial />
    </>
  );
}
