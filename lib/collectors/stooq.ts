import type { CollectorResult, FinLayerId, MarketIndicator } from "@/lib/types";
import { failedResult, fetchText, latestSparkline, makeIndicator } from "@/lib/collectors/utils";

type StooqSeriesConfig = {
  id: string;
  symbol: string;
  name: string;
  unit?: string;
  layer: FinLayerId;
  url: string;
  note: string;
};

type StooqRow = {
  date: string;
  close: number;
};

const SERIES: StooqSeriesConfig[] = [
  {
    id: "stooq_spy",
    symbol: "spy.us",
    name: "SPY ETF",
    unit: "USD",
    layer: "market",
    url: "https://stooq.com/q/?s=spy.us",
    note: "SPY 是美国大盘风险偏好的核心代理变量。"
  },
  {
    id: "stooq_qqq",
    symbol: "qqq.us",
    name: "QQQ ETF",
    unit: "USD",
    layer: "market",
    url: "https://stooq.com/q/?s=qqq.us",
    note: "QQQ 反映成长股、科技股和 AI 资本开支叙事的定价。"
  },
  {
    id: "stooq_tlt",
    symbol: "tlt.us",
    name: "TLT ETF",
    unit: "USD",
    layer: "market",
    url: "https://stooq.com/q/?s=tlt.us",
    note: "TLT 对长期利率、期限溢价和降息预期敏感。"
  },
  {
    id: "stooq_gld",
    symbol: "gld.us",
    name: "GLD ETF",
    unit: "USD",
    layer: "market",
    url: "https://stooq.com/q/?s=gld.us",
    note: "GLD 帮助观察实际利率、美元信用和避险需求。"
  },
  {
    id: "stooq_uso",
    symbol: "uso.us",
    name: "USO Oil ETF",
    unit: "USD",
    layer: "industry",
    url: "https://stooq.com/q/?s=uso.us",
    note: "USO 是油价风险的可交易代理，用于观察能源通胀与地缘风险溢价。"
  }
];

export async function collectStooqMarketData(): Promise<CollectorResult> {
  const sourceId = "stooq";

  try {
    const rows = await Promise.all(SERIES.map(fetchStooqSeries));
    const indicators = rows.filter((row): row is MarketIndicator => row !== null);
    return { sourceId, ok: true, events: [], indicators };
  } catch (error) {
    return failedResult(sourceId, error);
  }
}

async function fetchStooqSeries(config: StooqSeriesConfig): Promise<MarketIndicator | null> {
  const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(config.symbol)}&i=d`;
  const csv = await fetchText(url, { headers: { accept: "text/csv, text/plain, */*" } }, 16000);
  const rows = parseHistoricalCsv(csv).slice(-30);
  const latest = rows.at(-1);
  const previous = rows.at(-2);

  if (!latest) {
    return null;
  }

  const changePct = previous && previous.close !== 0 ? ((latest.close / previous.close) - 1) * 100 : null;

  return makeIndicator({
    id: config.id,
    name: config.name,
    value: latest.close.toFixed(2),
    unit: config.unit,
    change: changePct === null ? "latest" : `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}% 1D`,
    direction: changePct === null || Math.abs(changePct) < 0.01 ? "flat" : changePct > 0 ? "up" : "down",
    layer: config.layer,
    url: config.url,
    source_type: "market_data",
    updated_at: `${latest.date}T21:00:00Z`,
    sparkline: latestSparkline(rows.map((row) => row.close), 12),
    note: config.note
  });
}

function parseHistoricalCsv(csv: string): StooqRow[] {
  return csv
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const [date, , , , close] = line.split(",");
      return { date, close: Number(close) };
    })
    .filter((row) => /^\d{4}-\d{2}-\d{2}$/.test(row.date) && Number.isFinite(row.close))
    .sort((a, b) => a.date.localeCompare(b.date));
}
