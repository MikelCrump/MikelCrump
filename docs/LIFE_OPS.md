# Life Ops · Mikel Crump

Personal operations board at [`/life`](/life): widget home plus deeper area pages.

| Route | Purpose |
| --- | --- |
| `/life` | Widget home (quick controls + Open links) |
| `/life/day` | Weather, commute, calendar, batteries |
| `/life/tesla` | Full Tesla stats + commands |
| `/life/home` | Govee devices + Resideo climate |
| `/life/money` | Plaid accounts + recent spend |
| `/life/health` | Renpho history table + trend |
| `/life/ai` | All AI credit accounts |
| `/life/media` | Apple TV + Roku |
| `/life/servers` | RustDesk hosts |
| `/life/automations` | Create / toggle / run rules |
| `/life/connections` | Live readiness + env checklist |

## Backend readiness

Set `LIFE_FORCE_MOCK=0` (default in `.env.example`) so keys are used.

| Integration | What you add | Live? |
| --- | --- | --- |
| Govee | `GOVEE_API_KEY` | Yes — list, live state, power / brightness / color |
| Weather | OpenWeather key + lat/lon | Yes |
| Plaid | client/secret + access token | Yes — balances + 30d transactions |
| Tesla | OAuth (client id/secret) or tokens + VIN | Yes — read when online; commands wake-then-send (proxy for virtual key) |
| Renpho | Health app email + password | Yes — unofficial `cloud.renpho.com` API |
| Commute | Maps key + origin/destination | Yes — Distance Matrix |
| Calendar | Google OAuth access token | Yes — today’s events |
| Roku | `ROKU_HOST` on LAN/VPN | Yes — ECP |
| RustDesk | API base URL (+ token) | Yes — probes common peer endpoints |
| Resideo / Apple TV / batteries | Home Assistant URL + token + entity ids | Yes — via HA REST |
| AI credits | Claude Admin / Cursor Admin / xAI key and/or `LIFE_AI_CREDITS_JSON` | Partial — API/org live; Claude.ai/GrokBot chat quotas via JSON |
| Automations | nothing required | Yes — persisted in `.data/`; optional HA webhook on Run |

## Govee (read + command)

1. In the Govee Home app: Profile → About Us → Apply for API Key  
2. Set `GOVEE_API_KEY=...` and `LIFE_FORCE_MOCK=0`  
3. Open `/life/home` or hit `GET /api/life/govee`  
4. Board controls call `POST /api/life/control` with `target: "govee"` and `power` / `brightness` / `color`

## Tesla (read + command)

1. Create a Tesla developer app (authorization code + refresh). Redirect URI must match  
   `TESLA_REDIRECT_URI` or `{origin}/api/life/tesla/callback`  
2. Set `TESLA_CLIENT_ID`, `TESLA_CLIENT_SECRET`, `LIFE_FORCE_MOCK=0`  
3. Open `/life/tesla` → **Connect Tesla account** (tokens saved under `.data/tesla-tokens.json`)  
4. Set `TESLA_VIN=...` from the callback query (or first vehicle is auto-used)  
5. **Reads:** cheap vehicle state when asleep; full `vehicle_data` only when online  
6. **Commands:** wake → wait online → send. For 2024+ cars, run  
   [`tesla-http-proxy`](https://github.com/teslamotors/vehicle-command) and set  
   `TESLA_COMMAND_PROXY_URL=https://127.0.0.1:4443` (pair virtual key in the Tesla app)

Diagnostics: `GET /api/life/tesla`

## Plaid Link helper

```bash
# 1) Create a link token (needs PLAID_CLIENT_ID + PLAID_SECRET)
curl -X POST http://localhost:3000/api/life/plaid/link-token

# 2) After Plaid Link in a browser, exchange the public_token:
curl -X POST http://localhost:3000/api/life/plaid/exchange \
  -H 'content-type: application/json' \
  -d '{"public_token":"..."}'

# 3) Put returned access_token into PLAID_ACCESS_TOKEN and restart
```

## AI credits

- `CLAUDE_ADMIN_API_KEY_1/2` → Anthropic Admin cost report (API orgs)
- `CURSOR_ADMIN_API_KEY` → Cursor org pooled usage
- `XAI_API_KEY` → validates Grok API access
- `LIFE_AI_CREDITS_JSON` → merge/override account meters (needed for consumer Claude.ai / GrokBot chat quotas)

## API routes

| Route | Purpose |
| --- | --- |
| `GET /api/life/overview` | Aggregated board payload |
| `GET /api/life/status` | Per-integration readiness |
| `POST /api/life/control` | Device / automation commands (`action: "run"` supported) |
| `GET/POST /api/life/automations` | List / create rules |
| `POST /api/life/plaid/link-token` | Create Plaid Link token |
| `POST /api/life/plaid/exchange` | Exchange public_token → access_token |

## Quick start

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Open [http://localhost:3000/life](http://localhost:3000/life) and `/life/connections`.
