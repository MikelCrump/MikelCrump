# CRUMP360 deploy

## Domains

| Host | Role |
|------|------|
| **crump360.com** | Product only — `/` redirects to **`/start`** (plans + seats). App routes: `/dashboard`, `/admin`, … |
| **crumpusa.org/crump360** | Marketing site (landing, events, learn) |

Attach **both** domains to this Vercel project (or proxy `crumpusa.org/crump360` → this deploy).

Optional env:
- `NEXT_PUBLIC_PRODUCT_ORIGIN=https://crump360.com` — force absolute product CTAs from marketing
- `NEXT_PUBLIC_MARKETING_ORIGIN=https://crumpusa.org` — absolute “About” links on `/start`

## Deploy

1. Push branch to GitHub
2. `npx vercel --prod --token $VERCEL_TOKEN`
3. In Vercel: add `crump360.com` + `www.crump360.com`
4. Add `crumpusa.org` (and www) **or** configure the Crump USA project to rewrite `/crump360` → this deployment
5. No required env vars for the demo (learner state is local)

## Checks

- https://crump360.com → `/start`
- https://crump360.com/start — plans + seat picker
- https://crumpusa.org/crump360 — marketing landing
- https://crump360.com/dashboard — product app
