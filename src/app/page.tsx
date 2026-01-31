import FooterSocial from "../components/FooterSocial";
import Nav from "../components/Nav";

export const metadata = {
  title: "MAMA | Gallery",
};

export default function HomePage() {
  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-6xl space-y-20 px-6 pb-28 pt-12">
        <section className="hero-panel text-center">
          <div className="hero-backdrop" aria-hidden="true">
            <img
              className="hero-slide"
              src="/images/hero%20img/07f7770a-2ca1-441e-916d-74066ce348be.jpg"
              alt=""
              decoding="async"
              loading="eager"
              fetchPriority="high"
            />
            <img
              className="hero-slide"
              src="/images/hero%20img/IMG_2028.JPG"
              alt=""
              decoding="async"
              loading="eager"
              fetchPriority="high"
            />
            <img
              className="hero-slide"
              src="/images/hero%20img/IMG_3292.JPG"
              alt=""
              decoding="async"
              loading="eager"
              fetchPriority="high"
            />
            <img
              className="hero-slide"
              src="/images/hero%20img/IMG_6353%20(2).JPG"
              alt=""
              decoding="async"
              loading="eager"
              fetchPriority="high"
            />
            <img
              className="hero-slide"
              src="/images/hero%20img/IMG_6912.jpg"
              alt=""
              decoding="async"
              loading="eager"
              fetchPriority="high"
            />
            <img
              className="hero-slide"
              src="/images/hero%20img/IMG_9258.JPG"
              alt=""
              decoding="async"
              loading="eager"
              fetchPriority="high"
            />
            <span className="hero-wash" />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_6px_18px_rgba(15,23,42,0.06)] sm:h-28 sm:w-28">
              <img
                src="/images/products/Logo.%20pod_lopuhom.jpeg"
                alt="MAMA logo"
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
        <div className="flex flex-wrap items-center justify-center gap-4 text-center">
          {["Rings", "Necklaces", "Earrings"].map((label) => (
            <button
              key={label}
              type="button"
              className="bg-transparent px-2 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-700 underline decoration-slate-300 decoration-2 underline-offset-[10px] transition hover:text-slate-900 hover:decoration-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              {label}
            </button>
          ))}
        </div>
      </main>
      <FooterSocial />
    </>
  );
}
