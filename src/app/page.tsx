import Link from "next/link";
import { fetchProducts } from "../../lib/products";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function HomePage() {
  const products = await fetchProducts();

  return (
    <main className="min-h-screen bg-white text-ink">
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="mb-10">
          <h1 className="text-4xl font-semibold">Mama Atelier</h1>
          <p className="mt-3 text-muted">
            Handmade jewelry crafted with soft textures and refined details.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group rounded-2xl border border-border bg-panel p-4 shadow-soft transition hover:-translate-y-1"
            >
              <div className="aspect-square overflow-hidden rounded-xl border border-border bg-white">
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : null}
              </div>
              <div className="mt-4">
                <div className="text-lg font-semibold">{product.title}</div>
                <div className="mt-1 text-sm text-muted">
                  {product.materials}
                </div>
                <div className="mt-2 text-sm text-muted">
                  {product.price}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
