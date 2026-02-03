import FooterSocial from "../../components/FooterSocial";
import Nav from "../../components/Nav";
import { fetchProducts } from "../../../lib/products";
import GalleryClient from "./GalleryClient";
import {
  getLocaleFromSearchParams,
  getTranslations,
} from "../../lib/i18n";

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
    { id: "All", label: t.categories.all },
    { id: "Rings", label: t.categories.rings },
    { id: "Necklaces", label: t.categories.necklaces },
    { id: "Earrings", label: t.categories.earrings },
    { id: "Sets", label: t.categories.sets },
  ];

  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-6xl space-y-14 px-6 pb-24 pt-12">
        <section className="space-y-7 text-center">
          <h1 className="text-5xl font-medium tracking-tight text-slate-900 md:text-6xl">
            {t.gallery.title}
          </h1>
          <GalleryClient
            products={products}
            categories={categories}
            viewDetailsLabel={t.gallery.viewDetails}
          />
        </section>
      </main>
      <FooterSocial />
    </>
  );
}
