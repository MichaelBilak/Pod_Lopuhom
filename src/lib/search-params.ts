/** Safe copy of URL search params (avoids .toString() issues during client navigation). */
export function copySearchParams(
  source: { forEach: (fn: (value: string, key: string) => void) => void } | null | undefined
): URLSearchParams {
  const params = new URLSearchParams();
  source?.forEach((value, key) => {
    params.set(key, value);
  });
  return params;
}

export function buildQueryHref(
  pathname: string,
  source: { forEach: (fn: (value: string, key: string) => void) => void } | null | undefined,
  updates: Record<string, string | null>
): string {
  const params = copySearchParams(source);
  for (const [key, value] of Object.entries(updates)) {
    if (value === null) params.delete(key);
    else params.set(key, value);
  }
  const query = params.toString();
  return `${pathname}${query ? `?${query}` : ""}`;
}
