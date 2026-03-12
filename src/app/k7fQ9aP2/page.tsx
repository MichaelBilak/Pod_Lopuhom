import Link from "next/link";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifyAdminSession } from "@/lib/auth";
import { fetchProductsAdmin } from "@/lib/supabase-products";
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
      <main className="min-h-screen bg-white text-slate-900">
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <h1 className="text-2xl font-semibold text-slate-900">
              Admin access
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Enter the admin login and password to continue.
            </p>
            {showLoginHint && (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                Please sign in to view the admin dashboard.
              </div>
            )}
            {showError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                Invalid login or password. Please try again.
              </div>
            )}
            <form
              className="mt-6 space-y-4"
              method="post"
              action="/api/auth/login"
            >
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-slate-500">
                  Login
                </label>
                <input
                  name="login"
                  type="text"
                  autoComplete="username"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-slate-500">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Sign in
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  const products = await fetchProductsAdmin();

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Admin dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Manage products and catalog.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300"
            >
              Back to home
            </Link>
            <form method="post" action="/api/auth/logout">
              <button
                type="submit"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-400"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
        <AdminClient initialProducts={products} />
      </div>
    </main>
  );
}
