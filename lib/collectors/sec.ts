import type { CollectorResult, FinGraphEvent } from "@/lib/types";
import { failedResult, fetchJson, makeEvent } from "@/lib/collectors/utils";

type SecSubmission = {
  filings?: {
    recent?: {
      accessionNumber?: string[];
      filingDate?: string[];
      form?: string[];
      primaryDocument?: string[];
    };
  };
};

const COMPANIES = [
  { ticker: "NVDA", cik: "0001045810", name: "NVIDIA" },
  { ticker: "MSFT", cik: "0000789019", name: "Microsoft" },
  { ticker: "AAPL", cik: "0000320193", name: "Apple" },
  { ticker: "GOOGL", cik: "0001652044", name: "Alphabet" },
  { ticker: "AMZN", cik: "0001018724", name: "Amazon" },
  { ticker: "META", cik: "0001326801", name: "Meta" }
];

export async function collectSecFilings(): Promise<CollectorResult> {
  const sourceId = "sec_edgar";
  const userAgent = process.env.SEC_USER_AGENT ?? "FinGraph/0.1 contact@example.com";

  try {
    const events: FinGraphEvent[] = [];

    for (const company of COMPANIES) {
      const data = await fetchJson<SecSubmission>(
        `https://data.sec.gov/submissions/CIK${company.cik}.json`,
        { headers: { "user-agent": userAgent } }
      );

      const recent = data.filings?.recent;
      const forms = recent?.form ?? [];
      const index = forms.findIndex((form) => ["10-K", "10-Q", "8-K"].includes(form));
      if (index < 0) {
        continue;
      }

      const accession = recent?.accessionNumber?.[index];
      const filingDate = recent?.filingDate?.[index];
      const form = recent?.form?.[index] ?? "filing";
      const primaryDocument = recent?.primaryDocument?.[index] ?? "";

      if (!accession || !filingDate) {
        continue;
      }

      const accessionNoDash = accession.replaceAll("-", "");
      const url = `https://www.sec.gov/Archives/edgar/data/${Number(company.cik)}/${accessionNoDash}/${primaryDocument}`;

      events.push(
        makeEvent({
          id: `sec_${company.ticker}_${form}_${filingDate}_${accessionNoDash}`,
          time: `${filingDate}T12:00:00Z`,
          title: `${company.name} filed ${form} with SEC EDGAR`,
          url,
          source_type: "company_filing",
          related_layers: ["corporate", "industry", "market"],
          related_nodes: ["earnings quality", "free cash flow", "AI capex", "index concentration"],
          description:
            `${company.name} 的 ${form} 是企业层的权威证据。应从收入、利润率、现金流、资本开支、风险因素和管理层讨论中判断科技股盈利是否支撑估值。`,
          direction: "neutral",
          strength: form === "8-K" ? 2 : 4,
          horizon: form === "8-K" ? "short" : "medium",
          assets: [company.ticker, "QQQ", "NASDAQ"],
          confidence: 0.86
        })
      );
    }

    return { sourceId, ok: true, events, indicators: [] };
  } catch (error) {
    return failedResult(sourceId, error);
  }
}

