function present(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function lifeEnv() {
  return {
    goveeApiKey: present(process.env.GOVEE_API_KEY),
    teslaAccessToken: present(process.env.TESLA_ACCESS_TOKEN),
    teslaRefreshToken: present(process.env.TESLA_REFRESH_TOKEN),
    teslaClientId: present(process.env.TESLA_CLIENT_ID),
    teslaVehicleId: present(process.env.TESLA_VEHICLE_ID),
    teslaCommandProxyUrl: present(process.env.TESLA_COMMAND_PROXY_URL),
    plaidClientId: present(process.env.PLAID_CLIENT_ID),
    plaidSecret: present(process.env.PLAID_SECRET),
    plaidEnv: present(process.env.PLAID_ENV) ?? "sandbox",
    plaidAccessToken: present(process.env.PLAID_ACCESS_TOKEN),
    renphoEmail: present(process.env.RENPHO_EMAIL),
    renphoPassword: present(process.env.RENPHO_PASSWORD),
    homeAssistantUrl: present(process.env.HOME_ASSISTANT_URL)?.replace(/\/$/, ""),
    homeAssistantToken: present(process.env.HOME_ASSISTANT_TOKEN),
    resideoEntityId: present(process.env.RESIDEO_ENTITY_ID),
    appleTvEntityId: present(process.env.APPLE_TV_ENTITY_ID),
    rokuHost: present(process.env.ROKU_HOST),
    rustdeskApiUrl: present(process.env.RUSTDESK_API_URL)?.replace(/\/$/, ""),
    rustdeskApiToken: present(process.env.RUSTDESK_API_TOKEN),
    openWeatherApiKey: present(process.env.OPENWEATHER_API_KEY),
    weatherLat: present(process.env.WEATHER_LAT),
    weatherLon: present(process.env.WEATHER_LON),
    weatherLocationLabel: present(process.env.WEATHER_LOCATION_LABEL) ?? "Home area",
    commuteOrigin: present(process.env.COMMUTE_ORIGIN),
    commuteDestination: present(process.env.COMMUTE_DESTINATION) ?? "Work",
    googleMapsApiKey: present(process.env.GOOGLE_MAPS_API_KEY),
    googleCalendarAccessToken: present(process.env.GOOGLE_CALENDAR_ACCESS_TOKEN),
    googleCalendarId: present(process.env.GOOGLE_CALENDAR_ID) ?? "primary",
    claudeAdminKey1: present(process.env.CLAUDE_ADMIN_API_KEY_1),
    claudeAdminKey2: present(process.env.CLAUDE_ADMIN_API_KEY_2),
    cursorAdminApiKey: present(process.env.CURSOR_ADMIN_API_KEY),
    xaiApiKey: present(process.env.XAI_API_KEY),
    lifeAiCreditsJson: present(process.env.LIFE_AI_CREDITS_JSON),
    haWebhookId: present(process.env.HA_AUTOMATION_WEBHOOK_ID),
    forceMock: process.env.LIFE_FORCE_MOCK === "1",
  };
}

export type LifeEnv = ReturnType<typeof lifeEnv>;

export function plaidHost(env: string) {
  if (env === "production") return "https://production.plaid.com";
  if (env === "development") return "https://development.plaid.com";
  return "https://sandbox.plaid.com";
}
