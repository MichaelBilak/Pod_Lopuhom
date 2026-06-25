import Image from "next/image";
import Link from "next/link";
import {
  collectionImageObjectPosition,
  collectionImagePath,
  type CollectionId,
} from "@/src/lib/collections";
import { withLang, type Locale } from "@/src/lib/i18n";

type CollectionTileProps = {
  collection: CollectionId;
  locale: Locale;
  variant?: "dropdown" | "home" | "drawer";
  onNavigate?: () => void;
  className?: string;
};

export default function CollectionTile({
  collection,
  locale,
  variant = "dropdown",
  onNavigate,
  className = "",
}: CollectionTileProps) {
  const href = withLang(
    `/gallery?collection=${encodeURIComponent(collection)}`,
    locale
  );

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={[
        "collection-tile group block overflow-hidden rounded-xl border border-slate-200/80 transition hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
        variant === "home" ? "collection-tile--home rounded-2xl" : "",
        variant === "drawer" ? "collection-tile--drawer" : "",
        className,
      ].join(" ")}
      aria-label={`${collection} collection`}
    >
      <div
        className={[
          "collection-tile__media relative overflow-hidden bg-slate-100",
          variant === "home"
            ? "aspect-[5/4] sm:aspect-[4/3]"
            : "aspect-[4/3]",
        ].join(" ")}
      >
        <Image
          src={collectionImagePath(collection)}
          alt=""
          width={400}
          height={300}
          sizes={
            variant === "home"
              ? "(max-width: 640px) 46vw, 320px"
              : "(max-width: 640px) 42vw, 176px"
          }
          className="collection-tile__image h-full w-full object-cover saturate-[0.72] brightness-[0.88] transition duration-300 group-hover:scale-[1.03]"
          style={{ objectPosition: collectionImageObjectPosition(collection) }}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-black/15"
          aria-hidden
        />
        <span className="collection-tile__label pointer-events-none absolute inset-0 flex items-center justify-center px-2 text-center font-normal uppercase tracking-[0.22em] text-white">
          {collection}
        </span>
      </div>
    </Link>
  );
}
