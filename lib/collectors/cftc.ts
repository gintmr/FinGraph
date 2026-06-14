import type { CollectorResult, FinLayerId, MarketIndicator } from "@/lib/types";
import { failedResult, fetchJson, latestSparkline, makeIndicator } from "@/lib/collectors/utils";

type CftcCotRow = {
  report_date_as_yyyy_mm_dd: string;
  market_and_exchange_names: string;
  contract_market_name: string;
  lev_money_positions_long: string;
  lev_money_positions_short: string;
  change_in_lev_money_long?: string;
  change_in_lev_money_short?: string;
};

type CftcContractConfig = {
  id: string;
  name: string;
  marketName: string;
  layer: FinLayerId;
  assets: string[];
};

const sourceId = "cftc_cot";
const datasetUrl = "https://publicreporting.cftc.gov/resource/yw9f-hn96.json";
const docsUrl = "https://dev.socrata.com/foundry/publicreporting.cftc.gov/yw9f-hn96";

const contracts: CftcContractConfig[] = [
  {
    id: "cftc_cot_sp500_lev_net",
    name: "CFTC 杠杆资金净持仓：E-mini S&P 500",
    marketName: "E-MINI S&P 500 - CHICAGO MERCANTILE EXCHANGE",
    layer: "market",
    assets: ["SPY", "ES"]
  },
  {
    id: "cftc_cot_nasdaq_lev_net",
    name: "CFTC 杠杆资金净持仓：Nasdaq-100",
    marketName: "NASDAQ-100 Consolidated - CHICAGO MERCANTILE EXCHANGE",
    layer: "market",
    assets: ["QQQ", "NQ"]
  },
  {
    id: "cftc_cot_10y_lev_net",
    name: "CFTC 杠杆资金净持仓：10Y 美债期货",
    marketName: "UST 10Y NOTE - CHICAGO BOARD OF TRADE",
    layer: "market",
    assets: ["TLT", "ZN"]
  },
  {
    id: "cftc_cot_aud_lev_net",
    name: "CFTC 杠杆资金净持仓：澳元",
    marketName: "AUSTRALIAN DOLLAR - CHICAGO MERCANTILE EXCHANGE",
    layer: "currency",
    assets: ["AUD", "DXY"]
  }
];

function numberValue(value?: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function apiUrl(marketName: string) {
  const url = new URL(datasetUrl);
  url.searchParams.set(
    "$select",
    "report_date_as_yyyy_mm_dd,market_and_exchange_names,contract_market_name,lev_money_positions_long,lev_money_positions_short,change_in_lev_money_long,change_in_lev_money_short"
  );
  url.searchParams.set("$where", `market_and_exchange_names='${marketName.replace(/'/g, "''")}'`);
  url.searchParams.set("$order", "report_date_as_yyyy_mm_dd DESC");
  url.searchParams.set("$limit", "12");
  return url.toString();
}

function rowNet(row: CftcCotRow) {
  return numberValue(row.lev_money_positions_long) - numberValue(row.lev_money_positions_short);
}

function buildIndicator(config: CftcContractConfig, rows: CftcCotRow[]): MarketIndicator | null {
  const latest = rows[0];
  if (!latest) {
    return null;
  }

  const values = rows.map(rowNet).reverse();
  const latestNet = values.at(-1);
  const previousNet = values.at(-2);
  if (latestNet === undefined) {
    return null;
  }

  const delta = previousNet === undefined ? null : latestNet - previousNet;
  const direction = delta === null ? "flat" : delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  const long = numberValue(latest.lev_money_positions_long);
  const short = numberValue(latest.lev_money_positions_short);

  return makeIndicator({
    id: config.id,
    name: config.name,
    value: latestNet.toLocaleString("en-US", { maximumFractionDigits: 0 }),
    unit: "contracts",
    change: delta === null ? "latest" : `${delta > 0 ? "+" : ""}${delta.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
    direction,
    layer: config.layer,
    url: apiUrl(config.marketName),
    source_type: "public_database",
    updated_at: latest.report_date_as_yyyy_mm_dd,
    sparkline: latestSparkline(values),
    note: `CFTC TFF Combined 周度数据。杠杆资金 long ${long.toLocaleString("en-US")}、short ${short.toLocaleString("en-US")}；净值为 long-short。它是仓位结构，不是实时资金流。`
  });
}

export async function collectCftcCot(): Promise<CollectorResult> {
  try {
    const indicators = (
      await Promise.all(
        contracts.map(async (contract) => {
          const rows = await fetchJson<CftcCotRow[]>(apiUrl(contract.marketName));
          return buildIndicator(contract, rows);
        })
      )
    ).filter((indicator): indicator is MarketIndicator => indicator !== null);

    return {
      sourceId,
      ok: true,
      events: [],
      indicators
    };
  } catch (error) {
    return failedResult(sourceId, error);
  }
}

export const cftcCotDocsUrl = docsUrl;
