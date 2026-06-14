import type { CollectorResult } from "@/lib/types";
import { failedResult, fetchJson, makeEvent, makeIndicator } from "@/lib/collectors/utils";

type DebtToPennyResponse = {
  data?: Array<{
    record_date: string;
    tot_pub_debt_out_amt: string;
  }>;
};

export async function collectTreasuryFiscalData(): Promise<CollectorResult> {
  const sourceId = "treasury_fiscal_data";

  try {
    const url = new URL("https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny");
    url.searchParams.set("sort", "-record_date");
    url.searchParams.set("page[size]", "8");

    const data = await fetchJson<DebtToPennyResponse>(url.toString());
    const rows = data.data ?? [];
    const latest = rows[0];

    if (!latest) {
      return { sourceId, ok: true, events: [], indicators: [] };
    }

    const debt = Number(latest.tot_pub_debt_out_amt);
    const trillion = debt / 1_000_000_000_000;

    return {
      sourceId,
      ok: true,
      events: [
        makeEvent({
          id: `treasury_debt_${latest.record_date}`,
          time: `${latest.record_date}T12:00:00Z`,
          title: "U.S. Treasury fiscal data update: total public debt snapshot",
          url: "https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/debt-to-the-penny",
          source_type: "official_api",
          related_layers: ["fiscal", "market", "currency"],
          related_nodes: ["U.S. public debt", "Treasury supply", "term premium"],
          description:
            "美国公共债务规模是财政层的基础变量。它本身不是短期择时信号，但会通过国债供给、利息支出和长期收益率影响市场层与美元信心。",
          direction: "mixed",
          strength: 3,
          horizon: "long",
          assets: ["TLT", "IEF", "QQQ", "SPY", "DXY"],
          confidence: 0.86
        })
      ],
      indicators: [
        makeIndicator({
          id: "treasury_total_public_debt",
          name: "美国公共债务",
          value: trillion.toFixed(2),
          unit: "T USD",
          change: "latest",
          direction: "flat",
          layer: "fiscal",
          url: "https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/debt-to-the-penny",
          source_type: "official_api",
          updated_at: `${latest.record_date}T12:00:00Z`,
          sparkline: rows
            .map((row) => Number(row.tot_pub_debt_out_amt) / 1_000_000_000_000)
            .filter((value) => Number.isFinite(value))
            .reverse(),
          note: "债务规模需要与 GDP、利息支出、期限结构和投资者需求一起解释。"
        })
      ]
    };
  } catch (error) {
    return failedResult(sourceId, error);
  }
}
