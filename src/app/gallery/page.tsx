import FooterSocial from "@/src/components/FooterSocial";
import Nav from "@/src/components/Nav";
import { fetchProducts } from "@/lib/products-server";
import { Suspense } from "react";
import GalleryClient from "./GalleryClient";
import GalleryPreloads from "./GalleryPreloads";
import {
  getLocaleFromSearchParams,
  getTranslations,
} from "@/src/lib/i18n";

export const metadata = {
  title: "Pod Lopuhom | Gallery",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PageProps = {
  searchParams?: Promise<{
    lang?: string;
    category?: string;
    collection?: string;
  }>;
};

export default async function GalleryPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = getLocaleFromSearchParams(resolvedSearchParams);
  const t = getTranslations(locale);
  const products = await fetchProducts();
  const categories = [
    { id: "Rings", label: t.categories.rings },
    { id: "Necklaces", label: t.categories.necklaces },
    { id: "Earrings", label: t.categories.earrings },
    { id: "Sets", label: t.categories.sets },
  ];

  return (
    <>
      <GalleryPreloads
        products={products}
        category={resolvedSearchParams.category}
        collection={resolvedSearchParams.collection}
      />
      <Nav />
      <main className="page-x page-pb-20 mx-auto w-full min-w-0 max-w-6xl space-y-10 pt-8 sm:space-y-14 sm:page-pb-24 sm:pt-12">
        <section className="min-w-0 space-y-6 text-center sm:space-y-7">
          <h1 className="text-[clamp(1.5rem,5.6vw,1.875rem)] font-medium tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            {t.gallery.title}
          </h1>
          <Suspense
            fallback={
              <div className="min-h-[280px] animate-pulse rounded-2xl bg-slate-100/80" />
            }
          >
            <GalleryClient
              products={products}
              categories={categories}
              viewDetailsLabel={t.home.viewDetails}
            />
          </Suspense>
        </section>
      </main>
      <FooterSocial />
    </>
  );
}
