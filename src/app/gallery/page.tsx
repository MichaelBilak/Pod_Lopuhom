import Link from "next/link";
import FooterSocial from "../../components/FooterSocial";
import Nav from "../../components/Nav";
import { fetchProducts } from "../../../lib/products";

export const metadata = {
  title: "MAMA | Gallery",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const imageFocus: Record<string, string> = {
  "/images/products/product_7.0.JPG": "35% 55%",
};

const getObjectPosition = (src: string) => imageFocus[src] ?? "50% 50%";

export default async function GalleryPage() {
  const products = await fetchProducts();

  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-6xl space-y-14 px-6 pb-24 pt-12">
        <section className="space-y-7 text-center">
          <h1 className="text-5xl font-medium tracking-tight text-slate-900 md:text-6xl">
            Gallery
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-semibold uppercase tracking-[0.34em] text-slate-500">
            {["Rings", "Necklaces", "Earrings"].map((label) => (
              <button
                key={label}
                type="button"
                className="border-b border-transparent pb-2 transition hover:border-slate-400 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section id="gallery" className="space-y-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-3xl border border-slate-100 bg-white transition hover:border-slate-200"
              >
                <Link
                  href={`/products/${product.slug}`}
                  className="flex h-full w-full flex-col gap-3 rounded-3xl p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                  aria-label={`Open ${product.title} details`}
                >
                  <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-slate-50 sm:h-72 lg:h-80">
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="h-full w-full origin-center rounded-2xl object-cover object-center transition duration-300 group-hover:scale-[1.04]"
                        style={{
                          objectPosition: getObjectPosition(product.images[0]),
                        }}
                        loading="eager"
                        fetchPriority="high"
                      />
                    ) : null}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100"></div>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 px-1 pb-1">
                    <p className="whitespace-nowrap text-xs font-medium tracking-[0.02em] text-slate-900 sm:text-sm">
                      {product.title}
                    </p>
                    <p className="whitespace-nowrap text-xs text-slate-500 sm:block">
                      {product.materials}
                    </p>
                    <div className="mt-auto flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
                      <span className="whitespace-nowrap text-base font-semibold leading-tight text-slate-900 sm:text-lg">
                        {product.price}
                      </span>
                      <span className="hidden whitespace-nowrap text-[10px] uppercase tracking-[0.22em] text-slate-400 sm:inline sm:text-right">
                        View details
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      <FooterSocial />
    </>
  );
}
