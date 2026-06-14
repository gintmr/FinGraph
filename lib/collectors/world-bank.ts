import type { CollectorResult, MarketIndicator } from "@/lib/types";
import { failedResult, fetchJson, latestSparkline, makeIndicator } from "@/lib/collectors/utils";

type WorldBankResponse = [
  unknown,
  Array<{
    date: string;
    value: number | null;
  }>
];

const WORLD_BANK_SERIES = [
  {
    id: "NY.GDP.MKTP.KD.ZG",
    indicatorId: "wb_us_gdp_growth",
    name: "美国 GDP 实际增速",
    unit: "%",
    layer: "industry" as const,
    note: "实际增长决定企业收入环境和财政收入基础。"
  },
  {
    id: "FP.CPI.TOTL.ZG",
    indicatorId: "wb_us_inflation",
    name: "美国通胀率",
    unit: "%",
    layer: "central_bank" as const,
    note: "通胀压力决定央行反应函数和实际利率路径。"
  }
];

export async function collectWorldBank(): Promise<CollectorResult> {
  const sourceId = "world_bank";

  try {
    const indicators: MarketIndicator[] = [];

    for (const series of WORLD_BANK_SERIES) {
      const url = `https://api.worldbank.org/v2/country/US/indicator/${series.id}?format=json&per_page=8`;
      const response = await fetchJson<WorldBankResponse>(url);
      const rows = response[1] ?? [];
      const values = rows
        .map((row) => row.value)
        .filter((value): value is number => typeof value === "number")
        .reverse();
      const latest = values.at(-1);
      const previous = values.at(-2);

      if (latest === undefined) {
        continue;
      }

      indicators.push(
        makeIndicator({
          id: series.indicatorId,
          name: series.name,
          value: latest.toFixed(2),
          unit: series.unit,
          change: previous === undefined ? "latest" : `${(latest - previous).toFixed(2)}${series.unit}`,
          direction: previous === undefined ? "flat" : latest > previous ? "up" : latest < previous ? "down" : "flat",
          layer: series.layer,
          url: `https://data.worldbank.org/indicator/${series.id}?locations=US`,
          source_type: "official_api",
          updated_at: new Date().toISOString(),
          sparkline: latestSparkline(values),
          note: series.note
        })
      );
    }

    return { sourceId, ok: true, events: [], indicators };
  } catch (error) {
    return failedResult(sourceId, error);
  }
}

