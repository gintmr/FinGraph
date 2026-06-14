import type { CollectorResult, FinGraphEvent, FinLayerId, MarketIndicator, Trend } from "@/lib/types";
import { failedResult, fetchJson, latestSparkline, makeEvent, makeIndicator } from "@/lib/collectors/utils";

type BlsSeriesResponse = {
  status?: string;
  message?: string[];
  Results?: {
    series?: Array<{
      seriesID?: string;
      data?: Array<{
        year?: string;
        period?: string;
        periodName?: string;
        value?: string;
      }>;
    }>;
  };
};

type BlsSeries = NonNullable<NonNullable<BlsSeriesResponse["Results"]>["series"]>[number];

type BlsSeriesConfig = {
  id: string;
  seriesId: string;
  name: string;
  unit?: string;
  layer: FinLayerId;
  assets: string[];
  note: string;
  changeMode: "mom" | "yoy" | "level";
};

const SERIES: BlsSeriesConfig[] = [
  {
    id: "bls_cpi_all_items",
    seriesId: "CUSR0000SA0",
    name: "CPI-U All Items",
    unit: "index",
    layer: "central_bank",
    assets: ["SPY", "QQQ", "TLT", "DXY"],
    note: "CPI 是央行层判断通胀粘性、实际利率与降息空间的核心官方变量。",
    changeMode: "yoy"
  },
  {
    id: "bls_unemployment_rate",
    seriesId: "LNS14000000",
    name: "U.S. Unemployment Rate",
    unit: "%",
    layer: "social",
    assets: ["SPY", "QQQ", "TLT"],
    note: "失业率连接社会层、央行反应函数和企业盈利周期。",
    changeMode: "mom"
  },
  {
    id: "bls_nonfarm_payrolls",
    seriesId: "CES0000000001",
    name: "Nonfarm Payroll Employment",
    unit: "K persons",
    layer: "social",
    assets: ["SPY", "QQQ", "TLT"],
    note: "非农就业是增长韧性与薪资压力的重要高频官方证据。",
    changeMode: "mom"
  },
  {
    id: "bls_average_hourly_earnings",
    seriesId: "CES0500000003",
    name: "Average Hourly Earnings",
    unit: "USD/hour",
    layer: "social",
    assets: ["SPY", "QQQ", "TLT"],
    note: "平均时薪帮助判断服务通胀和消费韧性是否会延缓货币宽松。",
    changeMode: "yoy"
  },
  {
    id: "bls_ppi_final_demand",
    seriesId: "WPSFD4",
    name: "PPI Final Demand",
    unit: "index",
    layer: "industry",
    assets: ["SPY", "QQQ", "DXY"],
    note: "PPI 反映生产端价格压力，会传导到利润率、库存和央行通胀判断。",
    changeMode: "yoy"
  }
];

export async function collectBls(): Promise<CollectorResult> {
  const sourceId = "bls";

  try {
    const seriesData = await fetchBlsSeriesBatch();
    const rows = SERIES.map((series) => buildBlsIndicator(series, seriesData.get(series.seriesId)));
    const indicators = rows.filter((row): row is MarketIndicator => row !== null);
    const latestTime = indicators[0]?.updated_at ?? new Date().toISOString();
    const events: FinGraphEvent[] = indicators.length
      ? [
          makeEvent({
            id: `bls_macro_snapshot_${latestTime.slice(0, 10)}`,
            time: latestTime,
            title: "BLS official macro snapshot updated",
            url: "https://www.bls.gov/developers/api_signature_v2.htm",
            source_type: "official_api",
            related_layers: ["central_bank", "social", "industry"],
            related_nodes: ["inflation", "labor market", "wage pressure", "policy reaction function"],
            description:
              "BLS 官方数据更新会同时影响央行层、社会层和产业层。分析时应把 CPI/PPI 的价格压力与失业率、非农、工资增速放在同一个反应函数里判断，而不是孤立解读单个数值。",
            direction: inferBlsSnapshotDirection(indicators),
            strength: 4,
            horizon: "medium",
            assets: Array.from(
              new Set(indicators.flatMap((indicator) => ["SPY", "QQQ", "TLT", ...(indicator.name.includes("CPI") ? ["DXY"] : [])]))
            ),
            confidence: 0.86
          })
        ]
      : [];

    return { sourceId, ok: true, events, indicators };
  } catch (error) {
    return failedResult(sourceId, error);
  }
}

