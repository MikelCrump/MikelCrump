export type ConnectionStatus = "connected" | "coming_soon" | "ready";

export type IntegrationCategory =
  | "money"
  | "health"
  | "mobility"
  | "calendar"
  | "media"
  | "faith"
  | "productivity";

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  status: ConnectionStatus;
  detail: string;
  accent: string;
}

export const INTEGRATIONS: Integration[] = [
  {
    id: "capital-one",
    name: "Capital One",
    description: "Balances, recent transactions, and spending pulse.",
    category: "money",
    status: "coming_soon",
    detail: "Bank-grade OAuth (Plaid / Capital One API) — wire-up next.",
    accent: "#d32f2f",
  },
  {
    id: "apple-health",
    name: "Apple Health",
    description: "Steps, heart rate, sleep, and daily movement rings.",
    category: "health",
    status: "coming_soon",
    detail: "HealthKit bridge via companion sync — wire-up next.",
    accent: "#ff2d55",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "What’s next today and this week.",
    category: "calendar",
    status: "ready",
    detail: "Uses your Google sign-in — connect after Google auth is live.",
    accent: "#1a73e8",
  },
  {
    id: "tesla",
    name: "Tesla",
    description: "Battery, range, charge state, and climate.",
    category: "mobility",
    status: "coming_soon",
    detail: "Tesla Fleet API — wire-up next.",
    accent: "#cc0000",
  },
  {
    id: "myfitnesspal",
    name: "MyFitnessPal",
    description: "Calories, macros, and nutrition streak.",
    category: "health",
    status: "coming_soon",
    detail: "MyFitnessPal / partner API — wire-up next.",
    accent: "#0079d0",
  },
  {
    id: "renpho",
    name: "Renpho Scale",
    description: "Weight, BMI, and body composition trends.",
    category: "health",
    status: "coming_soon",
    detail: "Renpho Health API — wire-up next.",
    accent: "#2bb673",
  },
  {
    id: "news",
    name: "News Stations",
    description: "Headlines from your favorite sources.",
    category: "media",
    status: "coming_soon",
    detail: "RSS / NewsAPI sources you pick — wire-up next.",
    accent: "#0f766e",
  },
  {
    id: "bible",
    name: "Verse of the Day",
    description: "Daily scripture to start grounded.",
    category: "faith",
    status: "connected",
    detail: "Live today with curated rotation — deeper feeds later.",
    accent: "#8b6914",
  },
  {
    id: "tasks",
    name: "Tasks",
    description: "Personal to-dos and follow-ups.",
    category: "productivity",
    status: "connected",
    detail: "Built in — expand with reminders later.",
    accent: "#1a6b5c",
  },
];

export const CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  money: "Money",
  health: "Health",
  mobility: "Mobility",
  calendar: "Calendar",
  media: "Media",
  faith: "Faith",
  productivity: "Productivity",
};
