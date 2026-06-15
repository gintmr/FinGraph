import type { CollectorResult, FinGraphEvent } from "@/lib/types";
import { failedResult, fetchJson, makeEvent } from "@/lib/collectors/utils";
import { containsHangul } from "@/lib/analysis/event-filters";

type GdeltDocResponse = {
  articles?: Array<{
    title?: string;
    url?: string;
    seendate?: string;
    domain?: string;
  }>;
};

export async function collectGdelt(): Promise<CollectorResult> {
  const sourceId = "gdelt";

  try {
    const url = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
    url.searchParams.set(
      "query",
      "((war OR military OR conflict OR sanctions OR airstrike OR missile OR \"Red Sea\" OR \"Taiwan Strait\" OR \"South China Sea\" OR \"shipping disruption\" OR \"export controls\" OR \"energy security\") sourcelang:english)"
    );
    url.searchParams.set("mode", "ArtList");
    url.searchParams.set("format", "json");
    url.searchParams.set("maxrecords", "8");
    url.searchParams.set("sort", "hybridrel");

    const data = await fetchJson<GdeltDocResponse>(url.toString(), undefined, 20000);
    const events: FinGraphEvent[] = (data.articles ?? [])
      .filter((article) => article.title && article.url && !containsHangul(`${article.title} ${article.url}`))
      .slice(0, 6)
      .map((article, index) =>
        makeEvent({
          id: `gdelt_${Buffer.from(article.url as string).toString("base64url").slice(0, 24)}`,
          time: normalizeGdeltDate(article.seendate) ?? new Date().toISOString(),
          title: article.title as string,
          url: article.url as string,
          source_type: "public_database",
          related_layers: ["geopolitical", "industry", "market"],
          related_nodes: ["conflict monitor", "sanctions channel", "shipping route", "risk premium"],
          description:
            "GDELT 发现的地缘/冲突/制裁/航运相关报道链接，应作为风险雷达和交叉验证入口。若该主题同时被官方公告、公司披露或多个可靠媒体确认，才应提高结论强度。",
          direction: "uncertain",
          strength: index < 2 ? 3 : 2,
          horizon: "short",
          assets: ["QQQ", "SPY", "Oil"],
          confidence: 0.46
        })
      );

    return { sourceId, ok: true, events, indicators: [] };
  } catch (error) {
    return failedResult(sourceId, error);
  }
}

function normalizeGdeltDate(value?: string) {
  if (!value) {
    return null;
  }

  const digits = value.replace(/\D/g, "");
  if (digits.length < 8) {
    return null;
  }

  const year = digits.slice(0, 4);
  const month = digits.slice(4, 6);
  const day = digits.slice(6, 8);
  const hour = digits.slice(8, 10) || "00";
  const minute = digits.slice(10, 12) || "00";
  const second = digits.slice(12, 14) || "00";
  const normalized = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
  const date = new Date(normalized);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
