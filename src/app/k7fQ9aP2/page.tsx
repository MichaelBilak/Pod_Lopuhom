import { cookies } from "next/headers";
import { SESSION_COOKIE, verifyAdminSession } from "../../../lib/auth";
import { fetchProducts } from "../../../lib/products";
import AdminClient from "./AdminClient";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    login?: string;
    logout?: string;
  }>;
};

export default async function AdminPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = await verifyAdminSession(
    token,
    process.env.ADMIN_SESSION_SECRET
  );
  const isAuthenticated = Boolean(session);
  const showError = resolvedSearchParams.error === "1";
  const showLoginHint = resolvedSearchParams.login === "1";

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100">
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8 shadow-xl">
            <h1 className="text-2xl font-semibold">Admin access</h1>
            <p className="mt-2 text-sm text-neutral-400">
              Enter the admin login and password to continue.
            </p>
            {showLoginHint && (
              <div className="mt-4 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-xs text-neutral-300">
                Please sign in to view the admin dashboard.
              </div>
            )}
            {showError && (
              <div className="mt-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-xs text-red-200">
                Invalid login or password. Please try again.
              </div>
            )}
            <form
              className="mt-6 space-y-4"
              method="post"
              action="/api/auth/login"
            >
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-neutral-400">
                  Login
                </label>
                <input
                  name="login"
                  type="text"
                  autoComplete="username"
                  required
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-neutral-600 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-neutral-400">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-neutral-600 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200"
              >
                Sign in
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  const products = await fetchProducts();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Admin dashboard</h1>
            <p className="mt-2 text-sm text-neutral-400">
              Products editor placeholder.
            </p>
          </div>
          <form method="post" action="/api/auth/logout">
            <button
              type="submit"
              className="rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-100 transition hover:border-neutral-500"
            >
              Logout
            </button>
          </form>
        </div>
        <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 text-sm text-neutral-300">
          Manage products and update the catalog.
        </div>
        <AdminClient initialProducts={products} />
      </div>
    </main>
  );
}
