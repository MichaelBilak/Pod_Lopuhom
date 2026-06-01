import FooterSocial from "@/src/components/FooterSocial";
import Nav from "@/src/components/Nav";
import { fetchProducts } from "@/lib/products-server";
import GalleryClient from "./GalleryClient";
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
      <Nav />
      <main className="mx-auto w-full min-w-0 max-w-6xl space-y-10 px-4 pb-20 pt-8 sm:space-y-14 sm:px-6 sm:pb-24 sm:pt-12">
        <section className="min-w-0 space-y-6 text-center sm:space-y-7">
          <h1 className="text-[clamp(1.5rem,5.6vw,1.875rem)] font-medium tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            {t.gallery.title}
          </h1>
          <GalleryClient
            products={products}
            categories={categories}
            viewDetailsLabel={t.home.viewDetails}
          />
        </section>
      </main>
      <FooterSocial />
    </>
  );
}
