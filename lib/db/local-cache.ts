import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CollectorResult, FinGraphEvent, MarketIndicator } from "@/lib/types";

const cachePath = path.join(process.cwd(), ".fingraph-live-cache.json");

type LiveCache = {
  generatedAt: string;
  events: FinGraphEvent[];
  indicators: MarketIndicator[];
};

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function dedupeById<T extends { id: string }>(items: T[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

export async function writeLocalLiveCache(results: CollectorResult[]) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const events = dedupeById(
    results
      .filter((result) => result.ok)
      .flatMap((result) => result.events)
      .filter((event) => event.id && event.title && event.time && isValidHttpUrl(event.url))
  );
  const indicators = dedupeById(
    results
      .filter((result) => result.ok)
      .flatMap((result) => result.indicators)
      .filter((indicator) => indicator.id && indicator.name && indicator.updated_at && isValidHttpUrl(indicator.url))
  );

  const cache: LiveCache = {
    generatedAt: new Date().toISOString(),
    events,
    indicators
  };

  await writeFile(cachePath, JSON.stringify(cache, null, 2), "utf8");
}

export async function readLocalLiveCache() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  try {
    const raw = await readFile(cachePath, "utf8");
    const cache = JSON.parse(raw) as LiveCache;
    return {
      generatedAt: cache.generatedAt,
      events: cache.events ?? [],
      indicators: cache.indicators ?? []
    };
  } catch {
    return null;
  }
}
