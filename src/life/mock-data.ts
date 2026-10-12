import { OWNER } from "@/life/owner";
import type {
  AiCreditsSnapshot,
  AutomationRule,
  BatteriesSnapshot,
  CalendarEvent,
  CommuteSnapshot,
  FinanceSnapshot,
  GoveeSnapshot,
  MediaSnapshot,
  RenphoSnapshot,
  ResideoSnapshot,
  RustDeskSnapshot,
  TeslaSnapshot,
  WeatherSnapshot,
} from "@/life/types";

export function greetingForHour(hour = new Date().getHours()) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export const MOCK_WEATHER: WeatherSnapshot = {
  location: "Home area",
  tempF: 68,
  feelsLikeF: 66,
  condition: "Partly cloudy",
  humidity: 54,
  windMph: 8,
  highF: 74,
  lowF: 52,
  mode: "mock",
};

export const MOCK_TESLA: TeslaSnapshot = {
  name: "Mikel's Y",
  model: "Model Y",
  batteryPercent: 72,
  rangeMiles: 198,
  charging: false,
  chargeRateMph: null,
  climateOn: false,
  insideTempF: 71,
  locked: true,
  locationLabel: "Home",
  state: "asleep",
  mode: "mock",
  lastError: null,
};

export const MOCK_GOVEE: GoveeSnapshot = {
  mode: "mock",
  lastError: null,
  devices: [
    {
      id: "living-strip",
      name: "Living strip",
      model: "H6159",
      room: "Living",
      power: true,
      brightness: 62,
      colorHex: "#4FD1C5",
    },
    {
      id: "office-lamp",
      name: "Office lamp",
      model: "H6008",
      room: "Office",
      power: true,
      brightness: 80,
      colorHex: "#F6E05E",
    },
    {
      id: "bedroom-bulb",
      name: "Bedroom bulb",
      model: "H6003",
      room: "Bedroom",
      power: false,
      brightness: 40,
      colorHex: "#90CDF4",
    },
    {
      id: "porch-flood",
      name: "Porch flood",
      model: "H7060",
      room: "Exterior",
      power: false,
      brightness: 100,
      colorHex: "#FFFFFF",
    },
  ],
};

export const MOCK_FINANCE: FinanceSnapshot = {
  mode: "mock",
  netWorth: 48240,
  spendThisMonth: 2148.62,
  accounts: [
    {
      id: "chk",
      name: "Everyday checking",
      type: "checking",
      balance: 4280.42,
      institution: "Capital One",
    },
    {
      id: "sav",
      name: "Emergency savings",
      type: "savings",
      balance: 12500,
      institution: "Capital One",
    },
    {
      id: "cc",
      name: "Rewards card",
      type: "credit",
      balance: -840.18,
      institution: "Capital One",
    },
    {
      id: "inv",
      name: "Brokerage",
      type: "investment",
      balance: 32300,
      institution: "Fidelity",
    },
  ],
  recent: [
    {
      id: "t1",
      merchant: "Whole Foods",
      amount: -64.18,
      when: "Yesterday",
      category: "Groceries",
    },
    {
      id: "t2",
      merchant: "Shell",
      amount: -48.2,
      when: "2d ago",
      category: "Transport",
    },
    {
      id: "t3",
      merchant: "Cursor",
      amount: -20,
      when: "3d ago",
      category: "Software",
    },
  ],
};

function renphoHistory(): RenphoSnapshot["history"] {
  const base = 188.4;
  const out: RenphoSnapshot["history"] = [];
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const wobble = Math.sin(i / 2) * 0.7 + (14 - i) * -0.05;
    out.push({
      date: d.toISOString().slice(0, 10),
      weightLbs: Number((base + wobble).toFixed(1)),
      bodyFatPct: Number((21.4 - i * 0.02).toFixed(1)),
      muscleLbs: Number((142 + i * 0.05).toFixed(1)),
    });
  }
  return out;
}

const renphoPoints = renphoHistory();

export const MOCK_RENPHO: RenphoSnapshot = {
  mode: "mock",
  history: renphoPoints,
  latest: renphoPoints[renphoPoints.length - 1]!,
  trendLbs7d: Number(
    (
      renphoPoints[renphoPoints.length - 1]!.weightLbs -
      renphoPoints[renphoPoints.length - 8]!.weightLbs
    ).toFixed(1),
  ),
};

export const MOCK_RESIDEO: ResideoSnapshot = {
  name: "Living room AC",
  power: true,
  mode: "cool",
  targetF: 72,
  currentF: 74,
  fan: "auto",
  connection: "mock",
};

export const MOCK_RUSTDESK: RustDeskSnapshot = {
  mode: "mock",
  hosts: [
    {
      id: "nas-01",
      name: "Home NAS",
      online: true,
      cpuPct: 18,
      memPct: 61,
      diskPct: 72,
      lastSeen: "Just now",
    },
    {
      id: "lab-gpu",
      name: "Lab GPU box",
      online: true,
      cpuPct: 44,
      memPct: 78,
      diskPct: 55,
      lastSeen: "2m ago",
    },
    {
      id: "pi-bridge",
      name: "Pi HA bridge",
      online: false,
      cpuPct: 0,
      memPct: 0,
      diskPct: 40,
      lastSeen: "3h ago",
    },
  ],
};

