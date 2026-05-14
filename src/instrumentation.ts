/**
 * Next.js instrumentation hook (runs once per server startup).
 *
 * Forces Node.js DNS resolver to prefer IPv4 when talking to Supabase / any
 * external HTTPS host. On Windows, the default ("verbatim") order often
 * picks an IPv6 path that gets reset mid-handshake → manifests as random
 * `TypeError: fetch failed / ECONNRESET` from Supabase JS in the server.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { setDefaultResultOrder } = await import("node:dns");
    setDefaultResultOrder("ipv4first");
  }
}
