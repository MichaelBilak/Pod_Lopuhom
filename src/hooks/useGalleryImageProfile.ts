"use client";

import { useEffect, useState } from "react";
import {
  GALLERY_IMAGE_UNIVERSAL,
  getGalleryLoadingProfile,
} from "@/lib/gallery-images";

const MOBILE_MEDIA_QUERY = "(max-width: 640px)";

export function useGalleryImageProfile() {
  // Keep false until mount so SSR and the first client render stay in sync.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const update = () => setIsMobile(mediaQuery.matches);

    update();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", update);
      return () => mediaQuery.removeEventListener("change", update);
    }

    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, []);

  return {
    isMobile,
    profile: {
      ...GALLERY_IMAGE_UNIVERSAL,
      ...getGalleryLoadingProfile(isMobile),
    },
  };
}
