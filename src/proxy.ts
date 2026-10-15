import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, siteAuthEnv, verifySessionToken } from "@/lib/site-auth";

/** Paths that must work without the owner's login cookie. */
function isPublic(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname.startsWith("/api/auth/") ||
    // Tesla fetches the partner public key from here.
    pathname.startsWith("/.well-known/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt"
  );
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  // The iPhone Shortcut can't sign in; it may bypass the login only when the
  // endpoint has its own shared secret configured (the route enforces it).
  if (pathname === "/api/life/location" && process.env.LIFE_LOCATION_WEBHOOK_SECRET) {
    return NextResponse.next();
  }

  const { email, secret } = siteAuthEnv();
  const signedIn = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
    secret,
    email,
  );
  if (signedIn) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, detail: "Sign in required" }, { status: 401 });
  }
  const login = new URL("/login", request.url);
  login.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export const config = {
  // Everything except Next's own static assets.
  matcher: ["/((?!_next/static|_next/image).*)"],
};
