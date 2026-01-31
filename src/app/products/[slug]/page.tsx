import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchProductBySlug } from "../../../../lib/products";

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
    <main className="min-h-screen bg-white text-ink">
      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <Link href="/" className="text-sm text-muted">
          ← Back to products
        </Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div className="grid gap-4">
            {product.images.map((image) => (
              <div
                key={image}
                className="overflow-hidden rounded-2xl border border-border bg-panel"
              >
                <img
                  src={image}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
          <div>
            <h1 className="text-3xl font-semibold">{product.title}</h1>
            <p className="mt-3 text-muted">{product.materials}</p>
            <p className="mt-2 text-sm text-muted">{product.price}</p>
            <p className="mt-6 text-base text-ink/80">
              {product.description}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
