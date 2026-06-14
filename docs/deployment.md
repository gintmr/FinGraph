# FinGraph Deployment Runbook

## Recommended Production Shape

```txt
Vercel
  - Next.js dashboard
  - API routes
  - Skill Pack export endpoint
  - Vercel Cron calling /api/cron/collect

Supabase
  - Postgres evidence warehouse
  - Service role used only by server routes
  - Optional Storage for archived export zip files later

Cloudflare
  - DNS for your domain
  - CNAME from fingraph.yourdomain.com to Vercel
  - CDN/security controls
```

## Supabase

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/migrations/001_init.sql`.
4. If this project already ran the original first migration before the real-data pipeline update, also run `supabase/migrations/002_real_data_pipeline.sql`.
5. Optionally run `supabase/seeds/seed.sql`.
6. Copy project URL, anon key, and service role key.

Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only. Never expose it in the browser.

## Vercel

1. Push this repository to GitHub.
2. Import the project in Vercel.
3. Add environment variables:

```txt
NEXT_PUBLIC_APP_URL=https://fingraph.yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
CRON_SECRET=...
SEC_USER_AGENT=FinGraph/0.1 your-email@example.com
BLS_API_KEY=...
FRED_API_KEY=...
EIA_API_KEY=...
ALPHA_VANTAGE_API_KEY=...
TWELVE_DATA_API_KEY=...
BRAVE_SEARCH_API_KEY=...
```

4. Deploy.
5. Confirm `/api/health` returns `supabaseConfigured: true`.
6. Trigger `/api/cron/collect` once and confirm `collectedEventCount` and `persistedEventCount` are both greater than zero.
   - If `CRON_SECRET` is configured, call `/api/cron/collect?secret=YOUR_SECRET` or send `Authorization: Bearer YOUR_SECRET`.
   - The first successful collect also upserts the source registry and base graph into Supabase.
7. Confirm `/api/health` returns `liveDataReady: true`.
8. Confirm `/api/export/skill-pack` downloads a zip.
9. Vercel Cron is configured in `vercel.json`. It triggers at `16:00 UTC` and `17:00 UTC`; the route only runs the real collection when the request lands at `12:00` in `America/New_York`, so US daylight saving time is handled without changing the deployment.

Export variants:

```txt
GET /api/export/skill-pack?days=14&format=zip&prompt=zh
GET /api/export/skill-pack?days=14&format=txt&prompt=en
```

`format=txt` returns one copy/paste-ready file. `prompt=zh` or `prompt=en` changes only the final user prompt.

## Cloudflare Domain

For a subdomain:

1. In Vercel Project Settings -> Domains, add `fingraph.yourdomain.com`.
2. Vercel will show the required CNAME value.
3. In Cloudflare DNS, add:

```txt
Type: CNAME
Name: fingraph
Target: the Vercel CNAME target
Proxy: DNS only first, then enable proxy after verification if desired
```

For an apex domain, follow Vercel's A record instructions instead.

## Collector Strategy

Collectors are intentionally independent:

- Keyless official/public/free sources can run immediately: Stooq Market Data, BLS, Federal Reserve RSS, Treasury Fiscal Data, SEC EDGAR, GDELT, and World Bank.
- BLS also supports optional `BLS_API_KEY`; adding it makes the official macro collector much more stable than anonymous quota.
- Keyed sources silently skip when the key is absent: FRED, EIA, and Brave Search.
- Stooq, GDELT, and Brave Search are non-blocking auxiliary/discovery sources. They can fail or rate-limit without failing the whole cron run when core official sources succeeded.
- Registered candidates that are not parsed yet: BEA, CFTC COT, Alpha Vantage, and Twelve Data.
- Search-discovered items are kept at lower confidence.
- Every event must include a source URL.
- In Seed mode, `/api/cron/collect` may collect live rows but cannot persist them. The dashboard reads live rows only after Supabase is configured.

## Backups

Supabase Free does not provide downloadable backups. For long-term personal use:

1. Upgrade to Supabase Pro, or
2. Add a scheduled `pg_dump` backup from GitHub Actions/VPS, or
3. Periodically export `events`, `indicators`, `sources`, and `skill_exports` as CSV.
