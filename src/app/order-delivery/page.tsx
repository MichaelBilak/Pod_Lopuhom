import FooterSocial from "@/src/components/FooterSocial";
import Nav from "@/src/components/Nav";
import {
  getLocaleFromSearchParams,
  getTranslations,
} from "@/src/lib/i18n";
import { instagramUrl, whatsappUrl } from "@/src/lib/contact";

export const metadata = {
  title: "Pod Lopuhom | Order & Delivery",
};

type PageProps = {
  searchParams?: Promise<{
    lang?: string;
  }>;
};

const deliveryRates = [
  {
    labelKey: "deliveryItaly" as const,
    daysKey: "deliveryItalyDays" as const,
    price: "8 €",
  },
  {
    labelKey: "deliveryEurope" as const,
    daysKey: "deliveryEuropeDays" as const,
    price: "15 €",
  },
  {
    labelKey: "deliveryWorldwideStandard" as const,
    daysKey: "deliveryWorldwideStandardDays" as const,
    price: "36 €",
  },
  {
    labelKey: "deliveryWorldwideExpress" as const,
    daysKey: "deliveryWorldwideExpressDays" as const,
    price: "50–60 €",
  },
];

export default async function OrderDeliveryPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = getLocaleFromSearchParams(resolvedSearchParams);
  const t = getTranslations(locale);

  return (
    <>
      <Nav />
      <main className="page-x page-pb-16 mx-auto w-full min-w-0 max-w-4xl space-y-8 pt-8 sm:space-y-10 sm:page-pb-20 sm:pt-12">
        <section className="min-w-0 space-y-4 text-center">
          <h1 className="text-[clamp(1.5rem,5.6vw,2.25rem)] font-normal tracking-tight text-slate-900 sm:tracking-normal">
            {t.order.title}
          </h1>
          <p className="text-sm text-slate-600 sm:text-base">{t.order.subtitle}</p>
        </section>
        <section className="mx-auto w-full max-w-2xl space-y-4 text-left">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-6">
            <div className="divide-y divide-slate-200">
              {deliveryRates.map((rate) => (
                <div
                  key={rate.labelKey}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 py-4 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-[13px] uppercase tracking-[0.16em] text-slate-700 sm:text-sm sm:tracking-[0.18em]">
                      {t.order[rate.labelKey]}
                    </p>
                    <p className="text-xs text-slate-500 sm:text-sm">
                      {t.order[rate.daysKey]}
                    </p>
                  </div>
                  <span className="shrink-0 text-right text-base font-semibold text-slate-900">
                    {rate.price}
                  </span>
                </div>
              ))}
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
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300 px-5 py-2 text-xs font-normal uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              >
                {t.order.whatsapp}
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300 px-5 py-2 text-xs font-normal uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
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
