import type { CollectorResult, FinLayerId, MarketIndicator } from "@/lib/types";
import { emptyResult, failedResult, fetchJson, latestSparkline, makeIndicator } from "@/lib/collectors/utils";

type TwelveQuote = {
  symbol?: string;
  name?: string;
  close?: string;
  change?: string;
  percent_change?: string;
  datetime?: string;
  previous_close?: string;
};

type TwelveResponse = TwelveQuote | Record<string, TwelveQuote | { code?: number; message?: string }>;

const SYMBOLS: Array<{ symbol: string; name: string; layer: FinLayerId; tv: string; note: string }> = [
  { symbol: "SPY", name: "Twelve Data SPY", layer: "market", tv: "AMEX:SPY", note: "美股大盘价格代理，可与 FRED 利率和 BEA 增长数据交叉验证。" },
  { symbol: "QQQ", name: "Twelve Data QQQ", layer: "market", tv: "NASDAQ:QQQ", note: "科技成长股价格代理，用于观察估值对利率和盈利预期的反应。" },
  { symbol: "TLT", name: "Twelve Data TLT", layer: "market", tv: "NASDAQ:TLT", note: "长债 ETF 价格代理，用于观察长期利率风险。" },
  { symbol: "GLD", name: "Twelve Data GLD", layer: "market", tv: "AMEX:GLD", note: "黄金 ETF 价格代理，用于观察避险、美元和实际利率。" },
  { symbol: "USO", name: "Twelve Data USO", layer: "industry", tv: "AMEX:USO", note: "原油 ETF 价格代理，用于观察能源冲击和地缘风险。" }
];

export async function collectTwelveData(): Promise<CollectorResult> {
  const sourceId = "twelve_data";
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    return emptyResult(sourceId);
  }

  try {
    const url = new URL("https://api.twelvedata.com/quote");
    url.searchParams.set("symbol", SYMBOLS.map((item) => item.symbol).join(","));
    url.searchParams.set("apikey", apiKey);

    const data = await fetchJson<TwelveResponse>(url.toString());
    const indicators: MarketIndicator[] = [];

    for (const config of SYMBOLS) {
      const quote = getQuote(data, config.symbol);
      const close = Number(quote?.close);
      const previousClose = Number(quote?.previous_close);
      const percentChange = Number(quote?.percent_change);

      if (!Number.isFinite(close)) {
        continue;
      }

      const change = Number.isFinite(percentChange)
        ? `${percentChange >= 0 ? "+" : ""}${percentChange.toFixed(2)}% 1D`
        : Number.isFinite(previousClose) && previousClose !== 0
          ? `${((close / previousClose - 1) * 100).toFixed(2)}% 1D`
          : "latest";

      indicators.push(
        makeIndicator({
          id: `twelve_${config.symbol.toLowerCase()}_quote`,
          name: config.name,
          value: close.toFixed(2),
          unit: "USD",
          change,
          direction: Number.isFinite(percentChange) ? (percentChange > 0 ? "up" : percentChange < 0 ? "down" : "flat") : "flat",
          layer: config.layer,
          url: `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(config.tv)}`,
          source_type: "market_data",
          updated_at: quote?.datetime ? `${quote.datetime}T21:00:00Z` : new Date().toISOString(),
          sparkline: latestSparkline([previousClose, close].filter((value) => Number.isFinite(value))),
          note: `${config.note} 数据来自 Twelve Data quote endpoint；图表入口跳转 TradingView。`
        })
      );
    }

    return { sourceId, ok: true, events: [], indicators };
  } catch (error) {
    return failedResult(sourceId, error);
  }
}

function getQuote(data: TwelveResponse, symbol: string): TwelveQuote | null {
  if ("symbol" in data && data.symbol === symbol) {
    return data;
  }

  const record = data as Record<string, TwelveQuote | { code?: number; message?: string }>;
  const value = record[symbol];
  if (!value || "code" in value || !("close" in value)) {
    return null;
  }

  return value;
}
