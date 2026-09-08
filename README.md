# CRUMP360 Arrival

Tablet-first onsite check-in for **CRUMP360** — inspired by Cvent OnArrival, branded to match [crump360.com](https://crump360.com).

## Features (UI-first)

- **Event workspace** with tabs: Event · Scan · Attendees · Stats
- **QR check-in** with badge preview
- **Kiosk modes** (standard / QuickScan / hands-free) — admin PIN `1234`
- **Walk-in registration** with instant check-in
- **Templates** for badges, kiosk, email QR, and session gates
- **Live stats** for check-in rate, pace, and guest types

## Brand

- Wordmark: **CRUMP** + **360** (blue)
- Palette: navy `#191a21`, blue `#2e41de`, orange `#e68a2c`
- Type: Space Grotesk + DM Sans

## Quick start

```bash
npm install
npm run dev
```

## Key routes

| Route | Description |
|-------|-------------|
| `/` | Arrive home |
| `/events` | Event management |
| `/events/[eventId]` | Staff workspace |
| `/kiosk/[eventId]` | Full-screen self check-in |
| `/register/[eventId]` | Walk-in registration |
| `/templates` | Badge & kiosk templates |

## Deploy

Production: https://northstar-arrival.vercel.app (Vercel project `northstar-arrival` — rename optional)

```bash
npx vercel --prod
```
