import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  constantTimeEqual,
  getAdminEnv,
  getSessionCookieOptions,
  signAdminSession,
} from "../../../../../lib/auth";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const failureMap = new Map<string, { count: number; windowStart: number }>();

const getClientIp = (req: Request) => {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return req.headers.get("x-real-ip") || "unknown";
};

const isRateLimited = (ip: string) => {
  const now = Date.now();
  const record = failureMap.get(ip);
  if (!record) return false;
  if (now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    failureMap.delete(ip);
    return false;
  }
  return record.count >= RATE_LIMIT_MAX_ATTEMPTS;
};

const recordFailure = (ip: string) => {
  const now = Date.now();
  const record = failureMap.get(ip);
  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    failureMap.set(ip, { count: 1, windowStart: now });
    return;
  }
  record.count += 1;
  failureMap.set(ip, record);
};

const clearFailures = (ip: string) => {
  failureMap.delete(ip);
};

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const parseCredentials = async (req: Request) => {
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => null);
    return {
      login: typeof body?.login === "string" ? body.login : "",
      password: typeof body?.password === "string" ? body.password : "",
      isJson: true,
    };
  }
  const form = await req.formData();
  return {
    login: typeof form.get("login") === "string" ? String(form.get("login")) : "",
    password:
      typeof form.get("password") === "string"
        ? String(form.get("password"))
        : "",
    isJson: false,
  };
};

export async function POST(req: Request) {
  const env = getAdminEnv();
  if (!env) {
    return NextResponse.json(
      { message: "Server misconfigured." },
      { status: 500 }
    );
  }

  const { login, password, isJson } = await parseCredentials(req);
  const ip = getClientIp(req);

  if (isRateLimited(ip)) {
    if (isJson) {
      return NextResponse.json(
        { message: "Too many attempts. Try again later." },
        { status: 429 }
      );
    }
    return NextResponse.redirect(
      new URL("/k7fQ9aP2?error=1", req.url),
      { status: 303 }
    );
  }

  const loginOk = constantTimeEqual(login, env.login);
  const passwordOk = constantTimeEqual(password, env.password);
  if (!loginOk || !passwordOk) {
    recordFailure(ip);
    await sleep(600);
    if (isJson) {
      return NextResponse.json(
        { message: "Invalid credentials." },
        { status: 401 }
      );
    }
    return NextResponse.redirect(
      new URL("/k7fQ9aP2?error=1", req.url),
      { status: 303 }
    );
  }

  clearFailures(ip);
  const token = await signAdminSession(env.secret);
  const response = isJson
    ? NextResponse.json({ ok: true })
    : NextResponse.redirect(new URL("/k7fQ9aP2", req.url), { status: 303 });
  response.cookies.set(SESSION_COOKIE, token, getSessionCookieOptions());
  return response;
}
