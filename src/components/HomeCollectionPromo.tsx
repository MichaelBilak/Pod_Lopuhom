import Image from "next/image";
import Link from "next/link";
import {
  collectionImageObjectPosition,
  collectionImagePath,
  type CollectionId,
} from "@/src/lib/collections";
import { withLang, type Locale } from "@/src/lib/i18n";

type HomeCollectionPromoProps = {
  locale: Locale;
  collectionsLabel: string;
};

function collectionHref(collection: CollectionId, locale: Locale) {
  return withLang(
    `/gallery?collection=${encodeURIComponent(collection)}`,
    locale
  );
}

export default function HomeCollectionPromo({
  locale,
  collectionsLabel,
}: HomeCollectionPromoProps) {
  return (
    <section
      aria-label={collectionsLabel}
      className="home-collection-promo flex min-w-0 flex-col gap-3 sm:gap-4"
    >
      <p className="collection-split__label-heading text-center text-[14px] font-medium uppercase tracking-[0.2em] text-slate-400 sm:text-[16px] sm:tracking-[0.28em]">
        {collectionsLabel}
      </p>
      <div className="collection-split-bleed edge-bleed-x min-w-0">
        <div className="collection-split relative overflow-hidden rounded-none">
          <div className="collection-split__grid grid grid-cols-[1fr_1px_1fr]">
            <Link
              href={collectionHref("Herbarium", locale)}
              className="collection-split__half group relative block min-h-0 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-900"
              aria-label="Herbarium collection"
            >
              <Image
                src={collectionImagePath("Herbarium")}
                alt=""
                fill
                sizes="(max-width: 1024px) 50vw, 480px"
                className="collection-split__image h-full w-full object-center transition duration-300 group-hover:scale-[1.03]"
                style={{ objectPosition: "50% 100%" }}
              />
              <div className="collection-split__text-scrim" aria-hidden />
              <span className="collection-split__label pointer-events-none absolute inset-0 flex items-center justify-center px-2 text-center font-normal uppercase tracking-[0.22em] text-white">
                Herbarium
              </span>
            </Link>
            <div
              className="collection-split__divider bg-white/90"
              aria-hidden
            />
            <Link
              href={collectionHref("Folia", locale)}
              className="collection-split__half group relative block min-h-0 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-900"
              aria-label="Folia collection"
            >
              <Image
                src={collectionImagePath("Folia")}
                alt=""
                fill
                sizes="(max-width: 1024px) 50vw, 480px"
                className="collection-split__image h-full w-full object-center transition duration-300 group-hover:scale-[1.03]"
                style={{
                  objectPosition: collectionImageObjectPosition("Folia"),
                }}
              />
              <div className="collection-split__text-scrim" aria-hidden />
              <span className="collection-split__label pointer-events-none absolute inset-0 flex items-center justify-center px-2 text-center font-normal uppercase tracking-[0.22em] text-white">
                Folia
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
