import FooterSocial from "../../components/FooterSocial";
import Nav from "../../components/Nav";

export const metadata = {
  title: "MAMA | About",
};

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-5xl space-y-16 px-6 pb-28 pt-12">
        <section className="space-y-8">
          <h1 className="text-center text-3xl font-semibold text-slate-900 md:text-4xl">
            About
          </h1>
          <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
              <img
                src="/images/about/about.jpg"
                alt="Olga BiIak portrait"
                className="h-full w-full rounded-2xl object-cover"
                loading="eager"
                fetchPriority="high"
              />
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 text-base text-slate-700 shadow-[0_16px_40px_rgba(15,23,42,0.06)] md:p-8">
              <p>
                Hello! I&apos;m Olga BiIak. I create epoxy resin jewelry that
                holds real dried flowers.
                <br />
                Through my work, I try to gently preserve what nature gives us
                and what our memories leave behind.
              </p>
            </div>
          </div>
        </section>
      </main>
      <FooterSocial />
    </>
  );
}
