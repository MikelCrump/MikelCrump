# Northstar Arrival — Deploy

## Vercel

```bash
npx vercel --yes
npx vercel --prod --yes
```

No secrets required for the UI-first demo (client-side seed data + Zustand).

## Verify

1. Open the deployment URL
2. Choose **Northstar Summit 2026**
3. Use **Scan** → Simulate QR scan
4. Launch **Kiosk mode** (admin PIN `1234` to exit)
5. Confirm `/api/health` returns `"status":"ok"`
