# FinGraph

FinGraph is a personal macro-financial intelligence dashboard. It collects source-linked macro, market, filing, RSS, and search evidence, maps events to a nine-layer financial graph, and exports a portable Skill Pack for deep analysis in any large language model.

## Stack

- Next.js + TypeScript
- Tailwind CSS
- Supabase Postgres
- Vercel Cron
- Cloudflare DNS/custom domain

## Local Setup

1. Copy `.env.example` to `.env.local`.
2. Fill Supabase variables when ready. Without Supabase, the dashboard falls back to built-in seed data.
3. Install dependencies with `npm install`.
4. Run `npm run dev`.

## Data Mode

- `seed`: UI shows demo data. `/api/cron/collect` can still call live APIs, but collected rows are not persisted or shown in the dashboard.
- `supabase`: UI reads persisted events, indicators, and graph records from Supabase.
- The dashboard only switches to `supabase` display mode after at least one real event or indicator has been persisted. This avoids mixing seed events with live rows.

Current collectors:

- Implemented without key: Stooq Market Data, BLS Public Data API, Federal Reserve RSS, U.S. Treasury Fiscal Data, SEC EDGAR, GDELT, World Bank.
- Implemented but skipped without key: FRED, EIA, Brave Search.
- Registered but not parsed yet: BEA, CFTC COT, Alpha Vantage, Twelve Data.
- Non-blocking discovery/auxiliary sources: Stooq, GDELT, Brave Search. Their errors are returned and logged, but they do not fail the whole collection when core official sources succeeded.

`/api/health` returns the configured mode, live data readiness, row counts, source status counts, and the latest cron run. `/api/cron/collect` returns both collected counts and persisted counts so Seed mode is not confused with a failed collection.

To switch from Seed to real data:

1. Run `supabase/migrations/001_init.sql` in a fresh Supabase project. If the project already used the first migration, also run `supabase/migrations/002_real_data_pipeline.sql`.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` or Vercel.
3. Optional but useful: add `BLS_API_KEY`, `FRED_API_KEY`, `EIA_API_KEY`, `BRAVE_SEARCH_API_KEY`, and a real `SEC_USER_AGENT`.
4. Trigger `/api/cron/collect` once. With `CRON_SECRET`, call `/api/cron/collect?secret=...`.
5. Open `/api/health` and confirm `liveDataReady: true`.

## Deploy

1. Create a Supabase project and run `supabase/migrations/001_init.sql`.
2. Seed optional demo data from `supabase/seeds/seed.sql`.
3. Deploy to Vercel.
4. Set all environment variables in Vercel.
5. Add `fingraph.yourdomain.com` in Vercel project domains.
6. In Cloudflare DNS, create the CNAME record Vercel provides.

## Export API

```txt
/api/export/skill-pack?days=14&format=zip&prompt=zh
/api/export/skill-pack?days=14&format=txt&prompt=en
```

- `format=zip | txt`
- `prompt=zh | en`
- The language option only changes the final user prompt, which controls the report language requested from the downstream AI model.
