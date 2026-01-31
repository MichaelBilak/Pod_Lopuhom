import FooterSocial from "../../components/FooterSocial";
import Nav from "../../components/Nav";

export const metadata = {
  title: "MAMA | Order & Delivery",
};

export default function OrderDeliveryPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-4xl space-y-8 px-6 pb-20 pt-12">
        <section className="space-y-4 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">
            Order & Delivery
          </h1>
          <p className="text-base text-slate-600">
            We send jewelry anywhere in the world.
          </p>
        </section>
        <section className="mx-auto w-full max-w-2xl space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-slate-200 py-3 text-sm uppercase tracking-[0.2em] text-slate-700">
            <span>Delivery within Israel by Israel Post</span>
            <span>25 ILS</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200 py-3 text-sm uppercase tracking-[0.2em] text-slate-700">
            <span>Self-pickup and delivery within Haifa directly to your door</span>
            <span>0 ILS</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200 py-3 text-sm uppercase tracking-[0.2em] text-slate-700">
            <span>Worldwide delivery</span>
            <span>13 EUR</span>
          </div>
        </section>
      </main>
      <FooterSocial />
    </>
  );
}
