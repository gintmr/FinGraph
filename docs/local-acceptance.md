# FinGraph Local Acceptance Checklist

This checklist is for short local validation before deploying or changing data sources. The goal is not to keep a local service running. The goal is to verify that collected rows are useful, linked, and trustworthy enough for the dashboard and exported Skill Pack.

## 1. Start A Temporary Local Server

```bash
npm run dev
```

Open a second terminal for the checks below.

## 2. Confirm Environment And Database Wiring

```bash
curl -s http://127.0.0.1:3000/api/health
```

Expected:

- `supabaseConfigured: true`
- `mode: "supabase"`
- `liveDataReady: false` is acceptable before the first successful ingestion
- `liveDataReady: true` means Supabase already contains at least one live event or indicator

## 3. Audit Collectors Without Writing Data

Use the audit endpoint before persisting rows:

```bash
curl -s -H "Authorization: Bearer $CRON_SECRET" \
  "http://127.0.0.1:3000/api/audit/collectors?limit=3"
```

If the secret is only in `.env.local`, load it for the terminal session first:

```bash
export CRON_SECRET="$(awk -F= '/^CRON_SECRET=/{print $2}' .env.local)"
```

Review these fields:

- `summary.successfulSourceCount`: how many collectors ran successfully.
- `summary.failedSourceCount`: failed sources should be explainable, for example an optional key is missing or a public source is temporarily blocked.
- `summary.linkCoverage`: should be `1` or very close to `1`; rows without source links should not be trusted.
- `summary.officialRows`: official/API/company-filing rows should be the backbone.
- `summary.discoveryRows`: discovery/news rows are useful, but should not be treated as final evidence by themselves.
- `sources[].sampleEvents`: manually open the source URLs and confirm title, date, and description are consistent with the original page.
- `sources[].sampleIndicators`: manually compare a few values against the linked official page.
- `sources[].issues`: critical issues should be fixed before deployment.

## 4. Persist One Test Collection

Only after the audit looks reasonable:

```bash
curl -s -H "Authorization: Bearer $CRON_SECRET" \
  http://127.0.0.1:3000/api/cron/collect
```

Expected:

- `mode: "supabase"`
- `persistedEventCount` or `persistedIndicatorCount` greater than `0`
- `blockingErrorCount: 0`
- Non-blocking errors from discovery/market-data sources can be acceptable if core official sources succeed

Then confirm:

```bash
curl -s http://127.0.0.1:3000/api/health
```

Expected:

- `liveDataReady: true`
- `ingestion.eventCount > 0` or `ingestion.indicatorCount > 0`

## 5. Manual Usefulness Review

For the first acceptance pass, inspect at least:

- 3 official macro indicators, such as BLS, FRED, Treasury, EIA, or World Bank.
- 3 official/event links, such as Federal Reserve, SEC, or Treasury.
- 3 discovery/news links from GDELT, if available.

Ask:

- Does the row have a real original URL?
- Is the date correct?
- Does the description accurately summarize the original source?
- Are the related layers reasonable?
- Is the source type appropriate?
- Would this row help an external model produce a better macro report?

If the answer is no, the collector should be adjusted before that source is trusted in production.

## 6. Stop The Local Server

After validation, stop the temporary local server with `Ctrl+C`.

Production should run on Vercel. Local validation is only a short acceptance step.
