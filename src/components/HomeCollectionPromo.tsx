import CollectionTile from "@/src/components/CollectionTile";
import { COLLECTIONS } from "@/src/lib/collections";
import type { Locale } from "@/src/lib/i18n";

type HomeCollectionPromoProps = {
  locale: Locale;
};

export default function HomeCollectionPromo({ locale }: HomeCollectionPromoProps) {
  return (
    <section
      aria-label="Collections"
      className="home-collection-promo grid min-w-0 grid-cols-2 gap-3 sm:gap-5"
    >
      {COLLECTIONS.map((collection) => (
        <CollectionTile
          key={collection}
          collection={collection}
          locale={locale}
          variant="home"
        />
      ))}
    </section>
  );
}
