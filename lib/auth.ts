const textEncoder = new TextEncoder();

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type AdminJwtPayload = {
  iat: number;
  exp: number;
  role: "admin";
};

type SessionCookieOptions = {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
  maxAge: number;
  expires: Date;
};

const base64UrlToBase64 = (input: string) => {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  return padded + "=".repeat(padLength);
};

const base64ToBytes = (base64: string) => {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(base64, "base64"));
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const bytesToBase64 = (bytes: Uint8Array) => {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
};

const base64UrlEncode = (input: string | Uint8Array) => {
  const bytes = typeof input === "string" ? textEncoder.encode(input) : input;
  const base64 = bytesToBase64(bytes);
  return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
};

const base64UrlDecodeJson = <T,>(input: string): T | null => {
  try {
    const base64 = base64UrlToBase64(input);
    const bytes = base64ToBytes(base64);
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
};

const getHmacKey = async (secret: string) => {
  if (!globalThis.crypto?.subtle) {
    throw new Error("WebCrypto is not available.");
  }
  return globalThis.crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
};

const signHmac = async (data: string, secret: string) => {
  const key = await getHmacKey(secret);
  const signature = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(data)
  );
  return new Uint8Array(signature);
};

const verifyHmac = async (
  data: string,
  signature: Uint8Array,
  secret: string
) => {
  const key = await getHmacKey(secret);
  const signatureData = signature.buffer.slice(
    signature.byteOffset,
    signature.byteOffset + signature.byteLength
  ) as ArrayBuffer;
  return globalThis.crypto.subtle.verify(
    "HMAC",
    key,
    signatureData,
    textEncoder.encode(data)
  );
};

const signJwt = async (payload: AdminJwtPayload, secret: string) => {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = await signHmac(data, secret);
  const encodedSignature = base64UrlEncode(signature);
  return `${data}.${encodedSignature}`;
};

const verifyJwt = async (token: string, secret: string) => {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const data = `${encodedHeader}.${encodedPayload}`;
  const signatureBytes = base64ToBytes(base64UrlToBase64(encodedSignature));
  const validSignature = await verifyHmac(data, signatureBytes, secret);
  if (!validSignature) return null;
  return base64UrlDecodeJson<AdminJwtPayload>(encodedPayload);
};

export const constantTimeEqual = (a: string, b: string) => {
  const aBytes = textEncoder.encode(a);
  const bBytes = textEncoder.encode(b);
  const maxLen = Math.max(aBytes.length, bBytes.length);
  let diff = aBytes.length ^ bBytes.length;
  for (let i = 0; i < maxLen; i += 1) {
    diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return diff === 0;
};

export const getSessionCookieOptions = (): SessionCookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
  expires: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000),
});

export const getClearSessionCookieOptions = (): SessionCookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 0,
  expires: new Date(0),
});

export const getAdminEnv = () => {
  const login = process.env.ADMIN_LOGIN ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.ADMIN_SESSION_SECRET ?? "";
  if (!login || !password || !secret) {
    return null;
  }
  return { login, password, secret };
};

export const signAdminSession = async (secret: string) => {
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminJwtPayload = {
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS,
    role: "admin",
  };
  return signJwt(payload, secret);
};

export const verifyAdminSession = async (
  token: string | undefined,
  secret: string | undefined
) => {
  if (!token || !secret) return null;
  const payload = await verifyJwt(token, secret);
  if (!payload) return null;
  if (payload.role !== "admin") return null;
  if (typeof payload.exp !== "number") return null;
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
};
