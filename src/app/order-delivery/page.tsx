import FooterSocial from "../../components/FooterSocial";
import Nav from "../../components/Nav";

export const metadata = {
  title: "MAMA | Order & Delivery",
};

export default function OrderDeliveryPage() {
  const instagramUrl = "https://instagram.com/your_handle";
  const whatsappNumber = "972501234567";
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-4xl space-y-10 px-6 pb-20 pt-12">
        <section className="space-y-4 text-center">
          <h1 className="text-4xl font-semibold text-slate-900">
            Order & Delivery
          </h1>
          <p className="text-base text-slate-600">
            We send jewelry anywhere in the world.
          </p>
        </section>
        <section className="mx-auto w-full max-w-2xl space-y-4 text-left">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <div className="space-y-4 text-sm uppercase tracking-[0.2em] text-slate-700">
              <div className="grid gap-3 border-b border-slate-200 pb-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <span>Delivery within Israel by Israel Post</span>
                <span className="text-right text-base font-semibold text-slate-900 sm:min-w-[96px]">
                  25 ILS
                </span>
              </div>
              <div className="grid gap-3 border-b border-slate-200 pb-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <span>Self-pickup and delivery within Haifa directly to your door</span>
                <span className="text-right text-base font-semibold text-slate-900 sm:min-w-[96px]">
                  Free
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <span>Worldwide delivery</span>
                <span className="text-right text-base font-semibold text-slate-900 sm:min-w-[96px]">
                  13 EUR
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto w-full max-w-2xl space-y-4 text-center">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-600">
              To place an order, please message us:
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-slate-300 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              >
                WhatsApp
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-slate-300 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              >
                Instagram
              </a>
            </div>
          </div>
        </section>
      </main>
      <FooterSocial />
    </>
  );
}
