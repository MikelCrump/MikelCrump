import { lifeEnv } from "@/life/config";

export type ReadyLevel = "live_ready" | "needs_bridge" | "manual_json" | "built_in";

export interface IntegrationStatus {
  id: string;
  name: string;
  ready: ReadyLevel;
  configured: boolean;
  needs: string[];
  note: string;
}

export function getIntegrationStatus(): IntegrationStatus[] {
  const cfg = lifeEnv();
  return [
    {
      id: "govee",
      name: "Govee",
      ready: "live_ready",
      configured: Boolean(cfg.goveeApiKey),
      needs: ["GOVEE_API_KEY"],
      note: "Cloud Device Control API — list + power/brightness.",
    },
    {
      id: "weather",
      name: "Weather",
      ready: "live_ready",
      configured: Boolean(cfg.openWeatherApiKey && cfg.weatherLat && cfg.weatherLon),
      needs: ["OPENWEATHER_API_KEY", "WEATHER_LAT", "WEATHER_LON"],
      note: "OpenWeather current conditions.",
    },
    {
      id: "plaid",
      name: "Plaid",
      ready: "live_ready",
      configured: Boolean(cfg.plaidClientId && cfg.plaidSecret && cfg.plaidAccessToken),
      needs: ["PLAID_CLIENT_ID", "PLAID_SECRET", "PLAID_ACCESS_TOKEN"],
      note: "Balances + transactions. Use /api/life/plaid/link-token to Link, then exchange.",
    },
    {
      id: "tesla",
      name: "Tesla",
      ready: "live_ready",
      configured: Boolean(
        cfg.teslaAccessToken ||
          cfg.teslaRefreshToken ||
          (cfg.teslaClientId && cfg.teslaClientSecret),
      ),
      needs: [
        "TESLA_CLIENT_ID + TESLA_CLIENT_SECRET (OAuth via /life/tesla)",
        "or TESLA_ACCESS_TOKEN / TESLA_REFRESH_TOKEN",
        "TESLA_VIN (or auto-pick first vehicle)",
        "TESLA_COMMAND_PROXY_URL for signed commands on newer cars",
      ],
      note: "Read: Fleet API. Commands: wake-then-send; proxy recommended for virtual-key vehicles.",
    },
    {
      id: "renpho",
      name: "Renpho",
      ready: "live_ready",
      configured: Boolean(cfg.renphoEmail && cfg.renphoPassword),
      needs: ["RENPHO_EMAIL", "RENPHO_PASSWORD"],
      note: "Unofficial Renpho Health cloud API (email/password).",
    },
    {
      id: "commute",
      name: "Commute",
      ready: "live_ready",
      configured: Boolean(cfg.googleMapsApiKey && cfg.commuteOrigin),
      needs: ["GOOGLE_MAPS_API_KEY", "COMMUTE_ORIGIN", "COMMUTE_DESTINATION"],
      note: "Google Distance Matrix traffic ETAs.",
    },
    {
      id: "calendar",
      name: "Calendar",
      ready: "live_ready",
      configured: Boolean(cfg.googleCalendarAccessToken),
      needs: ["GOOGLE_CALENDAR_ACCESS_TOKEN", "GOOGLE_CALENDAR_ID (optional)"],
      note: "Google Calendar events for today.",
    },
    {
      id: "resideo",
      name: "Resideo AC",
      ready: "needs_bridge",
      configured: Boolean(
        cfg.homeAssistantUrl && cfg.homeAssistantToken && cfg.resideoEntityId,
      ),
      needs: ["HOME_ASSISTANT_URL", "HOME_ASSISTANT_TOKEN", "RESIDEO_ENTITY_ID"],
      note: "Via Home Assistant climate entity.",
    },
    {
      id: "apple_tv",
      name: "Apple TV",
      ready: "needs_bridge",
      configured: Boolean(
        cfg.homeAssistantUrl && cfg.homeAssistantToken && cfg.appleTvEntityId,
      ),
      needs: ["HOME_ASSISTANT_URL", "HOME_ASSISTANT_TOKEN", "APPLE_TV_ENTITY_ID"],
      note: "Via Home Assistant media_player.",
    },
    {
      id: "batteries",
      name: "Batteries",
      ready: "needs_bridge",
      configured: Boolean(cfg.homeAssistantUrl && cfg.homeAssistantToken),
      needs: ["HOME_ASSISTANT_URL", "HOME_ASSISTANT_TOKEN"],
      note: "Pulls HA battery entities.",
    },
    {
      id: "roku",
      name: "Roku",
      ready: "live_ready",
      configured: Boolean(cfg.rokuHost),
      needs: ["ROKU_HOST"],
      note: "LAN ECP — host must reach the TV (VPN/homelab).",
    },
    {
      id: "rustdesk",
      name: "RustDesk",
      ready: "live_ready",
      configured: Boolean(cfg.rustdeskApiUrl),
      needs: ["RUSTDESK_API_URL", "RUSTDESK_API_TOKEN (optional)"],
      note: "Tries /api/peers, /api/ab, and common peer list shapes.",
    },
    {
      id: "ai_credits",
      name: "AI credits",
      ready: "manual_json",
      configured: Boolean(
        cfg.claudeAdminKey1 ||
          cfg.claudeAdminKey2 ||
          cfg.cursorAdminApiKey ||
          cfg.xaiApiKey ||
          cfg.lifeAiCreditsJson,
      ),
      needs: [
        "CLAUDE_ADMIN_API_KEY_1/2 (API org cost)",
        "CURSOR_ADMIN_API_KEY (org pooled usage)",
        "XAI_API_KEY (key check)",
        "LIFE_AI_CREDITS_JSON (Claude.ai / GrokBot consumer meters)",
      ],
      note: "Consumer Claude/GrokBot chat quotas still need JSON; API/Cursor admin keys go live.",
    },
    {
      id: "automations",
      name: "Automations",
      ready: "built_in",
      configured: true,
      needs: ["HA_AUTOMATION_WEBHOOK_ID (optional execute bridge)"],
      note: "iPhone arrive → charge port via /api/life/location; optional HA webhook on other rules.",
    },
  ];
}
