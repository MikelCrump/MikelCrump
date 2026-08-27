import { ALLOWED_EMAIL, OWNER_DISPLAY_NAME } from "@/lib/auth-allowlist";

export const VERSES = [
  {
    reference: "Proverbs 3:5–6",
    text: "Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.",
  },
  {
    reference: "Philippians 4:13",
    text: "I can do all things through him who strengthens me.",
  },
  {
    reference: "Joshua 1:9",
    text: "Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go.",
  },
  {
    reference: "Psalm 46:10",
    text: "Be still, and know that I am God.",
  },
  {
    reference: "Isaiah 40:31",
    text: "But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles.",
  },
  {
    reference: "Matthew 6:33",
    text: "But seek first the kingdom of God and his righteousness, and all these things will be added to you.",
  },
  {
    reference: "Lamentations 3:22–23",
    text: "The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning.",
  },
];

export function verseOfTheDay(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const day = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return VERSES[day % VERSES.length];
}

export function greetingForHour(hour = new Date().getHours()) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export const MOCK_DASHBOARD = {
  owner: {
    name: OWNER_DISPLAY_NAME,
    email: ALLOWED_EMAIL,
  },
  bank: {
    institution: "Capital One",
    checking: 4280.42,
    savings: 12500.0,
    creditAvailable: 6400,
    lastTxn: { merchant: "Whole Foods", amount: -64.18, when: "Yesterday" },
  },
  health: {
    steps: 7842,
    stepGoal: 10000,
    activeMinutes: 38,
    restingHr: 62,
  },
  tesla: {
    model: "Model Y",
    batteryPercent: 72,
    rangeMiles: 198,
    charging: false,
    location: "Home",
  },
  calendar: [
    { time: "10:00", title: "Ops standup", where: "Meet" },
    { time: "12:30", title: "Lunch — blocked", where: "" },
    { time: "15:00", title: "Pastor follow-ups", where: "Office" },
    { time: "19:00", title: "Family evening", where: "Home" },
  ],
  fitnessPal: {
    calories: 1420,
    calorieGoal: 2100,
    protein: 98,
    carbs: 142,
    fat: 48,
  },
  renpho: {
    weightLbs: 188.4,
    deltaLbs: -0.6,
    bodyFat: 21.2,
    measuredAt: "This morning",
  },
  news: [
    {
      source: "Local",
      headline: "Community market opens early Saturday",
    },
    {
      source: "Markets",
      headline: "Yields steady ahead of afternoon data",
    },
    {
      source: "Faith",
      headline: "Weekend service times and volunteer needs",
    },
  ],
};

export const DEFAULT_TASKS = [
  { id: "t1", title: "Review Capital One statement", done: false, tag: "Money" },
  { id: "t2", title: "Charge Tesla before weekend trip", done: false, tag: "Car" },
  { id: "t3", title: "Log breakfast in MyFitnessPal", done: true, tag: "Health" },
  { id: "t4", title: "Confirm Sunday volunteer roster", done: false, tag: "Church" },
  { id: "t5", title: "Call about HVAC filter delivery", done: false, tag: "Home" },
];
