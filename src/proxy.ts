import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Block private Studio tooling from the public Crumpusa.com surface. */
const PRIVATE_PREFIXES = ["/studio", "/projects", "/api", "/mcp"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PRIVATE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/studio",
    "/studio/:path*",
    "/projects",
    "/projects/:path*",
    "/api/:path*",
    "/mcp",
    "/mcp/:path*",
  ],
};
