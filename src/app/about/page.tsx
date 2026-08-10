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
          <div className="grid min-w-0 items-start gap-6 sm:gap-8 md:grid-cols-[minmax(0,360px)_minmax(0,1fr)] md:gap-12">
            <div className="about-photo-wrap mx-auto min-w-0 w-full max-w-[360px] md:mx-0 md:max-w-[420px]">
              <Image
                src="/images/about/about.jpg"
                alt="Olga Bilak with wooden gnome sculpture"
                width={840}
                height={1050}
                sizes="(max-width: 768px) 360px, 420px"
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div className="min-w-0 text-base leading-relaxed text-slate-700 md:pt-2">
              <div className="space-y-4 text-[15px] [overflow-wrap:anywhere] md:text-base">
                {t.about.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <div className="about-gnome mt-10 flex justify-end">
                <Image
                  src="/images/about/gnome.png"
                  alt=""
                  width={320}
                  height={320}
                  className="h-auto w-[clamp(200px,42vw,320px)] object-contain opacity-95"
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
