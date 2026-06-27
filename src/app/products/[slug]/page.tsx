import { notFound } from "next/navigation";
import BackButton from "./BackButton";
import {
  productDisplayPrice,
  productImagesWithPosition,
} from "@/lib/products";
import { stripJewelryCareFromDescription } from "@/lib/product-description";
import { fetchProductBySlug } from "@/lib/products-server";
import FooterSocial from "@/src/components/FooterSocial";
import JewelryCare from "@/src/components/JewelryCare";
import Nav from "@/src/components/Nav";
import { InstagramIcon, WhatsappIcon } from "@/src/components/SocialIcons";
import ProductGallery from "./ProductGallery";
import {
  getLocaleFromSearchParams,
  getTranslations,
} from "@/src/lib/i18n";
import { instagramDmUrl, whatsappUrl } from "@/src/lib/contact";

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
  const rawDescription =
    locale === "ru" && product.description_ru
      ? product.description_ru
      : locale === "it" && product.description_it
        ? product.description_it
        : product.description;
  const description = stripJewelryCareFromDescription(rawDescription);

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-white text-ink">
        <section className="page-x page-pb-16 mx-auto w-full min-w-0 max-w-5xl pt-8 sm:page-pb-20 sm:pt-12">
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
              {description ? (
                <p className="mt-3 whitespace-pre-line text-sm text-slate-600 [overflow-wrap:anywhere] sm:text-[15px]">
                  {description}
                </p>
              ) : null}
              <JewelryCare
                linkLabel={t.product.jewelryCare.link}
                title={t.product.jewelryCare.title}
                tips={t.product.jewelryCare.tips}
                closeLabel={t.common.close}
              />
              <p className="mt-4 text-2xl font-semibold text-slate-900">
                {productDisplayPrice(product)}
              </p>
              <div className="mt-6 flex min-w-0 flex-col gap-3">
                <p className="text-sm text-slate-600 sm:text-[15px]">
                  {t.cta.helperText}
                </p>
                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap">
                  <a
                    href={`${whatsappUrl}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2 text-xs font-normal uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-900 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                  >
                    <WhatsappIcon className="h-4 w-4 shrink-0" />
                    {t.product.requestWhatsapp}
                  </a>
                  <a
                    href={instagramDmUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2 text-xs font-normal uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-900 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                  >
                    <InstagramIcon className="h-4 w-4 shrink-0" />
                    {t.product.requestInstagram}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterSocial />
    </>
  );
}
