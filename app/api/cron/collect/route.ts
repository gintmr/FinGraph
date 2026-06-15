import { NextRequest, NextResponse } from "next/server";
import { runCollectors } from "@/lib/collectors";
import { logCronRun, upsertCollectedData } from "@/lib/db/repository";
import { writeLocalLiveCache } from "@/lib/db/local-cache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const nonBlockingSources = new Set(["stooq", "bea", "gdelt", "alpha_vantage", "twelve_data", "brave_search"]);
const vercelCronUserAgent = "vercel-cron/1.0";

function isAllowedCronRequest(request: NextRequest) {
  if (isVercelCronRequest(request)) {
    return true;
  }

  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return true;
  }

  const auth = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-cron-secret");
  const querySecret = request.nextUrl.searchParams.get("secret");

  return auth === `Bearer ${secret}` || headerSecret === secret || querySecret === secret;
}

function isVercelCronRequest(request: NextRequest) {
  return (request.headers.get("user-agent") ?? "").includes(vercelCronUserAgent);
}

function isNoonInNewYork(date = new Date()) {
  const hour = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    hourCycle: "h23"
  }).format(date);

  return hour === "12";
}

export async function GET(request: NextRequest) {
  if (!isAllowedCronRequest(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (isVercelCronRequest(request) && !isNoonInNewYork()) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "Outside the America/New_York 12:00 cron window",
      time: new Date().toISOString()
    });
  }

  const startedAt = Date.now();
  const results = await runCollectors();
  await writeLocalLiveCache(results);
  const collectedEventCount = results.flatMap((result) => result.events).length;
  const collectedIndicatorCount = results.flatMap((result) => result.indicators).length;
  const persisted = await upsertCollectedData(results);
  const collectorErrors = results.filter((result) => !result.ok).map((result) => ({ sourceId: result.sourceId, error: result.error }));
  const persistenceErrors = persisted.errors.map((error) => ({ sourceId: "supabase", error }));
  const errors = [...collectorErrors, ...persistenceErrors];
  const blockingErrors = errors.filter((error) => !nonBlockingSources.has(error.sourceId));

  await logCronRun({
    ok: blockingErrors.length === 0,
    mode: persisted.mode,
    source_count: results.length,
    collected_event_count: collectedEventCount,
    collected_indicator_count: collectedIndicatorCount,
    persisted_event_count: persisted.eventCount,
    persisted_indicator_count: persisted.indicatorCount,
    errors
  });

  return NextResponse.json({
    ok: blockingErrors.length === 0,
    mode: persisted.mode,
    durationMs: Date.now() - startedAt,
    collectedEventCount,
    collectedIndicatorCount,
    persistedEventCount: persisted.eventCount,
    persistedIndicatorCount: persisted.indicatorCount,
    blockingErrorCount: blockingErrors.length,
    nonBlockingErrorCount: errors.length - blockingErrors.length,
    persistenceErrors,
    results
  });
}