async function fetchBlsSeriesBatch() {
  const currentYear = new Date().getUTCFullYear();
  const body: Record<string, unknown> = {
    seriesid: SERIES.map((series) => series.seriesId),
    startyear: String(currentYear - 3),
    endyear: String(currentYear)
  };

  if (process.env.BLS_API_KEY) {
    body.registrationkey = process.env.BLS_API_KEY;
  }

  const data = await fetchJson<BlsSeriesResponse>(
    "https://api.bls.gov/publicAPI/v2/timeseries/data/",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    },
    16000
  );

  if (data.status && data.status !== "REQUEST_SUCCEEDED") {
    throw new Error(data.message?.join("; ") || `BLS request failed: ${data.status}`);
  }

  return new Map((data.Results?.series ?? []).map((series) => [series.seriesID ?? "", series]));
}

function buildBlsIndicator(config: BlsSeriesConfig, series?: BlsSeries): MarketIndicator | null {
  const points = (series?.data ?? [])
    .map((point) => ({
      year: point.year ?? "",
      period: point.period ?? "",
      periodName: point.periodName ?? "",
      value: Number(point.value)
    }))
    .filter((point) => point.period.startsWith("M") && point.period !== "M13" && Number.isFinite(point.value))
    .sort((a, b) => pointSortKey(a.year, a.period) - pointSortKey(b.year, b.period));

  const latest = points.at(-1);
  if (!latest) {
    return null;
  }

  const previous = points.at(-2);
  const yearAgo = points.find((point) => pointSortKey(point.year, point.period) === pointSortKey(latest.year, latest.period) - 12);
  const change = formatChange(config.changeMode, latest.value, previous?.value, yearAgo?.value);
  const trend = inferTrend(config.changeMode, latest.value, previous?.value, yearAgo?.value);

  return makeIndicator({
    id: config.id,
    name: config.name,
    value: latest.value.toFixed(config.unit === "%" ? 1 : 2),
    unit: config.unit,
    change,
    direction: trend,
    layer: config.layer,
    url: `https://data.bls.gov/timeseries/${config.seriesId}`,
    source_type: "official_api",
    updated_at: `${latest.year}-${periodToMonth(latest.period)}-01T12:00:00Z`,
    sparkline: latestSparkline(points.map((point) => point.value), 12),
    note: config.note
  });
}

function pointSortKey(year: string, period: string) {
  return Number(year) * 12 + Number(period.slice(1));
}

function periodToMonth(period: string) {
  return period.slice(1).padStart(2, "0");
}

function formatChange(mode: BlsSeriesConfig["changeMode"], latest: number, previous?: number, yearAgo?: number) {
  if (mode === "yoy" && yearAgo) {
    return `${(((latest / yearAgo) - 1) * 100).toFixed(1)}% YoY`;
  }

  if (mode === "mom" && previous !== undefined) {
    const diff = latest - previous;
    return `${diff >= 0 ? "+" : ""}${diff.toFixed(1)} m/m`;
  }

  return "latest official";
}

function inferTrend(mode: BlsSeriesConfig["changeMode"], latest: number, previous?: number, yearAgo?: number): Trend {
  const baseline = mode === "yoy" ? yearAgo : previous;
  if (baseline === undefined || baseline === 0) {
    return "flat";
  }

  const diff = latest - baseline;
  if (Math.abs(diff) < 0.05) {
    return "flat";
  }

  return diff > 0 ? "up" : "down";
}

function inferBlsSnapshotDirection(indicators: MarketIndicator[]) {
  const cpi = indicators.find((indicator) => indicator.id === "bls_cpi_all_items");
  const unemployment = indicators.find((indicator) => indicator.id === "bls_unemployment_rate");

  if (cpi?.direction === "up" && unemployment?.direction !== "up") {
    return "negative" as const;
  }

  if (cpi?.direction === "down" && unemployment?.direction !== "up") {
    return "positive" as const;
  }

  return "mixed" as const;
}
