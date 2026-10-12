export type LifeSectionId =
  | "board"
  | "day"
  | "tesla"
  | "home"
  | "money"
  | "health"
  | "ai"
  | "media"
  | "servers"
  | "automations"
  | "connections";

export interface LifeSection {
  id: LifeSectionId;
  href: string;
  label: string;
  title: string;
  description: string;
  /** Show in the secondary areas strip under the header */
  inStrip: boolean;
}

export const LIFE_SECTIONS: LifeSection[] = [
  {
    id: "board",
    href: "/life",
    label: "Board",
    title: "Board",
    description: "Widget home for the whole day.",
    inStrip: false,
  },
  {
    id: "day",
    href: "/life/day",
    label: "Day",
    title: "Day pulse",
    description: "Weather, commute leave windows, calendar, and device batteries.",
    inStrip: true,
  },
  {
    id: "tesla",
    href: "/life/tesla",
    label: "Tesla",
    title: "Tesla",
    description: "Battery, climate, charge, lock, and vehicle state.",
    inStrip: true,
  },
  {
    id: "home",
    href: "/life/home",
    label: "Home",
    title: "Home",
    description: "Govee lights / IoT and Resideo climate controls.",
    inStrip: true,
  },
  {
    id: "money",
    href: "/life/money",
    label: "Money",
    title: "Money",
    description: "Plaid balances, net worth pulse, and recent spend.",
    inStrip: true,
  },
  {
    id: "health",
    href: "/life/health",
    label: "Health",
    title: "Health",
    description: "Renpho scale history, body comp, and 7-day trend.",
    inStrip: true,
  },
  {
    id: "ai",
    href: "/life/ai",
    label: "AI",
    title: "AI credits",
    description: "Claude, GrokBot, Cursor, and Grok usage / resets / expiry.",
    inStrip: true,
  },
  {
    id: "media",
    href: "/life/media",
    label: "Media",
    title: "Media",
    description: "Apple TV and Roku power, app, and remote actions.",
    inStrip: true,
  },
  {
    id: "servers",
    href: "/life/servers",
    label: "Servers",
    title: "Servers",
    description: "RustDesk host online status and resource pulse.",
    inStrip: true,
  },
  {
    id: "automations",
    href: "/life/automations",
    label: "Automations",
    title: "Automations",
    description: "Create and toggle simple life rules.",
    inStrip: false,
  },
  {
    id: "connections",
    href: "/life/connections",
    label: "Connections",
    title: "Connections",
    description: "API keys and readiness for each integration.",
    inStrip: false,
  },
];

export function getSection(id: LifeSectionId) {
  const section = LIFE_SECTIONS.find((s) => s.id === id);
  if (!section) throw new Error(`Unknown life section: ${id}`);
  return section;
}
