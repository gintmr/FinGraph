import type { CollectorResult } from "@/lib/types";
import { emptyResult, failedResult, fetchJson, latestSparkline, makeIndicator } from "@/lib/collectors/utils";

type EiaResponse = {
  response?: {
    data?: Array<{
      period: string;
      value: string | number;
    }>;
  };
};

export async function collectEia(): Promise<CollectorResult> {
  const sourceId = "eia";
  const apiKey = process.env.EIA_API_KEY;
  if (!apiKey) {
    return emptyResult(sourceId);
  }

  try {
    const url = new URL("https://api.eia.gov/v2/petroleum/pri/spt/data/");
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("frequency", "weekly");
    url.searchParams.set("data[0]", "value");
    url.searchParams.set("facets[product][]", "EPCWTI");
    url.searchParams.set("facets[series][]", "RWTC");
    url.searchParams.set("sort[0][column]", "period");
    url.searchParams.set("sort[0][direction]", "desc");
    url.searchParams.set("length", "8");

    const data = await fetchJson<EiaResponse>(url.toString());
    const values = (data.response?.data ?? [])
      .map((row) => Number(row.value))
      .filter((value) => Number.isFinite(value))
      .reverse();
    const latest = values.at(-1);
    const previous = values.at(-2);

    if (latest === undefined) {
      return emptyResult(sourceId);
    }

    return {
      sourceId,
      ok: true,
      events: [],
      indicators: [
        makeIndicator({
          id: "eia_wti_spot",
          name: "WTI 原油",
          value: latest.toFixed(2),
          unit: "USD",
          change: previous === undefined ? "latest" : `${(latest - previous).toFixed(2)}`,
          direction: previous === undefined ? "flat" : latest > previous ? "up" : latest < previous ? "down" : "flat",
          layer: "industry",
          url: "https://www.eia.gov/dnav/pet/pet_pri_spt_s1_d.htm",
          source_type: "official_api",
          updated_at: new Date().toISOString(),
          sparkline: latestSparkline(values),
          note: "油价通过能源通胀、消费者支出和地缘风险溢价传导到市场。"
        })
      ]
    };
  } catch (error) {
    return failedResult(sourceId, error);
  }
}

