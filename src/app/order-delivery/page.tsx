import FooterSocial from "@/src/components/FooterSocial";
import Nav from "@/src/components/Nav";
import {
  getLocaleFromSearchParams,
  getTranslations,
} from "@/src/lib/i18n";

export const metadata = {
  title: "Pod Lopuhom | Order & Delivery",
};

type PageProps = {
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export default async function OrderDeliveryPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = getLocaleFromSearchParams(resolvedSearchParams);
  const t = getTranslations(locale);
  const instagramUrl =
    "https://www.instagram.com/pod_lopuhom?igsh=MWhmNHAwMjR2bWx0NA==";
  const whatsappNumber = "972533794428";
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-4xl space-y-10 px-6 pb-20 pt-12">
        <section className="space-y-4 text-center">
          <h1 className="text-4xl font-semibold text-slate-900">
            {t.order.title}
          </h1>
        </section>
        <section className="mx-auto w-full max-w-2xl space-y-4 text-left">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <div className="space-y-4 text-sm uppercase tracking-[0.2em] text-slate-700">
              <div className="grid gap-3 border-b border-slate-200 pb-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <span>{t.order.deliveryIsrael}</span>
                <span className="text-right text-base font-semibold text-slate-900 sm:min-w-[96px]">
                  25 ILS
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <span>{t.order.deliveryHaifa}</span>
                <span className="text-right text-base font-semibold text-slate-900 sm:min-w-[96px]">
                  {t.order.free}
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto w-full max-w-2xl space-y-4 text-center">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-600">
              {t.order.orderCta}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-slate-300 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              >
                {t.order.whatsapp}
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-slate-300 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              >
                {t.order.instagram}
              </a>
            </div>
          </div>
        </section>
      </main>
      <FooterSocial />
    </>
  );
}
