# CRUMP360 Arrival — Deploy

## Vercel

Project: `northstar-arrival` (team: mikelcrump)  
Live: https://northstar-arrival.vercel.app

```bash
npx vercel --prod --yes
```

No secrets required for the UI-first demo.

## Verify

1. Open the deployment URL — CRUMP360 wordmark should appear
2. Open **CRUMP360 Summit 2027**
3. Scan → Simulate QR scan
4. Launch kiosk (PIN `1234` to exit)
5. `/api/health` returns `"app":"crump360-arrival"`
