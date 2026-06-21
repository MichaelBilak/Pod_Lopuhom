type NetworkInformationLike = {
  saveData?: boolean;
  effectiveType?: string;
};

function readNetworkInfo(): NetworkInformationLike | undefined {
  if (typeof navigator === "undefined") return undefined;
  return (navigator as Navigator & { connection?: NetworkInformationLike })
    .connection;
}

function isSlowConnection(connection: NetworkInformationLike | undefined): boolean {
  if (!connection) return false;
  if (connection.saveData) return true;
  return (
    connection.effectiveType === "slow-2g" ||
    connection.effectiveType === "2g" ||
    connection.effectiveType === "3g"
  );
}

type PrefetchGalleryImagesOptions = {
  isMobile?: boolean;
};

/** Warm the browser cache without flooding old phones or slow networks. */
export function prefetchGalleryImages(
  urls: string[],
  { isMobile = false }: PrefetchGalleryImagesOptions = {}
): { abort: () => void } {
  let aborted = false;
  let timer: number | null = null;
  let index = 0;

  if (!urls.length || typeof window === "undefined") {
    return { abort: () => {} };
  }

  const connection = readNetworkInfo();
  const slow = isSlowConnection(connection);
  const batchSize = slow ? 1 : isMobile ? 2 : 4;
  const delayMs = slow ? 450 : isMobile ? 200 : 80;

  const loadBatch = () => {
    if (aborted || index >= urls.length) return;

    const end = Math.min(index + batchSize, urls.length);
    for (let i = index; i < end; i += 1) {
      const img = new window.Image();
      img.decoding = "async";
      img.src = urls[i]!;
    }
    index = end;

    if (index < urls.length) {
      timer = window.setTimeout(loadBatch, delayMs);
    }
  };

  const start = () => {
    if (aborted) return;
    loadBatch();
  };

  if (isMobile && typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(start);
  } else {
    start();
  }

  return {
    abort: () => {
      aborted = true;
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
    },
  };
}
