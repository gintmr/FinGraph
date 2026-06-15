import type { CollectorResult, FinLayerId, MarketIndicator } from "@/lib/types";
import { emptyResult, failedResult, fetchJson, latestSparkline, makeEvent, makeIndicator } from "@/lib/collectors/utils";

type BeaRow = {
  TimePeriod?: string;
  DataValue?: string;
  LineDescription?: string;
};

type BeaResponse = {
  BEAAPI?: {
    Results?: {
      Data?: BeaRow[];
      Error?: {
        ErrorCode?: string;
        ErrorDescription?: string;
        APIErrorCode?: string;
        APIErrorDescription?: string;
      };
    };
  };
};

type BeaSeries = {
  id: string;
  lineNumber: string;
  name: string;
  layer: FinLayerId;
  note: string;
};

const SERIES: BeaSeries[] = [
  {
    id: "bea_real_gdp_growth",
    lineNumber: "1",
    name: "BEA 实际 GDP 增速",
    layer: "industry",
    note: "BEA NIPA Table 1.1.1 官方环比年化增速。GDP 是判断美国经济周期、企业收入环境和财政收入基础的核心变量。"
  },
  {
    id: "bea_real_pce_growth",
    lineNumber: "2",
    name: "BEA 实际个人消费支出增速",
    layer: "social",
    note: "个人消费是美国经济需求端核心。消费韧性会影响企业收入、通胀粘性和美联储反应函数。"
  },
  {
    id: "bea_private_investment_growth",
    lineNumber: "8",
    name: "BEA 私人投资增速",
    layer: "industry",
    note: "私人投资反映企业资本开支、库存和房地产周期，是产业层景气度的重要官方证据。"
  },
  {
    id: "bea_gov_spending_growth",
    lineNumber: "21",
    name: "BEA 政府支出增速",
    layer: "fiscal",
    note: "政府支出连接财政层和实际增长。它本身不是赤字，但能帮助判断财政脉冲对经济和市场的支撑。"
  }
];

export async function collectBea(): Promise<CollectorResult> {
  const sourceId = "bea";
  const apiKey = process.env.BEA_API_KEY;
  if (!apiKey) {
    return emptyResult(sourceId);
  }

  try {
    const indicators: MarketIndicator[] = [];

    for (const series of SERIES) {
      const url = new URL("https://apps.bea.gov/api/data");
      url.searchParams.set("UserID", apiKey);
      url.searchParams.set("method", "GetData");
      url.searchParams.set("datasetname", "NIPA");
      url.searchParams.set("TableName", "T10101");
      url.searchParams.set("LineNumber", series.lineNumber);
      url.searchParams.set("Frequency", "Q");
      url.searchParams.set("Year", "X");
      url.searchParams.set("ResultFormat", "JSON");

      const data = await fetchJson<BeaResponse>(url.toString());
      const beaError = data.BEAAPI?.Results?.Error;
      if (beaError) {
        throw new Error(
          `${beaError.ErrorCode ?? beaError.APIErrorCode ?? "BEA"} ${beaError.ErrorDescription ?? beaError.APIErrorDescription ?? "API error"}`
        );
      }

      const rows = (data.BEAAPI?.Results?.Data ?? [])
        .map((row) => ({
          period: row.TimePeriod ?? "",
          value: Number((row.DataValue ?? "").replace(/,/g, ""))
        }))
        .filter((row) => /^\d{4}Q[1-4]$/.test(row.period) && Number.isFinite(row.value))
        .sort((a, b) => a.period.localeCompare(b.period))
        .slice(-8);
      const latest = rows.at(-1);
      const previous = rows.at(-2);

      if (!latest) {
        continue;
      }

      indicators.push(
        makeIndicator({
          id: series.id,
          name: series.name,
          value: latest.value.toFixed(1),
          unit: "% SAAR",
          change: previous ? `${(latest.value - previous.value).toFixed(1)}ppt` : "latest",
          direction: previous ? (latest.value > previous.value ? "up" : latest.value < previous.value ? "down" : "flat") : "flat",
          layer: series.layer,
          url: "https://apps.bea.gov/iTable/?ReqID=19&step=2&isuri=1&categories=survey",
          source_type: "official_api",
          updated_at: `${latest.period.slice(0, 4)}-${quarterEndMonth(latest.period)}T12:00:00Z`,
          sparkline: latestSparkline(rows.map((row) => row.value)),
          note: series.note
        })
      );
    }

    const latestDate = indicators
      .map((indicator) => indicator.updated_at)
      .sort()
      .at(-1) ?? new Date().toISOString();

    return {
      sourceId,
      ok: true,
      events: indicators.length
        ? [
            makeEvent({
              id: `bea_nipa_snapshot_${latestDate.slice(0, 10)}`,
              time: latestDate,
              title: "BEA NIPA growth snapshot updated",
              url: "https://apps.bea.gov/api/signup/",
              source_type: "official_api",
              related_layers: ["industry", "social", "fiscal", "market"],
              related_nodes: ["real GDP", "consumer spending", "fiscal impulse", "earnings cycle"],
              description:
                "BEA 官方 NIPA 数据把增长、消费、投资和政府支出放在同一张国民账户框架中。分析美股时应把这些变量与企业收入、利润率、通胀和利率一起解释。",
              direction: "mixed",
              strength: 4,
              horizon: "medium",
              assets: ["SPY", "QQQ", "TLT", "DXY"],
              confidence: 0.86
            })
          ]
        : [],
      indicators
    };
  } catch (error) {
    return failedResult(sourceId, error);
  }
}

function quarterEndMonth(period: string) {
  const quarter = period.slice(-1);
  switch (quarter) {
    case "1":
      return "03-31";
    case "2":
      return "06-30";
    case "3":
      return "09-30";
    default:
      return "12-31";
  }
}