export const MOCK_AI_CREDITS: AiCreditsSnapshot = {
  mode: "mock",
  accounts: [
    {
      id: "claude-1",
      label: "Claude · primary",
      provider: "claude",
      plan: "Pro",
      creditsRemaining: null,
      creditsTotal: null,
      percentUsed: 62,
      resetsAt: "Apr 18",
      expiresAt: null,
      note: "Weekly message allowance",
    },
    {
      id: "claude-2",
      label: "Claude · secondary",
      provider: "claude",
      plan: "Pro",
      creditsRemaining: null,
      creditsTotal: null,
      percentUsed: 28,
      resetsAt: "Apr 20",
      expiresAt: null,
      note: "Backup for long sessions",
    },
    {
      id: "grokbot-1",
      label: "GrokBot · personal",
      provider: "grokbot",
      plan: "SuperGrok",
      creditsRemaining: 420,
      creditsTotal: 1000,
      percentUsed: 58,
      resetsAt: "May 1",
      expiresAt: null,
      note: "Standalone GrokBot",
    },
    {
      id: "grokbot-2",
      label: "GrokBot · via Cursor",
      provider: "grokbot",
      plan: "Cursor + Grok",
      creditsRemaining: 180,
      creditsTotal: 500,
      percentUsed: 64,
      resetsAt: null,
      expiresAt: "Jun 12",
      note: "Shared with Cursor workspace",
    },
    {
      id: "cursor-1",
      label: "Cursor",
      provider: "cursor",
      plan: "Pro",
      creditsRemaining: 320,
      creditsTotal: 500,
      percentUsed: 36,
      resetsAt: "May 1",
      expiresAt: null,
      note: "Agent + Tab usage pool",
    },
    {
      id: "grok-x",
      label: "Grok (xAI)",
      provider: "grok",
      plan: "SuperGrok",
      creditsRemaining: 900,
      creditsTotal: 1200,
      percentUsed: 25,
      resetsAt: "May 1",
      expiresAt: null,
      note: "Likely overlaps GrokBot access",
    },
  ],
};

export const MOCK_MEDIA: MediaSnapshot = {
  mode: "mock",
  devices: [
    {
      id: "atv-living",
      name: "Living Apple TV",
      kind: "apple_tv",
      power: true,
      app: "YouTube",
      volume: 28,
    },
    {
      id: "roku-bedroom",
      name: "Bedroom Roku",
      kind: "roku",
      power: false,
      app: "Home",
      volume: 18,
    },
  ],
};

export const MOCK_BATTERIES: BatteriesSnapshot = {
  mode: "mock",
  devices: [
    {
      id: "iphone",
      name: "iPhone",
      kind: "phone",
      percent: 64,
      charging: false,
      low: false,
    },
    {
      id: "watch",
      name: "Apple Watch",
      kind: "watch",
      percent: 38,
      charging: false,
      low: false,
    },
    {
      id: "atv-remote",
      name: "Apple TV remote",
      kind: "remote",
      percent: 22,
      charging: false,
      low: true,
    },
    {
      id: "tesla-key",
      name: "Tesla key fob",
      kind: "key",
      percent: 81,
      charging: false,
      low: false,
    },
    {
      id: "govee-sensor",
      name: "Hallway sensor",
      kind: "sensor",
      percent: 15,
      charging: false,
      low: true,
    },
  ],
};

export const MOCK_COMMUTE: CommuteSnapshot = {
  mode: "mock",
  destination: "Work",
  typicalLeave: "7:35 AM",
  suggestions: [
    {
      leaveBy: "7:20 AM",
      arriveBy: "7:52 AM",
      durationMin: 32,
      confidence: "high",
      reason: "Your Tue/Thu pattern + light inbound traffic",
      trafficNote: "I- corridor flowing; +4 min vs free-flow",
    },
    {
      leaveBy: "7:40 AM",
      arriveBy: "8:18 AM",
      durationMin: 38,
      confidence: "medium",
      reason: "School drop-off surge usually starts ~7:45",
      trafficNote: "Expect one slow segment near campus",
    },
    {
      leaveBy: "8:05 AM",
      arriveBy: "8:51 AM",
      durationMin: 46,
      confidence: "low",
      reason: "Late window — historically your longest drive",
      trafficNote: "Peak merge delay likely",
    },
  ],
};

export const MOCK_AUTOMATIONS: AutomationRule[] = [
  {
    id: "auto-arrive-charge-port",
    name: "Open charge port on arrive home",
    enabled: true,
    trigger: "iPhone arrives Home + Tesla parked ≥10s",
    action: "Open Tesla charge port",
    lastRun: null,
  },
  {
    id: "auto-arrive-home",
    name: "Arrive home lights",
    enabled: true,
    trigger: "Tesla arrives Home geofence",
    action: "Turn on Living strip + Office lamp @ 70%",
    lastRun: "Yesterday 6:14 PM",
  },
  {
    id: "auto-bedtime",
    name: "Bedtime wind-down",
    enabled: true,
    trigger: "Daily 10:30 PM",
    action: "Dim Govee bedroom, AC → 70°, pause media",
    lastRun: "Last night",
  },
  {
    id: "auto-low-batt",
    name: "Low battery nudge",
    enabled: false,
    trigger: "Any device battery < 20%",
    action: "Surface alert on Life Ops board",
    lastRun: null,
  },
  {
    id: "auto-precondition",
    name: "Precondition before leave",
    enabled: true,
    trigger: "15 min before suggested leave",
    action: "Tesla climate on + seat heat if < 50°F",
    lastRun: "This morning",
  },
];

export const MOCK_CALENDAR: CalendarEvent[] = [
  { time: "10:00", title: "Ops standup", where: "Meet" },
  { time: "12:30", title: "Focus block", where: "" },
  { time: "15:00", title: "Vendor follow-ups", where: "Office" },
  { time: "19:00", title: "Family evening", where: "Home" },
];

export { OWNER };
