import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifyAdminSession } from "@/lib/auth";

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/k7fQ9aP2/:path*", "/api/admin/:path*"],
};
