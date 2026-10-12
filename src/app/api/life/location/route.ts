import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ARRIVE_HOME_CHARGE_AUTOMATION_ID,
  getArriveHomeChargeStatus,
  runArriveHomeOpenChargePort,
} from "@/life/arrive-home-charge";
import {
  listAutomations,
  markAutomationRan,
} from "@/life/automations-store";
import { lifeEnv } from "@/life/config";

export const dynamic = "force-dynamic";
/** Allow wake + 10s parked confirmation inside one request. */
export const maxDuration = 60;

const bodySchema = z.object({
  event: z.string().optional(),
  lat: z.number().optional(),
  lon: z.number().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  accuracy: z.number().optional(),
  source: z.string().optional(),
  force: z.boolean().optional(),
});

function authorize(request: Request) {
  const secret = lifeEnv().locationWebhookSecret;
  if (!secret) return true;
  const header = request.headers.get("authorization") ?? "";
  const bearer = header.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : "";
  const url = new URL(request.url);
  const query = url.searchParams.get("secret") ?? "";
  const headerSecret = request.headers.get("x-life-location-secret") ?? "";
  return bearer === secret || query === secret || headerSecret === secret;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    ...getArriveHomeChargeStatus(),
    automation: listAutomations().find(
      (a) => a.id === ARRIVE_HOME_CHARGE_AUTOMATION_ID,
    ),
    shortcutHint: {
      url: "https://mikelcrump.com/api/life/location",
      method: "POST",
      json: {
        event: "arrive_home",
        lat: "<Current Latitude>",
        lon: "<Current Longitude>",
        source: "iphone",
      },
    },
  });
}

export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json(
      { ok: false, detail: "Unauthorized — set LIFE_LOCATION_WEBHOOK_SECRET" },
      { status: 401 },
    );
  }

  const automation = listAutomations().find(
    (a) => a.id === ARRIVE_HOME_CHARGE_AUTOMATION_ID,
  );
  if (automation && !automation.enabled) {
    return NextResponse.json({
      ok: false,
      detail: "Automation disabled in Life Ops",
    });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, detail: parsed.error.issues[0]?.message ?? "Invalid body" },
      { status: 400 },
    );
  }

  const result = await runArriveHomeOpenChargePort({
    event: parsed.data.event,
    lat: parsed.data.lat ?? parsed.data.latitude,
    lon: parsed.data.lon ?? parsed.data.longitude,
    force: parsed.data.force,
  });

  if (result.ok) markAutomationRan(ARRIVE_HOME_CHARGE_AUTOMATION_ID);

  return NextResponse.json({
    ok: result.ok,
    detail: result.detail,
    source: parsed.data.source ?? "unknown",
    status: getArriveHomeChargeStatus(),
  });
}
