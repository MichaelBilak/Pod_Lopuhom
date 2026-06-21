import { notFound } from "next/navigation";
import BackButton from "./BackButton";
import BuyButton from "./BuyButton";
import {
  productDisplayPrice,
  productImagesWithPosition,
} from "@/lib/products";
import { fetchProductBySlug } from "@/lib/products-server";
import FooterSocial from "@/src/components/FooterSocial";
import Nav from "@/src/components/Nav";
import ProductGallery from "./ProductGallery";
import {
  getLocaleFromSearchParams,
  getTranslations,
} from "@/src/lib/i18n";
import { instagramUrl, whatsappUrl } from "@/src/lib/contact";

export const revalidate = 300;
export const runtime = "nodejs";

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
  const isPurchasable =
    !product.price_on_request &&
    product.price != null &&
    Number.isFinite(Number(product.price)) &&
    Number(product.price) > 0;

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-white text-ink">
        <section className="mx-auto w-full min-w-0 max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12">
          <BackButton label={t.product.back} />
          <div className="mt-6 grid min-w-0 gap-6 sm:mt-8 sm:gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <ProductGallery
              title={product.title}
              images={productImagesWithPosition(product)}
            />
            <div className="min-w-0 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-6">
              <h1 className="text-[clamp(1.5rem,5vw,1.875rem)] font-semibold tracking-tight text-slate-900 [overflow-wrap:anywhere] sm:tracking-normal">
                {product.title}
              </h1>
              <p className="mt-3 whitespace-pre-line text-sm text-slate-600 [overflow-wrap:anywhere] sm:text-[15px]">
                {locale === "ru" && product.description_ru
                  ? product.description_ru
                  : locale === "it" && product.description_it
                    ? product.description_it
                    : product.description}
              </p>
              <p className="mt-4 text-2xl font-semibold text-slate-900">
                {productDisplayPrice(product)}
              </p>
              <div className="mt-6 flex min-w-0 flex-col flex-wrap gap-3 sm:flex-row sm:items-start">
                {isPurchasable ? (
                  <BuyButton
                    slug={product.slug}
                    locale={locale}
                    idleLabel={t.product.buyNow}
                    loadingLabel={t.product.buyLoading}
                    errorLabel={t.product.buyError}
                    closeLabel={t.common.close}
                  />
                ) : null}
                <a
                  href={`${whatsappUrl}?text=${whatsappMessage}`}
                  className="inline-flex min-h-[44px] min-w-0 flex-1 items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-center text-sm font-medium text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 sm:flex-initial"
                >
                  {t.product.requestWhatsapp}
                </a>
                <a
                  href={instagramUrl}
                  className="inline-flex min-h-[44px] min-w-0 flex-1 items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-center text-sm font-medium text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 sm:flex-initial"
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
