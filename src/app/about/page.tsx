import FooterSocial from "@/src/components/FooterSocial";
import Nav from "@/src/components/Nav";
import Image from "next/image";
import {
  getLocaleFromSearchParams,
  getTranslations,
} from "@/src/lib/i18n";

export const metadata = {
  title: "Pod Lopuhom | About me",
};

type PageProps = {
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export default async function AboutPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = getLocaleFromSearchParams(resolvedSearchParams);
  const t = getTranslations(locale);
  return (
    <>
      <Nav />
      <main className="mx-auto w-full min-w-0 max-w-5xl space-y-12 px-4 pb-20 pt-8 sm:space-y-16 sm:px-6 sm:pb-28 sm:pt-12">
        <section className="min-w-0 space-y-6 sm:space-y-8">
          <h1 className="text-center text-[clamp(1.5rem,5.6vw,1.875rem)] font-normal tracking-tight text-slate-900 [overflow-wrap:anywhere] sm:text-3xl md:text-4xl">
            {t.about.title}
          </h1>
          <div className="grid min-w-0 items-start gap-6 sm:gap-8 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)] md:gap-10">
            <div className="about-photo-wrap mx-auto min-w-0 w-full max-w-[220px] md:mx-0 md:max-w-[280px]">
              <Image
                src="/images/about/about.jpg"
                alt="Olga BiIak portrait"
                width={560}
                height={680}
                sizes="(max-width: 768px) 220px, 280px"
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div className="min-w-0 text-base leading-relaxed text-slate-700 md:pt-2">
              <div className="space-y-4 text-[15px] [overflow-wrap:anywhere] md:text-base">
                <p>{t.about.paragraph1}</p>
                <p>{t.about.paragraph2}</p>
                <p>{t.about.paragraph3}</p>
                <p>{t.about.paragraph4}</p>
                {t.about.paragraph5 ? <p>{t.about.paragraph5}</p> : null}
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterSocial />
    </>
  );
}
