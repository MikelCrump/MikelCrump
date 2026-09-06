# Crump360 deploy

1. Push branch to GitHub
2. Deploy: `npx vercel --prod --token $VERCEL_TOKEN`
3. Domain: attach `crump360.com` and `www.crump360.com` to the `crump360` project in Vercel
4. No required env vars for the demo (learner state is local)

Health check: open https://crump360.com and `/dashboard`.
