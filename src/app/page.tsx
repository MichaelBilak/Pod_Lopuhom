import Link from "next/link";
import FooterSocial from "../components/FooterSocial";
import Nav from "../components/Nav";

export const metadata = {
  title: "Pod Lopuhom | Gallery",
};

export const dynamic = "force-dynamic";

const heroImages = [
  "/images/hero%20img/07f7770a-2ca1-441e-916d-74066ce348be.jpg",
  "/images/hero%20img/IMG_2028.JPG",
  "/images/hero%20img/IMG_3292.JPG",
  "/images/hero%20img/IMG_6353%20(2).JPG",
  "/images/hero%20img/IMG_6912.jpg",
  "/images/hero%20img/IMG_9258.JPG",
];

const shuffle = (images: string[]) => {
  const result = [...images];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export default function HomePage() {
  const randomizedHeroImages = shuffle(heroImages);

  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-6xl space-y-20 px-6 pb-28 pt-12">
        <section className="hero-panel text-center">
          <div className="hero-backdrop" aria-hidden="true">
            {randomizedHeroImages.map((src) => (
              <img
                key={src}
                className="hero-slide"
                src={src}
                alt=""
                decoding="async"
                loading="eager"
                fetchPriority="high"
              />
            ))}
            <span className="hero-wash" />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_6px_18px_rgba(15,23,42,0.06)] sm:h-28 sm:w-28">
              <img
                src="/images/products/Logo.%20pod_lopuhom.jpeg"
                alt="Pod Lopuhom logo"
                className="h-full w-full object-cover object-center"
                loading="eager"
                fetchPriority="high"
              />
            </div>
            <div className="space-y-6">
              <h1 className="text-3xl font-semibold text-slate-900 md:text-5xl">
                Welcome to my creation!
              </h1>
              <p className="mx-auto max-w-xl text-base text-slate-700">
                Choose the piece you like and feel free to message me.
              </p>
            </div>
          </div>
        </section>
        <div className="flex flex-wrap items-center justify-center gap-6 text-center">
          {["Rings", "Necklaces", "Earrings"].map((label) => (
            <Link
              key={label}
              href={`/gallery?category=${encodeURIComponent(label)}`}
              className="px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-600 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:text-xs"
            >
              <span className="border-b border-transparent pb-2 transition hover:border-slate-400">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </main>
      <FooterSocial />
    </>
  );
}
