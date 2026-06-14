import type { CollectorResult, FinGraphEvent, MarketIndicator, SourceType } from "@/lib/types";

export async function fetchJson<T>(url: string, init?: RequestInit, timeoutMs = 12000): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "accept": "application/json",
        ...(init?.headers ?? {})
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchText(url: string, init?: RequestInit, timeoutMs = 12000): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "accept": "application/rss+xml, application/xml, text/xml, text/plain, */*",
        ...(init?.headers ?? {})
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

export function emptyResult(sourceId: string): CollectorResult {
  return { sourceId, ok: true, events: [], indicators: [] };
}

export function failedResult(sourceId: string, error: unknown): CollectorResult {
  return {
    sourceId,
    ok: false,
    events: [],
    indicators: [],
    error: error instanceof Error ? error.message : String(error)
  };
}

export function makeEvent(input: Omit<FinGraphEvent, "included_in_export">): FinGraphEvent {
  return { ...input, included_in_export: true };
}

export function makeIndicator(input: MarketIndicator): MarketIndicator {
  return input;
}

export function sourceConfidence(sourceType: SourceType) {
  switch (sourceType) {
    case "official_api":
    case "official_rss":
    case "company_filing":
      return 0.82;
    case "public_database":
      return 0.62;
    case "market_data":
      return 0.58;
    case "search_result":
      return 0.42;
    default:
      return 0.35;
  }
}

export function latestSparkline(values: Array<number | null | undefined>, max = 8) {
  return values
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value))
    .slice(-max);
}
