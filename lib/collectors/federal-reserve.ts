import type { CollectorResult, Direction, FinGraphEvent } from "@/lib/types";
import { failedResult, fetchText, makeEvent } from "@/lib/collectors/utils";

type FeedConfig = {
  id: string;
  url: string;
  category: string;
  strength: 1 | 2 | 3 | 4 | 5;
};

type RssItem = {
  title: string;
  link: string;
  pubDate?: string;
  description?: string;
};

const FEEDS: FeedConfig[] = [
  {
    id: "monetary_policy",
    url: "https://www.federalreserve.gov/feeds/press_monetary.xml",
    category: "Monetary Policy",
    strength: 5
  },
  {
    id: "speeches",
    url: "https://www.federalreserve.gov/feeds/speeches.xml",
    category: "Speeches",
    strength: 3
  },
  {
    id: "testimony",
    url: "https://www.federalreserve.gov/feeds/testimony.xml",
    category: "Testimony",
    strength: 4
  }
];

export async function collectFederalReserve(): Promise<CollectorResult> {
  const sourceId = "federal_reserve";

  try {
    const feedItems = await Promise.all(
      FEEDS.map(async (feed) => ({
        feed,
        items: parseRssItems(await fetchText(feed.url))
      }))
    );

    const events: FinGraphEvent[] = feedItems.flatMap(({ feed, items }) =>
      items.slice(0, 4).map((item) =>
        makeEvent({
          id: `fed_${feed.id}_${hashText(item.link || item.title)}`,
          time: normalizeRssDate(item.pubDate),
          title: item.title,
          url: item.link,
          source_type: "official_rss",
          related_layers: ["central_bank", "market", "currency"],
          related_nodes: ["Fed reaction function", "real yields", "rate expectations", feed.category],
          description:
            `${feed.category} 来自 Federal Reserve 官方 RSS。分析时应检查其对通胀、就业、金融条件和政策路径的措辞变化，并与收益率曲线、美元和风险资产反应交叉验证。`,
          direction: inferFedDirection(item.title, item.description),
          strength: feed.strength,
          horizon: feed.strength >= 4 ? "medium" : "short",
          assets: ["SPY", "QQQ", "TLT", "DXY", "US10Y"],
          confidence: 0.84
        })
      )
    );

    return { sourceId, ok: true, events, indicators: [] };
  } catch (error) {
    return failedResult(sourceId, error);
  }
}

function parseRssItems(xml: string): RssItem[] {
  const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];
  const items: RssItem[] = [];

  for (const itemXml of itemMatches) {
    const title = textFromTag(itemXml, "title");
    const link = textFromTag(itemXml, "link");
    if (!title || !link) {
      continue;
    }

    items.push({
      title,
      link,
      pubDate: textFromTag(itemXml, "pubDate"),
      description: textFromTag(itemXml, "description")
    });
  }

  return items;
}

function textFromTag(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1].trim()) : undefined;
}

function decodeXml(value: string) {
  return value
    .replaceAll("<![CDATA[", "")
    .replaceAll("]]>", "")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'");
}

function normalizeRssDate(value?: string) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function inferFedDirection(title: string, description?: string): Direction {
  const text = `${title} ${description ?? ""}`.toLowerCase();

  if (/(inflation|restrictive|higher|tightening|resilient|strong labor|price stability)/.test(text)) {
    return "negative";
  }

  if (/(disinflation|cut|easing|softening|slowing|accommodative)/.test(text)) {
    return "positive";
  }

  return "mixed";
}

function hashText(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash.toString(36);
}
