import FooterSocial from "../../components/FooterSocial";
import Nav from "../../components/Nav";
import { fetchProducts } from "../../../lib/products";
import GalleryClient from "./GalleryClient";

export const metadata = {
  title: "MAMA | Gallery",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
          <GalleryClient products={products} />
        </section>
      </main>
      <FooterSocial />
    </>
  );
}
