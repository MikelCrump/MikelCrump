/** Reawaken USA brand — shared across UI and message templates. */
export const brand = {
  name: "Reawaken",
  legalName: "Reawaken USA",
  tagline: "Communications",
  website: "https://reawakenusa.org",
  commandCenterUrl: "https://reawakencommandcenter.com",
  supportEmail: "mcrump@reawakenusa.org",
  senderName: "Reawaken USA",
  senderEmail: "mcrump@reawakenusa.org",
  smsFromLabel: "Reawaken Team",
  logoPath: "/reawaken-logo.png",
  logoWhitePath: "/reawaken-logo-white.png",
  /** Absolute URL for email clients (set via env in production). */
  logoUrl:
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://reachflow-zeta.vercel.app",
  colors: {
    black: "#0A0A0A",
    red: "#B91C1C",
    navy: "#1E293B",
    muted: "#64748B",
    border: "#E2E8F0",
    background: "#F8FAFC",
  },
} as const;

export function brandLogoUrl(darkBackground = false) {
  const base = brand.logoUrl;
  return `${base}${darkBackground ? brand.logoWhitePath : brand.logoPath}`;
}
