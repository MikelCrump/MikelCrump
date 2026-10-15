import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_TTL_MS,
  createSessionToken,
  siteAuthEnv,
  verifyPassword,
} from "@/lib/site-auth";

/** Only allow same-site relative redirects after sign-in. */
function safeNext(raw: FormDataEntryValue | null): string {
  const next = typeof raw === "string" ? raw : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/life";
}

function back(request: Request, error: string, next: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", error);
  url.searchParams.set("next", next);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const form = await request.formData();
  const next = safeNext(form.get("next"));
  const { email, passwordHash, secret } = siteAuthEnv();
  if (!email || !passwordHash || !secret) return back(request, "config", next);

  const givenEmail = String(form.get("email") ?? "").trim().toLowerCase();
  const givenPassword = String(form.get("password") ?? "");
  const ok = givenEmail === email && (await verifyPassword(givenPassword, passwordHash));
  if (!ok) {
    // Slow down guessing a little on top of PBKDF2's cost.
    await new Promise((r) => setTimeout(r, 600));
    return back(request, "invalid", next);
  }

  const res = NextResponse.redirect(new URL(next, request.url), 303);
  res.cookies.set(SESSION_COOKIE, await createSessionToken(email, secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  return res;
}
