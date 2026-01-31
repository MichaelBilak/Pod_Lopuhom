import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchProductBySlug } from "../../../../lib/products";
import FooterSocial from "../../../components/FooterSocial";
import Nav from "../../../components/Nav";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) {
    notFound();
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-white text-ink">
        <section className="mx-auto w-full max-w-5xl px-6 pb-20 pt-12">
          <Link href="/gallery" className="text-sm text-slate-600">
            ← Back to gallery
          </Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div className="grid gap-4">
              {product.images.map((image, index) => (
                <div
                  key={image}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                >
                  <img
                    src={image}
                    alt={product.title}
                    className="h-full w-full object-cover"
                    loading="eager"
                    fetchPriority={index === 0 ? "high" : "auto"}
                  />
                </div>
              ))}
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
              <h1 className="text-3xl font-semibold text-slate-900">
                {product.title}
              </h1>
              <p className="mt-3 text-sm text-slate-600">
                {product.description}
              </p>
              <p className="mt-4 text-sm text-slate-600">
                Materials: {product.materials}
              </p>
              <p className="mt-4 text-2xl font-semibold text-slate-900">
                {product.price}
              </p>
            </div>
          </div>
        </section>
      </main>
      <FooterSocial />
    </>
  );
}
