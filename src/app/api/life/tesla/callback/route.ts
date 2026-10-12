import { NextResponse } from "next/server";
import { exchangeTeslaAuthCode } from "@/life/adapters/tesla";
import {
  TESLA_TOKEN_COOKIE,
  serializeTeslaTokenCookie,
  teslaCookieOptions,
} from "@/life/tesla-tokens";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  if (error) {
    return NextResponse.redirect(
      new URL(`/life/tesla?auth=error&detail=${encodeURIComponent(error)}`, url.origin),
    );
  }
  if (!code) {
    return NextResponse.redirect(
      new URL("/life/tesla?auth=error&detail=missing_code", url.origin),
    );
  }
  try {
    const result = await exchangeTeslaAuthCode(code, url.origin);
    const firstVin = result.vehicles[0]?.vin;
    const qs = new URLSearchParams({
      auth: "ok",
      vehicles: String(result.vehicles.length),
    });
    if (firstVin) qs.set("vin", firstVin);
    const response = NextResponse.redirect(new URL(`/life/tesla?${qs}`, url.origin));
    if (result.tokens) {
      response.cookies.set(
        TESLA_TOKEN_COOKIE,
        serializeTeslaTokenCookie(result.tokens),
        teslaCookieOptions(),
      );
    }
    return response;
  } catch (err) {
    const detail = err instanceof Error ? err.message : "exchange_failed";
    return NextResponse.redirect(
      new URL(`/life/tesla?auth=error&detail=${encodeURIComponent(detail)}`, url.origin),
    );
  }
}
