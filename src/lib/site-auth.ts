/**
 * Single-owner site login.
 *
 * - The password is never stored: SITE_PASSWORD_HASH holds a PBKDF2-SHA256 hash
 *   ("pbkdf2:<iterations>:<saltB64>:<hashB64>"; colons, not "$",
 *   so .env variable expansion can't mangle it), set via `pnpm auth:set-password`.
 * - A session is an HMAC-signed cookie ("<email>.<expiresMs>.<sigB64url>") keyed by
 *   SITE_SESSION_SECRET. Uses Web Crypto only, so it runs in the proxy and in routes.
 */

export const SESSION_COOKIE = "site_session";
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const PBKDF2_ITERATIONS = 310_000;

const enc = new TextEncoder();

function toB64(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s);
}

function fromB64(b64: string): Uint8Array {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

const toB64url = (bytes: ArrayBuffer) =>
  toB64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/** Constant-time string comparison. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function siteAuthEnv() {
  return {
    email: process.env.SITE_OWNER_EMAIL?.trim().toLowerCase() || undefined,
    passwordHash: process.env.SITE_PASSWORD_HASH?.trim() || undefined,
    secret: process.env.SITE_SESSION_SECRET?.trim() || undefined,
  };
}

export async function hashPassword(
  password: string,
  salt: Uint8Array = crypto.getRandomValues(new Uint8Array(16)),
  iterations = PBKDF2_ITERATIONS,
): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations },
    key,
    256,
  );
  return `pbkdf2:${iterations}:${toB64(salt)}:${toB64(bits)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iter, saltB64, hashB64] = stored.split(":");
  const iterations = Number(iter);
  if (scheme !== "pbkdf2" || !Number.isInteger(iterations) || !saltB64 || !hashB64) {
    return false;
  }
  const candidate = await hashPassword(password, fromB64(saltB64), iterations);
  return safeEqual(candidate, stored);
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toB64url(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

export async function createSessionToken(
  email: string,
  secret: string,
  now = Date.now(),
): Promise<string> {
  const payload = `${toB64(enc.encode(email))}.${now + SESSION_TTL_MS}`;
  return `${payload}.${await hmac(secret, payload)}`;
}

/** Returns the signed-in email, or null if the token is missing, forged or expired. */
export async function verifySessionToken(
  token: string | undefined,
  secret: string | undefined,
  expectedEmail: string | undefined,
  now = Date.now(),
): Promise<string | null> {
  if (!token || !secret || !expectedEmail) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [emailB64, expires, sig] = parts as [string, string, string];
  if (!safeEqual(await hmac(secret, `${emailB64}.${expires}`), sig)) return null;
  if (!(Number(expires) > now)) return null;
  let email: string;
  try {
    email = new TextDecoder().decode(fromB64(emailB64));
  } catch {
    return null;
  }
  return email === expectedEmail ? email : null;
}
