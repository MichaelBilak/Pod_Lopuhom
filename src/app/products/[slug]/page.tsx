import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchProductBySlug,
  productDisplayPrice,
  productImagesWithPosition,
} from "@/lib/products";
import FooterSocial from "@/src/components/FooterSocial";
import Nav from "@/src/components/Nav";
import ProductGallery from "./ProductGallery";
import {
  getLocaleFromSearchParams,
  getTranslations,
  withLang,
} from "@/src/lib/i18n";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const instagramUrl =
  "https://www.instagram.com/pod_lopuhom?igsh=MWhmNHAwMjR2bWx0NA==";
const whatsappNumber = "972533794428";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = getLocaleFromSearchParams(resolvedSearchParams);
  const t = getTranslations(locale);
  const product = await fetchProductBySlug(slug);
  if (!product) {
    notFound();
  }
  const whatsappMessage = encodeURIComponent(
    `${t.messages.order} ${product.title} (${productDisplayPrice(product)}).`
  );

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-white text-ink">
        <section className="mx-auto w-full max-w-5xl px-6 pb-20 pt-12">
          <Link href={withLang("/gallery", locale)} className="text-sm text-slate-600">
            {t.product.back}
          </Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.35fr_1fr]">
            <ProductGallery
              title={product.title}
              images={productImagesWithPosition(product)}
            />
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
              <h1 className="text-3xl font-semibold text-slate-900">
                {product.title}
              </h1>
              <p className="mt-3 text-sm text-slate-600">
                {product.description}
              </p>
              <p className="mt-4 text-sm text-slate-600">
                {t.product.materials}: {product.materials ?? ""}
              </p>
              <p className="mt-4 text-2xl font-semibold text-slate-900">
                {productDisplayPrice(product)}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {t.product.requestWhatsapp}
                </a>
                <a
                  href={instagramUrl}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                >
                  {t.product.requestInstagram}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterSocial />
    </>
  );
}
