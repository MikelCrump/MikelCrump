# Northstar Arrival

Tablet-first onsite check-in for **Northstar** — inspired by Cvent OnArrival.

## Features (UI-first)

- **Event workspace** with OnArrival-style tabs: Event · Scan · Attendees · Stats
- **QR check-in** with badge preview (`qrcode.react`)
- **Kiosk mode** (standard / QuickScan / hands-free) with admin PIN exit (`1234`)
- **Walk-in registration** that checks guests in and generates a QR pass
- **Templates** for badges, kiosk welcome, email QR, and session gates
- **Live stats** for check-in rate, pace, and guest types

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on a tablet or desktop browser.

## Key routes

| Route | Description |
|-------|-------------|
| `/` | Arrive home — pick a live event |
| `/events` | Event management list |
| `/events/[eventId]` | Staff workspace (4 tabs) |
| `/kiosk/[eventId]` | Full-screen self check-in |
| `/register/[eventId]` | Walk-in registration |
| `/templates` | Badge & kiosk templates |

## Deploy

```bash
npx vercel --prod
```

Health check: `/api/health`
