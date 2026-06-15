import type { CollectorResult } from "@/lib/types";
import { collectAlphaVantage } from "@/lib/collectors/alpha-vantage";
import { collectBea } from "@/lib/collectors/bea";
import { collectBls } from "@/lib/collectors/bls";
import { collectBraveSearch } from "@/lib/collectors/brave-search";
import { collectCftcCot } from "@/lib/collectors/cftc";
import { collectEia } from "@/lib/collectors/eia";
import { collectFederalReserve } from "@/lib/collectors/federal-reserve";
import { collectFred } from "@/lib/collectors/fred";
import { collectGdacs } from "@/lib/collectors/gdacs";
import { collectGdelt } from "@/lib/collectors/gdelt";
import { collectSecFilings } from "@/lib/collectors/sec";
import { collectStooqMarketData } from "@/lib/collectors/stooq";
import { collectTwelveData } from "@/lib/collectors/twelve-data";
import { collectTreasuryFiscalData } from "@/lib/collectors/treasury";
import { collectWorldBank } from "@/lib/collectors/world-bank";

const collectors = [
  collectStooqMarketData,
  collectBls,
  collectFederalReserve,
  collectTreasuryFiscalData,
  collectBea,
  collectWorldBank,
  collectCftcCot,
  collectSecFilings,
  collectGdelt,
  collectGdacs,
  collectFred,
  collectEia,
  collectAlphaVantage,
  collectTwelveData,
  collectBraveSearch
];

export async function runCollectors(): Promise<CollectorResult[]> {
  const settled = await Promise.allSettled(collectors.map((collector) => collector()));
  return settled.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }

    return {
      sourceId: `collector_${index}`,
      ok: false,
      events: [],
      indicators: [],
      error: result.reason instanceof Error ? result.reason.message : String(result.reason)
    };
  });
}
