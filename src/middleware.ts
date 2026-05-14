import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifyAdminSession } from "@/lib/auth";

const LOCALE_COOKIE = "lang";

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const token = req.cookies.get(SESSION_COOKIE)?.value;

  const session = await verifyAdminSession(
    token,
    process.env.ADMIN_SESSION_SECRET
  );

  const isAuthed = Boolean(session);

  if (pathname.startsWith("/api/admin")) {
    if (!isAuthed) {
      return new NextResponse("Not Found", { status: 404 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/k7fQ9aP2")) {
    if (!isAuthed && pathname !== "/k7fQ9aP2") {
      url.searchParams.set("login", "1");
      url.pathname = "/k7fQ9aP2";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Public pages: persist locale in cookie and redirect if missing lang but cookie set
  const langParam = url.searchParams.get("lang");
  const localeCookie = req.cookies.get(LOCALE_COOKIE)?.value;
  if (langParam === "ru" || langParam === "en" || langParam === "it") {
    const res = NextResponse.next();
    res.cookies.set(LOCALE_COOKIE, langParam, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    return res;
  }
  if (localeCookie === "ru" || localeCookie === "en" || localeCookie === "it") {
    url.searchParams.set("lang", localeCookie);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/gallery", "/gallery/:path*", "/about", "/order-delivery", "/products/:path*", "/k7fQ9aP2/:path*", "/api/admin/:path*"],
};
