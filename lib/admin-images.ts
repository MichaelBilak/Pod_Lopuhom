import { resolveProductImageSrc } from "@/lib/image-url";

export type AdminImageSize = "thumb" | "grid" | "preview" | "editor";

const ADMIN_IMAGE_PROFILES = {
  /** Product list row — 56×56 CSS px */
  thumb: { displayWidth: 56, quality: 68, pixelRatio: 2 },
  /** Image manager grid — ~112px tall cells */
  grid: { displayWidth: 160, quality: 72, pixelRatio: 1.5 },
  /** Live preview card / product page mock */
  preview: { displayWidth: 320, quality: 74, pixelRatio: 1.5 },
  /** Position editor modal */
  editor: { displayWidth: 512, quality: 80, pixelRatio: 1.5 },
} as const satisfies Record<
  AdminImageSize,
  { displayWidth: number; quality: number; pixelRatio: number }
>;

export function adminProductImageSrc(
  url: string,
  size: AdminImageSize = "grid"
): string {
  const profile = ADMIN_IMAGE_PROFILES[size];
  return resolveProductImageSrc(url, {
    displayWidth: profile.displayWidth,
    quality: profile.quality,
    pixelRatio: profile.pixelRatio,
  }).src;
}
