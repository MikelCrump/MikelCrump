import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { MARKETING_BASE, PRODUCT_START } from "@/lib/site";

// Node.js runtime — required for Vercel temp/anonymous deploys (Edge deprecated there).
export const runtime = "nodejs";

const PRODUCT_HOSTS = new Set([
  "crump360.com",
  "www.crump360.com",
]);

const MARKETING_HOSTS = new Set([
  "crumpusa.org",
  "www.crumpusa.org",
]);

function hostname(req: NextRequest) {
  return (req.headers.get("host") ?? "").split(":")[0].toLowerCase();
}

export function middleware(req: NextRequest) {
  const host = hostname(req);
  const { pathname } = req.nextUrl;

  // Local / preview: leave paths alone (both marketing + product available).
  const isProductHost = PRODUCT_HOSTS.has(host);
  const isMarketingHost = MARKETING_HOSTS.has(host);

  if (isProductHost) {
    // Product domain: root → start; marketing tree → parent org site.
    if (pathname === "/" || pathname === "") {
      const url = req.nextUrl.clone();
      url.pathname = PRODUCT_START;
      return NextResponse.redirect(url);
    }
    if (
      pathname === MARKETING_BASE ||
      pathname.startsWith(`${MARKETING_BASE}/`)
    ) {
      const url = new URL(
        `https://crumpusa.org${pathname}${req.nextUrl.search}`
      );
      return NextResponse.redirect(url, 308);
    }
    return NextResponse.next();
  }

  if (isMarketingHost) {
    // Parent org: only serve /crump360*; send product routes to product domain.
    if (pathname === "/" || pathname === "") {
      const url = new URL("https://crumpusa.org/crump360");
      return NextResponse.redirect(url, 308);
    }
    if (
      pathname === PRODUCT_START ||
      pathname === "/signup" ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/progress") ||
      pathname.startsWith("/teach") ||
      pathname.startsWith("/admin")
    ) {
      const url = new URL(
        `https://crump360.com${pathname}${req.nextUrl.search}`
      );
      return NextResponse.redirect(url, 308);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
