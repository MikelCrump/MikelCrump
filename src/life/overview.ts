import { getAiCredits } from "@/life/adapters/ai-credits";
import { getBatteries } from "@/life/adapters/batteries";
import { getCalendar } from "@/life/adapters/calendar";
import { getCommute } from "@/life/adapters/commute";
import { getGovee } from "@/life/adapters/govee";
import { getMedia } from "@/life/adapters/media";
import { getFinance } from "@/life/adapters/plaid";
import { getRenpho } from "@/life/adapters/renpho";
import { getResideo } from "@/life/adapters/resideo";
import { getRustDesk } from "@/life/adapters/rustdesk";
import { getTesla } from "@/life/adapters/tesla";
import { getWeather } from "@/life/adapters/weather";
import { listAutomations } from "@/life/automations-store";
import { OWNER } from "@/life/mock-data";
import type { LifeOverview } from "@/life/types";

export async function getLifeOverview(): Promise<LifeOverview> {
  const [
    weather,
    tesla,
    govee,
    finance,
    renpho,
    resideo,
    rustdesk,
    aiCredits,
    media,
    batteries,
    commute,
    calendar,
  ] = await Promise.all([
    getWeather(),
    getTesla(),
    getGovee(),
    getFinance(),
    getRenpho(),
    getResideo(),
    getRustDesk(),
    getAiCredits(),
    getMedia(),
    getBatteries(),
    getCommute(),
    getCalendar(),
  ]);

  return {
    owner: { name: OWNER.name, email: OWNER.email },
    generatedAt: new Date().toISOString(),
    weather,
    tesla,
    govee,
    finance,
    renpho,
    resideo,
    rustdesk,
    aiCredits,
    media,
    batteries,
    commute,
    automations: listAutomations(),
    calendar: calendar.events,
  };
}
