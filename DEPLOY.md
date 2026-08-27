# TableFlow Production Deploy Checklist

Use this checklist to go from local dev to live on reawakenusa.org.

## 1. Supabase setup

- [ ] Create project at [supabase.com/dashboard](https://supabase.com/dashboard)
- [ ] Run `supabase/migrations/001_initial_schema.sql` in SQL Editor
- [ ] Run `supabase/migrations/002_enable_realtime.sql` in SQL Editor (**required for instant sync**)
- [ ] Authentication → Providers → enable Email
- [ ] Authentication → URL Configuration:
  - Site URL: `https://your-app.vercel.app`
  - Redirect URLs: `https://your-app.vercel.app/auth/callback`
- [ ] Copy API keys (URL, anon, service_role)

## 2. Vercel deploy

- [ ] Merge `cursor/production-realtime-6b95` into `main`
- [ ] Import repo in [vercel.com](https://vercel.com) or run `npx vercel --prod`
- [ ] Add environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

- [ ] Deploy and verify `https://your-app.vercel.app/api/health` returns `"status":"ok"`

## 3. First login

- [ ] Visit `/signup` and create your account
- [ ] Confirm Pastor Partnerships demo data loaded
- [ ] Sidebar shows **Cloud** badge and green **Live sync** dot

## 4. Test instant sync

- [ ] Open spreadsheet grid in two browser tabs
- [ ] Edit a cell in tab A → appears in tab B within ~1 second
- [ ] Submit `/embed/form-pastors` in a third tab → new row appears in both grid tabs

## 5. Embed on website

Replace the form on [reawakenusa.org/pastors](https://reawakenusa.org/pastors):

```html
<iframe
  src="https://your-app.vercel.app/embed/form-pastors"
  width="100%"
  height="800"
  frameborder="0"
  style="border:none;border-radius:12px;">
</iframe>
```

## 6. Import existing data

- [ ] Export CSV from Airtable
- [ ] In TableFlow grid → **Import CSV**
- [ ] Map columns to field names

## 7. Team access

- [ ] `/settings/team` → invite ops/outreach with appropriate roles

## Optional: custom domain

- [ ] Vercel → Domains → add `forms.reawakenusa.org`
- [ ] Update Supabase auth URLs and `NEXT_PUBLIC_APP_URL`
- [ ] Update iframe `src` on pastors page

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Live sync dot red/idle | Run migration `002_enable_realtime.sql` |
| Form embed blocked | Check CSP allows `reawakenusa.org` in `next.config.ts` |
| Auth redirect loop | Match Supabase redirect URL exactly to `/auth/callback` |
| 429 on form submit | Rate limit (5/min per IP) — normal anti-spam protection |
