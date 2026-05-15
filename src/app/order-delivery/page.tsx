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
      <main className="mx-auto w-full min-w-0 max-w-4xl space-y-8 px-4 pb-16 pt-8 sm:space-y-10 sm:px-6 sm:pb-20 sm:pt-12">
        <section className="min-w-0 space-y-4 text-center">
          <h1 className="text-[clamp(1.5rem,5.6vw,2.25rem)] font-semibold tracking-tight text-slate-900 sm:tracking-normal">
            {t.order.title}
          </h1>
        </section>
        <section className="mx-auto w-full max-w-2xl space-y-4 text-left">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-6">
            <div className="space-y-4 text-[13px] uppercase tracking-[0.18em] text-slate-700 sm:text-sm sm:tracking-[0.2em]">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b border-slate-200 pb-4">
                <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{t.order.deliveryIsrael}</span>
                <span className="shrink-0 text-right text-base font-semibold text-slate-900">
                  25 ILS
                </span>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{t.order.deliveryHaifa}</span>
                <span className="shrink-0 text-right text-base font-semibold text-slate-900">
                  {t.order.free}
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto w-full max-w-2xl space-y-4 text-center">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-6">
            <p className="text-[13px] uppercase tracking-[0.18em] text-slate-600 sm:text-sm sm:tracking-[0.2em]">
              {t.order.orderCta}
            </p>
            <div className="mt-5 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              >
                {t.order.whatsapp}
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
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
