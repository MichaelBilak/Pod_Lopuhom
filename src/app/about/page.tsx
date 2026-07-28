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
      <main className="page-x page-pb-20 mx-auto w-full min-w-0 max-w-5xl space-y-12 pt-8 sm:space-y-16 sm:page-pb-28 sm:pt-12">
        <section className="min-w-0 space-y-6 sm:space-y-8">
          <h1 className="text-center text-[clamp(1.5rem,5.6vw,1.875rem)] font-normal tracking-tight text-slate-900 [overflow-wrap:anywhere] sm:text-3xl md:text-4xl">
            {t.about.title}
          </h1>
          <div className="grid min-w-0 items-start gap-6 sm:gap-8 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)] md:gap-10">
            <div className="about-photo-wrap mx-auto min-w-0 w-full max-w-[260px] md:mx-0 md:max-w-[320px]">
              <Image
                src="/images/about/about.jpg"
                alt="Olga Bilak with wooden gnome sculpture"
                width={640}
                height={800}
                sizes="(max-width: 768px) 260px, 320px"
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
                {t.about.paragraph6 ? <p>{t.about.paragraph6}</p> : null}
              </div>
              <div className="about-gnome mt-8 flex justify-end">
                <Image
                  src="/images/about/gnome.png"
                  alt=""
                  width={220}
                  height={220}
                  className="h-auto w-[clamp(140px,28vw,220px)] object-contain opacity-90"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterSocial />
    </>
  );
}
