import FooterSocial from "@/src/components/FooterSocial";
import Nav from "@/src/components/Nav";
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
      <main className="mx-auto w-full max-w-5xl space-y-16 px-6 pb-28 pt-12">
        <section className="space-y-8">
          <h1 className="text-center text-3xl font-semibold text-slate-900 md:text-4xl">
            {t.about.title}
          </h1>
          <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="about-photo-wrap">
              <img
                src="/images/about/about.jpg"
                alt="Olga BiIak portrait"
                className="h-full w-full object-cover"
                loading="eager"
                fetchPriority="high"
              />
            </div>
            <div className="p-2 text-base leading-relaxed text-slate-700 md:p-4">
              <div className="space-y-4 text-[15px] md:text-base">
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
