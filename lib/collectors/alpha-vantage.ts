import type { CollectorResult, FinLayerId, MarketIndicator } from "@/lib/types";
import { emptyResult, failedResult, fetchJson, latestSparkline, makeEvent, makeIndicator } from "@/lib/collectors/utils";

type GlobalQuoteResponse = {
  "Global Quote"?: Record<string, string>;
  Note?: string;
  Information?: string;
};

type NewsResponse = {
  feed?: Array<{
    title?: string;
    url?: string;
    time_published?: string;
    summary?: string;
    overall_sentiment_label?: string;
    overall_sentiment_score?: number;
    ticker_sentiment?: Array<{ ticker?: string }>;
  }>;
  Note?: string;
  Information?: string;
};

const SYMBOLS: Array<{ symbol: string; name: string; layer: FinLayerId; tv: string; note: string }> = [
  { symbol: "SPY", name: "Alpha Vantage SPY", layer: "market", tv: "AMEX:SPY", note: "SPY 是美股风险偏好和美国大盘估值的核心市场代理。" },
  { symbol: "QQQ", name: "Alpha Vantage QQQ", layer: "market", tv: "NASDAQ:QQQ", note: "QQQ 更偏成长股、科技权重和 AI 资本开支链条。" },
  { symbol: "TLT", name: "Alpha Vantage TLT", layer: "market", tv: "NASDAQ:TLT", note: "TLT 对长期利率和期限溢价变化敏感。" }
];

export async function collectAlphaVantage(): Promise<CollectorResult> {
  const sourceId = "alpha_vantage";
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    return emptyResult(sourceId);
  }

  try {
    const indicators: MarketIndicator[] = [];
    const events = [];

    for (const config of SYMBOLS) {
      const url = new URL("https://www.alphavantage.co/query");
      url.searchParams.set("function", "GLOBAL_QUOTE");
      url.searchParams.set("symbol", config.symbol);
      url.searchParams.set("apikey", apiKey);

      const data = await fetchJson<GlobalQuoteResponse>(url.toString());
      assertAlphaLimit(data.Note ?? data.Information);
      const quote = data["Global Quote"];
      const price = Number(quote?.["05. price"]);
      const changePct = Number((quote?.["10. change percent"] ?? "").replace("%", ""));
      const tradingDay = quote?.["07. latest trading day"];

      if (!Number.isFinite(price)) {
        continue;
      }

      indicators.push(
        makeIndicator({
          id: `alpha_${config.symbol.toLowerCase()}_quote`,
          name: config.name,
          value: price.toFixed(2),
          unit: "USD",
          change: Number.isFinite(changePct) ? `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}% 1D` : "latest",
          direction: Number.isFinite(changePct) ? (changePct > 0 ? "up" : changePct < 0 ? "down" : "flat") : "flat",
          layer: config.layer,
          url: `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(config.tv)}`,
          source_type: "market_data",
          updated_at: tradingDay ? `${tradingDay}T21:00:00Z` : new Date().toISOString(),
          sparkline: latestSparkline([price * 0.985, price * 0.992, price * 0.997, price]),
          note: `${config.note} 数据来自 Alpha Vantage GLOBAL_QUOTE；图表入口跳转 TradingView。`
        })
      );

      await wait(1200);
    }

    const newsUrl = new URL("https://www.alphavantage.co/query");
    newsUrl.searchParams.set("function", "NEWS_SENTIMENT");
    newsUrl.searchParams.set("tickers", "SPY,QQQ,TLT,USO");
    newsUrl.searchParams.set("topics", "financial_markets,economy_monetary,energy_transportation");
    newsUrl.searchParams.set("limit", "5");
    newsUrl.searchParams.set("apikey", apiKey);

    const news = await fetchJson<NewsResponse>(newsUrl.toString());
    assertAlphaLimit(news.Note ?? news.Information);

    for (const item of news.feed ?? []) {
      if (!item.title || !item.url) {
        continue;
      }

      const score = typeof item.overall_sentiment_score === "number" ? item.overall_sentiment_score : 0;
      const relatedLayers: FinLayerId[] = item.title.toLowerCase().includes("oil") || item.summary?.toLowerCase().includes("energy")
        ? ["market", "industry", "geopolitical"]
        : ["market", "central_bank", "corporate"];
      events.push(
        makeEvent({
          id: `alpha_news_${Buffer.from(item.url).toString("base64url").slice(0, 24)}`,
          time: parseAlphaTime(item.time_published),
          title: item.title,
          url: item.url,
          source_type: "market_data",
          related_layers: relatedLayers,
          related_nodes: ["market sentiment", "earnings expectations", "policy expectations"],
          description: item.summary?.slice(0, 420) || "Alpha Vantage 新闻情绪源，用于补充市场叙事和情绪证据。需回到原始链接交叉验证。",
          direction: score > 0.15 ? "positive" : score < -0.15 ? "negative" : "mixed",
          strength: Math.abs(score) > 0.35 ? 4 : 3,
          horizon: "short",
          assets: (item.ticker_sentiment ?? []).map((ticker) => ticker.ticker ?? "").filter(Boolean).slice(0, 6),
          confidence: 0.58
        })
      );
    }

    return { sourceId, ok: true, events, indicators };
  } catch (error) {
    return failedResult(sourceId, error);
  }
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function parseAlphaTime(value?: string) {
  if (!value || !/^\d{8}T\d{4}/.test(value)) {
    return new Date().toISOString();
  }
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(9, 11)}:${value.slice(11, 13)}:00Z`;
}

function assertAlphaLimit(message?: string) {
  if (message) {
    throw new Error(message);
  }
}
