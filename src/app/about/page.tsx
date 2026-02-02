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
            <div className="p-2 text-base leading-relaxed text-slate-700 md:p-4">
              <div className="space-y-4 text-[15px] md:text-base">
                <p>
                  Hello! I&apos;m Olga. I am a handmade jewelry artist, working
                  with jewelry epoxy resin.
                </p>
                <p>
                  In each piece, I try to preserve what nature gives us only
                  for a short while. Inside my work are real flowers, small
                  branches, and leaves — carefully dried and thoughtfully
                  saved.
                </p>
                <p>
                  Flowers fade, moments pass, and yet sometimes we want to hold
                  on to feelings and memories just a little longer, to carry
                  them with us and keep them close.
                </p>
                <p>
                  My jewelry is for those who notice the little details and
                  would love to wear a small piece of nature with them.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterSocial />
    </>
  );
}
