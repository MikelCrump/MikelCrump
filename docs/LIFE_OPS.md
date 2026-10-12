# Life Ops · Mikel Crump

Personal operations board at [`/life`](/life): home lights, Tesla, Plaid finance, Renpho trends, Resideo AC, Govee IoT, RustDesk servers, AI credit meters, Apple TV / Roku, device batteries, weather, commute suggestions, and simple automations.

## Design notes

- Runs beside Crump Studio in the same Next.js app.
- Every integration has a **live adapter** plus **preview/mock** fallback so the board is usable before keys land.
- Patterns drawn from [PersonalOS](https://github.com/socialloopai/PersonalOS) (Plaid), [TeslaMate](https://github.com/teslamate-org/teslamate) / Fleet API, [Homarr](https://github.com/homarr-labs/homarr) / [Homepage](https://github.com/gethomepage/homepage)-style service hubs, and Home Assistant bridges for AC/media/batteries.

## Quick start

```bash
cp .env.example .env
# optional: force mocks even when keys exist
echo 'LIFE_FORCE_MOCK=1' >> .env
pnpm install
pnpm dev
```

Open [http://localhost:3000/life](http://localhost:3000/life).

## API routes

| Route | Purpose |
| --- | --- |
| `GET /api/life/overview` | Aggregated board payload |
| `POST /api/life/control` | Device / automation commands |
| `GET/POST /api/life/automations` | List / create rules |

## Environment keys

See `.env.example` under **Life Ops**. Highlights:

| Area | Keys |
| --- | --- |
| Tesla | `TESLA_ACCESS_TOKEN`, `TESLA_VEHICLE_ID`, optional `TESLA_COMMAND_PROXY_URL` |
| Govee | `GOVEE_API_KEY` |
| Plaid | `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV`, `PLAID_ACCESS_TOKEN` |
| Renpho | `RENPHO_EMAIL`, `RENPHO_PASSWORD` (marks ready; public API still unstable) |
| Home bridge | `HOME_ASSISTANT_URL`, `HOME_ASSISTANT_TOKEN`, `RESIDEO_ENTITY_ID`, `APPLE_TV_ENTITY_ID` |
| Roku | `ROKU_HOST` (ECP on LAN) |
| RustDesk | `RUSTDESK_API_URL`, `RUSTDESK_API_TOKEN` |
| Weather | `OPENWEATHER_API_KEY`, `WEATHER_LAT`, `WEATHER_LON` |
| Commute | `COMMUTE_ORIGIN`, `COMMUTE_DESTINATION`, `GOOGLE_MAPS_API_KEY` |
| AI credits | `LIFE_AI_CREDITS_JSON` (JSON snapshot of account meters) |

## AI credit accounts tracked

1. Claude · primary  
2. Claude · secondary  
3. GrokBot · personal  
4. GrokBot · via Cursor  
5. Cursor  
6. Grok (xAI) — often overlaps GrokBot access  

Paste a `LIFE_AI_CREDITS_JSON` blob matching `AiCreditsSnapshot` when you have live usage numbers.

## Honest limits

- **Renpho**: no stable public API — preview history + credential placeholder.
- **Resideo**: best via Home Assistant climate entity for Honeywell Home / Resideo thermostats.
- **RustDesk**: depends on your self-hosted API shape; adapter expects `/api/peers`.
- **AI vendors**: usage endpoints change often — JSON snapshot is the reliable path today.
- **Automations**: in-memory for this process; persist to DB/HA next.
