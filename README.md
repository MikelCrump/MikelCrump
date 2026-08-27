# Steward

Private life dashboard for **Mikel** — money, health, calendar, Tesla, tasks, news, and daily scripture.

UI-first. Integrations connect one at a time. Locked to `MikelCrump611@gmail.com`.

## Security

- **Google sign-in** (recommended primary)
- **Passkeys** (Touch ID / Face ID / security key)
- **Authenticator 2FA** (TOTP)
- **Email allowlist** — only your Gmail may enter
- `robots: noindex` — not for search engines

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login).

Without Supabase env vars, use **Enter UI preview** to polish the dashboard.

## Enable real auth (Supabase)

1. Create a Supabase project
2. Auth → Providers → enable **Google**
3. Auth → MFA → enable **TOTP** and **WebAuthn / passkeys**
4. Add redirect URL: `https://your-domain/auth/callback`
5. Copy `.env.example` → `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Routes

| Route | Purpose |
|-------|---------|
| `/login` | Google / passkey / 2FA gate |
| `/` | Today dashboard |
| `/tasks` | Task board |
| `/connections` | Integration hub (Capital One, Health, Tesla, …) |
| `/security` | Passkeys & authenticator enrollment |

## Coming next (one at a time)

Capital One · Apple Health · Google Calendar · Tesla · MyFitnessPal · Renpho · News stations

## Stack

Next.js 16 · React 19 · Tailwind CSS v4 · Supabase Auth · Zustand
