# Deploy Steward

## Vercel

1. Import the GitHub repo
2. Set env vars from `.env.example`
3. Deploy

## Supabase Auth checklist

1. Enable **Google** provider (OAuth client ID/secret from Google Cloud)
2. Authorized redirect: `https://YOUR_DOMAIN/auth/callback`
3. Enable MFA: **TOTP** + **WebAuthn**
4. Confirm Site URL matches your Vercel domain
5. Only `MikelCrump611@gmail.com` can enter (app allowlist)

## After deploy

1. Visit `/login`
2. Sign in with Google using your allowlisted email
3. Open `/security` → enroll passkey + authenticator
4. Connect integrations from `/connections` one at a time
