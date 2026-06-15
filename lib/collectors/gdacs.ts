import type { CollectorResult, FinGraphEvent } from "@/lib/types";
import { failedResult, fetchText, makeEvent } from "@/lib/collectors/utils";

type GdacsItem = {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  eventType: string;
  alertLevel: string;
  country: string;
  severity: string;
  population: string;
};

const eventTypeLabels: Record<string, string> = {
  DR: "drought",
  EQ: "earthquake",
  FL: "flood",
  TC: "tropical cyclone",
  TS: "tsunami",
  VO: "volcano",
  WF: "wildfire"
};

export async function collectGdacs(): Promise<CollectorResult> {
  const sourceId = "gdacs";

  try {
    const xml = await fetchText("https://www.gdacs.org/xml/rss.xml", undefined, 20000);
    const items = parseGdacsItems(xml)
      .filter((item) => item.title && item.link)
      .sort((a, b) => alertScore(b.alertLevel) - alertScore(a.alertLevel))
      .slice(0, 6);

    const events: FinGraphEvent[] = items.map((item, index) => {
      const typeLabel = eventTypeLabels[item.eventType] ?? (item.eventType || "humanitarian alert");
      const score = alertScore(item.alertLevel);
      const countryNote = item.country ? `Affected area: ${item.country}. ` : "";
      const impactNote = [item.severity, item.population].filter(Boolean).join(" · ");

      return makeEvent({
        id: `gdacs_${Buffer.from(item.link).toString("base64url").slice(0, 24)}`,
        time: normalizeDate(item.pubDate) ?? new Date().toISOString(),
        title: `GDACS ${item.alertLevel || "alert"} ${typeLabel}: ${item.title}`,
        url: item.link,
        source_type: "public_database",
        related_layers: ["geopolitical", "social", "industry", "market"],
        related_nodes: ["humanitarian shock", "supply-chain channel", "food and energy risk", "risk premium"],
        description:
          `${countryNote}${item.description || "GDACS near-real-time disaster alert."} ${impactNote ? `Impact detail: ${impactNote}. ` : ""}` +
          "这类事件不是公司基本面数据，而是地缘/人道/供应链风险的早期监测信号，需要结合能源、粮食、航运和保险市场交叉验证。",
        direction: score >= 2 ? "negative" : "uncertain",
        strength: score >= 3 ? 4 : score >= 2 ? 3 : index < 2 ? 2 : 1,
        horizon: score >= 2 ? "short" : "medium",
        assets: inferAssets(item),
        confidence: 0.62
      });
    });

    return { sourceId, ok: true, events, indicators: [] };
  } catch (error) {
    return failedResult(sourceId, error);
  }
}

function parseGdacsItems(xml: string): GdacsItem[] {
  const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];

  return itemBlocks.map((block) => ({
    title: decodeXml(readTag(block, "title")),
    description: decodeXml(readTag(block, "description")).replace(/\s+/g, " ").trim(),
    link: decodeXml(readTag(block, "link")),
    pubDate: decodeXml(readTag(block, "pubDate")),
    eventType: decodeXml(readTag(block, "gdacs:eventtype")),
    alertLevel: decodeXml(readTag(block, "gdacs:alertlevel")),
    country: decodeXml(readTag(block, "gdacs:country")),
    severity: decodeXml(readTag(block, "gdacs:severity")),
    population: decodeXml(readTag(block, "gdacs:population"))
  }));
}

function readTag(block: string, tag: string) {
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = block.match(new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`, "i"));
  return match?.[1]?.trim() ?? "";
}

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function normalizeDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function alertScore(level: string) {
  const normalized = level.toLowerCase();
  if (normalized.includes("red")) {
    return 3;
  }
  if (normalized.includes("orange")) {
    return 2;
  }
  if (normalized.includes("green")) {
    return 1;
  }
  return 0;
}

function inferAssets(item: GdacsItem) {
  const text = `${item.title} ${item.description} ${item.country} ${item.eventType}`.toLowerCase();
  const assets = new Set<string>(["SPY", "DXY"]);

  if (/drought|flood|food|agricultural|wildfire/.test(text)) {
    assets.add("DBA");
    assets.add("CORN");
  }
  if (/cyclone|tsunami|shipping|red sea|flood/.test(text)) {
    assets.add("Oil");
  }
  if (/turkiye|iran|iraq|yemen|red sea|gulf|saudi/.test(text)) {
    assets.add("WTI");
  }

  return Array.from(assets);
}
