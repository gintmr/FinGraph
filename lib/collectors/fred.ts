import type { CollectorResult, MarketIndicator } from "@/lib/types";
import { emptyResult, failedResult, fetchJson, latestSparkline, makeIndicator } from "@/lib/collectors/utils";

type FredObservation = {
  date: string;
  value: string;
};

type FredResponse = {
  observations?: FredObservation[];
};

const SERIES = [
  {
    id: "DGS2",
    indicatorId: "fred_dgs2",
    name: "2Y 美债收益率",
    layer: "market" as const,
    unit: "%",
    decimals: 2,
    note: "2年期收益率更贴近市场对未来政策利率路径的定价。"
  },
  {
    id: "DGS10",
    indicatorId: "fred_dgs10",
    name: "10Y 美债收益率",
    layer: "market" as const,
    unit: "%",
    decimals: 2,
    note: "长期利率影响成长股折现率、房贷利率和财政利息压力。"
  },
  {
    id: "DGS30",
    indicatorId: "fred_dgs30",
    name: "30Y 美债收益率",
    layer: "market" as const,
    unit: "%",
    decimals: 2,
    note: "30年期收益率反映长期期限溢价、财政可持续性和长期通胀补偿。"
  },
  {
    id: "T10Y2Y",
    indicatorId: "fred_t10y2y",
    name: "10Y-2Y 收益率曲线",
    layer: "market" as const,
    unit: "%",
    decimals: 2,
    note: "10Y-2Y 利差用于观察收益率曲线倒挂、再陡峭化和衰退定价。"
  },
  {
    id: "FEDFUNDS",
    indicatorId: "fred_fedfunds",
    name: "联邦基金利率",
    layer: "central_bank" as const,
    unit: "%",
    decimals: 2,
    note: "政策利率是美元流动性和风险资产估值的核心锚。"
  },
  {
    id: "WALCL",
    indicatorId: "fred_walcl",
    name: "美联储资产负债表",
    layer: "central_bank" as const,
    unit: "USD mn",
    decimals: 0,
    note: "美联储资产负债表规模影响银行准备金、美元流动性和风险资产金融条件。"
  },
  {
    id: "DTWEXBGS",
    indicatorId: "fred_dollar_broad",
    name: "广义美元指数",
    layer: "currency" as const,
    unit: "",
    decimals: 2,
    note: "强美元通常意味着全球美元流动性趋紧。"
  },
  {
    id: "VIXCLS",
    indicatorId: "fred_vix",
    name: "VIX 恐慌指数",
    layer: "market" as const,
    unit: "",
    decimals: 2,
    note: "VIX 衡量标普500隐含波动率，是风险偏好和尾部风险定价的重要代理变量。"
  },
  {
    id: "BAMLH0A0HYM2",
    indicatorId: "fred_high_yield_spread",
    name: "美国高收益债利差",
    layer: "market" as const,
    unit: "%",
    decimals: 2,
    note: "高收益债利差代表信用风险补偿，通常领先反映企业融资压力和风险偏好变化。"
  }
];

export async function collectFred(): Promise<CollectorResult> {
  const sourceId = "fred";
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    return emptyResult(sourceId);
  }

  try {
    const indicators: MarketIndicator[] = [];

    for (const series of SERIES) {
      const url = new URL("https://api.stlouisfed.org/fred/series/observations");
      url.searchParams.set("series_id", series.id);
      url.searchParams.set("api_key", apiKey);
      url.searchParams.set("file_type", "json");
      url.searchParams.set("sort_order", "desc");
      url.searchParams.set("limit", "12");

      const data = await fetchJson<FredResponse>(url.toString());
      const observations = data.observations ?? [];
      const validObservations = observations
        .map((item) => ({ date: item.date, value: Number(item.value) }))
        .filter((item) => Number.isFinite(item.value))
        .reverse();
      const numeric = validObservations.map((item) => item.value);
      const latest = numeric.at(-1);
      const previous = numeric.at(-2);
      const latestDate = validObservations.at(-1)?.date;

      if (latest === undefined) {
        continue;
      }

      const change = previous === undefined ? "n/a" : `${(latest - previous).toFixed(2)}${series.unit}`;
      const direction = previous === undefined ? "flat" : latest > previous ? "up" : latest < previous ? "down" : "flat";
      const value = latest.toLocaleString("en-US", {
        minimumFractionDigits: series.decimals,
        maximumFractionDigits: series.decimals
      });

      indicators.push(
        makeIndicator({
          id: series.indicatorId,
          name: series.name,
          value,
          unit: series.unit,
          change,
          direction,
          layer: series.layer,
          url: `https://fred.stlouisfed.org/series/${series.id}`,
          source_type: "official_api",
          updated_at: latestDate ? `${latestDate}T12:00:00Z` : new Date().toISOString(),
          sparkline: latestSparkline(numeric),
          note: series.note
        })
      );
    }

    return { sourceId, ok: true, events: [], indicators };
  } catch (error) {
    return failedResult(sourceId, error);
  }
}
