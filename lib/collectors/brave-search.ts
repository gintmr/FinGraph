import type { CollectorResult, FinGraphEvent } from "@/lib/types";
import { emptyResult, failedResult, fetchJson, makeEvent } from "@/lib/collectors/utils";

type BraveSearchResponse = {
  web?: {
    results?: Array<{
      title?: string;
      url?: string;
      description?: string;
      age?: string;
    }>;
  };
};

const TOPICS = [
  "Federal Reserve inflation rates Nasdaq",
  "AI chip demand semiconductor earnings",
  "Treasury auction long term yields",
  "oil prices geopolitical risk inflation"
];

export async function collectBraveSearch(): Promise<CollectorResult> {
  const sourceId = "brave_search";
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    return emptyResult(sourceId);
  }

  try {
    const events: FinGraphEvent[] = [];

    for (const topic of TOPICS) {
      const url = new URL("https://api.search.brave.com/res/v1/web/search");
      url.searchParams.set("q", topic);
      url.searchParams.set("count", "3");
      url.searchParams.set("freshness", "pd");

      const data = await fetchJson<BraveSearchResponse>(
        url.toString(),
        {
          headers: {
            "x-subscription-token": apiKey
          }
        },
        12000
      );

      for (const result of data.web?.results ?? []) {
        if (!result.title || !result.url) {
          continue;
        }

        events.push(
          makeEvent({
            id: `brave_${Buffer.from(result.url).toString("base64url").slice(0, 24)}`,
            time: new Date().toISOString(),
            title: result.title,
            url: result.url,
            source_type: "search_result",
            related_layers: ["market", "geopolitical", "industry"],
            related_nodes: ["search-discovered report", "cross-check required"],
            description:
              result.description ??
              "Search-discovered item. Use as a link for follow-up and cross-checking before treating it as high-confidence evidence.",
            direction: "uncertain",
            strength: 2,
            horizon: "short",
            assets: ["QQQ", "SPY", "DXY", "Oil"],
            confidence: 0.38
          })
        );
      }
    }

    return { sourceId, ok: true, events, indicators: [] };
  } catch (error) {
    return failedResult(sourceId, error);
  }
}

