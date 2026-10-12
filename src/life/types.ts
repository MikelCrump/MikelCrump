export type ConnectionMode = "live" | "mock" | "unconfigured";

export type IntegrationId =
  | "tesla"
  | "govee"
  | "plaid"
  | "renpho"
  | "rideo"
  | "rustdesk"
  | "ai_credits"
  | "apple_tv"
  | "roku"
  | "weather"
  | "batteries"
  | "commute"
  | "automations"
  | "calendar";

export type IntegrationCategory =
  | "home"
  | "vehicle"
  | "health"
  | "money"
  | "ai"
  | "media"
  | "servers"
  | "ops";

export interface IntegrationMeta {
  id: IntegrationId;
  name: string;
  category: IntegrationCategory;
  description: string;
  envKeys: string[];
  docsHint: string;
}

export interface WeatherSnapshot {
  location: string;
  tempF: number;
  feelsLikeF: number;
  condition: string;
  humidity: number;
  windMph: number;
  highF: number;
  lowF: number;
  mode: ConnectionMode;
}

export interface TeslaSnapshot {
  name: string;
  model: string;
  batteryPercent: number;
  rangeMiles: number;
  charging: boolean;
  chargeRateMph: number | null;
  climateOn: boolean;
  insideTempF: number;
  locked: boolean;
  locationLabel: string;
  state: "online" | "asleep" | "offline" | "unknown";
  mode: ConnectionMode;
}

export interface GoveeDevice {
  id: string;
  name: string;
  model: string;
  room: string;
  power: boolean;
  brightness: number;
  colorHex: string;
}

export interface GoveeSnapshot {
  devices: GoveeDevice[];
  mode: ConnectionMode;
}

export interface FinanceAccount {
  id: string;
  name: string;
  type: "checking" | "savings" | "credit" | "investment";
  balance: number;
  institution: string;
}

export interface FinanceTxn {
  id: string;
  merchant: string;
  amount: number;
  when: string;
  category: string;
}

export interface FinanceSnapshot {
  accounts: FinanceAccount[];
  recent: FinanceTxn[];
  netWorth: number;
  spendThisMonth: number;
  mode: ConnectionMode;
}

export interface RenphoPoint {
  date: string;
  weightLbs: number;
  bodyFatPct: number | null;
  muscleLbs: number | null;
}

export interface RenphoSnapshot {
  latest: RenphoPoint;
  history: RenphoPoint[];
  trendLbs7d: number;
  mode: ConnectionMode;
}

export interface RideoSnapshot {
  name: string;
  power: boolean;
  mode: "cool" | "heat" | "fan" | "dry" | "auto";
  targetF: number;
  currentF: number;
  fan: "auto" | "low" | "med" | "high";
  connection: ConnectionMode;
}

export interface RustDeskHost {
  id: string;
  name: string;
  online: boolean;
  cpuPct: number;
  memPct: number;
  diskPct: number;
  lastSeen: string;
}

export interface RustDeskSnapshot {
  hosts: RustDeskHost[];
  mode: ConnectionMode;
}

export type AiProvider =
  | "claude"
  | "grok"
  | "cursor"
  | "grokbot";

export interface AiCreditAccount {
  id: string;
  label: string;
  provider: AiProvider;
  plan: string;
  creditsRemaining: number | null;
  creditsTotal: number | null;
  percentUsed: number;
  resetsAt: string | null;
  expiresAt: string | null;
  note: string;
}

export interface AiCreditsSnapshot {
  accounts: AiCreditAccount[];
  mode: ConnectionMode;
}

export interface MediaDevice {
  id: string;
  name: string;
  kind: "apple_tv" | "roku";
  power: boolean;
  app: string;
  volume: number;
}

export interface MediaSnapshot {
  devices: MediaDevice[];
  mode: ConnectionMode;
}

export interface BatteryDevice {
  id: string;
  name: string;
  kind: string;
  percent: number;
  charging: boolean;
  low: boolean;
}

export interface BatteriesSnapshot {
  devices: BatteryDevice[];
  mode: ConnectionMode;
}

export interface CommuteSuggestion {
  leaveBy: string;
  arriveBy: string;
  durationMin: number;
  confidence: "high" | "medium" | "low";
  reason: string;
  trafficNote: string;
}

export interface CommuteSnapshot {
  destination: string;
  suggestions: CommuteSuggestion[];
  typicalLeave: string;
  mode: ConnectionMode;
}

export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: string;
  action: string;
  lastRun: string | null;
}

export interface CalendarEvent {
  time: string;
  title: string;
  where: string;
}

export interface LifeOverview {
  owner: { name: string; email: string };
  generatedAt: string;
  weather: WeatherSnapshot;
  tesla: TeslaSnapshot;
  govee: GoveeSnapshot;
  finance: FinanceSnapshot;
  renpho: RenphoSnapshot;
  rideo: RideoSnapshot;
  rustdesk: RustDeskSnapshot;
  aiCredits: AiCreditsSnapshot;
  media: MediaSnapshot;
  batteries: BatteriesSnapshot;
  commute: CommuteSnapshot;
  automations: AutomationRule[];
  calendar: CalendarEvent[];
}

export type ControlTarget =
  | "govee"
  | "tesla"
  | "rideo"
  | "apple_tv"
  | "roku"
  | "automation";

export interface ControlRequest {
  target: ControlTarget;
  action: string;
  deviceId?: string;
  value?: string | number | boolean;
}
