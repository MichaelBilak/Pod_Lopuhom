import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  getClearSessionCookieOptions,
} from "@/lib/auth";

const parseWantsJson = (req: Request) => {
  const contentType = req.headers.get("content-type") ?? "";
  return contentType.includes("application/json");
};

export async function POST(req: Request) {
  const response = parseWantsJson(req)
    ? NextResponse.json({ ok: true })
    : NextResponse.redirect(new URL("/k7fQ9aP2?login=1", req.url), {
        status: 303,
      });
  response.cookies.set(SESSION_COOKIE, "", getClearSessionCookieOptions());
  return response;
}
