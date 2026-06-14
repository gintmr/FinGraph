import { NextRequest, NextResponse } from "next/server";
import { runCollectors } from "@/lib/collectors";
import { sourceRegistry } from "@/lib/config/sources";
import type { CollectorResult, FinGraphEvent, MarketIndicator, SourceDefinition } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type AuditIssue = {
  severity: "info" | "warning" | "critical";
  message: string;
};

const nonBlockingAuditSources = new Set(["stooq", "gdelt", "brave_search"]);

function isAllowedAuditRequest(request: NextRequest) {
  if (process.env.NODE_ENV !== "production" && request.nextUrl.searchParams.get("local") === "1") {
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

function isValidHttpUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function average(values: number[]) {
  if (!values.length) {
    return null;
  }

  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(3));
}

function latestTimestamp(events: FinGraphEvent[], indicators: MarketIndicator[]) {
  const timestamps = [
    ...events.map((event) => Date.parse(event.time)),
    ...indicators.map((indicator) => Date.parse(indicator.updated_at))
  ].filter((value) => Number.isFinite(value));

  if (!timestamps.length) {
    return null;
  }

  return new Date(Math.max(...timestamps)).toISOString();
}

function buildSourceIssues(
  source: SourceDefinition | undefined,
  result: CollectorResult,
  validUrlCount: number,
  rowCount: number,
  averageConfidence: number | null
) {
  const issues: AuditIssue[] = [];

  if (!result.ok) {
    issues.push({
      severity: nonBlockingAuditSources.has(result.sourceId) ? "warning" : "critical",
      message: result.error ?? "Collector failed."
    });
  }

  if (result.ok && rowCount === 0) {
    issues.push({
      severity: source?.api_key_required ? "warning" : "info",
      message: source?.api_key_required
        ? `No rows returned. Check ${source.api_key_env ?? "the API key"} if this source should be active.`
        : "No rows returned. This can be normal for event-driven or low-frequency sources."
    });
  }

  if (rowCount > 0 && validUrlCount < rowCount) {
    issues.push({ severity: "critical", message: "Some rows do not have a valid http(s) source URL." });
  }

  if (averageConfidence !== null && averageConfidence < 0.5) {
    issues.push({ severity: "warning", message: "Average confidence is below 0.5; treat this source as discovery only." });
  }

  if (source?.type === "search_result" || source?.id === "gdelt") {
    issues.push({
      severity: "info",
      message: "Discovery source. Use links for monitoring, then cross-check important claims with official sources."
    });
  }

  return issues;
}

function summarizeSource(result: CollectorResult, sampleLimit: number) {
  const source = sourceRegistry.find((item) => item.id === result.sourceId);
  const rowCount = result.events.length + result.indicators.length;
  const validEventUrls = result.events.filter((event) => isValidHttpUrl(event.url)).length;
  const validIndicatorUrls = result.indicators.filter((indicator) => isValidHttpUrl(indicator.url)).length;
  const validUrlCount = validEventUrls + validIndicatorUrls;
  const averageConfidence = average(result.events.map((event) => event.confidence));

  return {
    sourceId: result.sourceId,
    name: source?.name ?? result.sourceId,
    reliability: source?.reliability ?? "unknown",
    sourceType: source?.type ?? "unknown",
    cadence: source?.cadence ?? "unknown",
    ok: result.ok,
    eventCount: result.events.length,
    indicatorCount: result.indicators.length,
    rowCount,
    validUrlCount,
    linkCoverage: rowCount ? Number((validUrlCount / rowCount).toFixed(3)) : null,
    averageEventConfidence: averageConfidence,
    latestTimestamp: latestTimestamp(result.events, result.indicators),
    issues: buildSourceIssues(source, result, validUrlCount, rowCount, averageConfidence),
    sampleEvents: result.events.slice(0, sampleLimit).map((event) => ({
      title: event.title,
      time: event.time,
      url: event.url,
      relatedLayers: event.related_layers,
      direction: event.direction,
      strength: event.strength,
      horizon: event.horizon,
      assets: event.assets,
      confidence: event.confidence,
      description: event.description
    })),
    sampleIndicators: result.indicators.slice(0, sampleLimit).map((indicator) => ({
      name: indicator.name,
      value: indicator.value,
      unit: indicator.unit,
      change: indicator.change,
      direction: indicator.direction,
      layer: indicator.layer,
      updatedAt: indicator.updated_at,
      url: indicator.url,
      note: indicator.note,
      sparkline: indicator.sparkline
    }))
  };
}

export async function GET(request: NextRequest) {
  if (!isAllowedAuditRequest(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const sampleLimit = Math.min(Math.max(Number(request.nextUrl.searchParams.get("limit") ?? 3), 1), 10);
  const results = await runCollectors();
  const sources = results.map((result) => summarizeSource(result, sampleLimit));
  const totalRows = sources.reduce((sum, source) => sum + source.rowCount, 0);
  const totalValidUrls = sources.reduce((sum, source) => sum + source.validUrlCount, 0);
  const officialRows = sources
    .filter((source) => source.sourceType === "official_api" || source.sourceType === "official_rss" || source.sourceType === "company_filing")
    .reduce((sum, source) => sum + source.rowCount, 0);
  const discoveryRows = sources
    .filter((source) => source.sourceType === "search_result" || source.sourceId === "gdelt")
    .reduce((sum, source) => sum + source.rowCount, 0);
  const criticalIssues = sources.flatMap((source) =>
    source.issues
      .filter((issue) => issue.severity === "critical")
      .map((issue) => ({ sourceId: source.sourceId, message: issue.message }))
  );

  return NextResponse.json({
    ok: criticalIssues.length === 0,
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    summary: {
      sourceCount: sources.length,
      successfulSourceCount: sources.filter((source) => source.ok).length,
      failedSourceCount: sources.filter((source) => !source.ok).length,
      eventCount: results.reduce((sum, result) => sum + result.events.length, 0),
      indicatorCount: results.reduce((sum, result) => sum + result.indicators.length, 0),
      linkCoverage: totalRows ? Number((totalValidUrls / totalRows).toFixed(3)) : null,
      officialRows,
      discoveryRows,
      criticalIssueCount: criticalIssues.length,
      criticalIssues
    },
    acceptanceGuidance: [
      "Official sources should be the backbone of the analysis. Discovery sources should not be used as sole evidence.",
      "Every retained row should have a real http(s) source URL.",
      "Low-confidence rows should be treated as monitoring leads, not final conclusions.",
      "Compare sample values against the original linked page during the first manual acceptance test."
    ],
    sources
  });
}
