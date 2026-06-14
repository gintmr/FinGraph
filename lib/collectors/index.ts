import type { CollectorResult } from "@/lib/types";
import { collectBls } from "@/lib/collectors/bls";
import { collectBraveSearch } from "@/lib/collectors/brave-search";
import { collectCftcCot } from "@/lib/collectors/cftc";
import { collectEia } from "@/lib/collectors/eia";
import { collectFederalReserve } from "@/lib/collectors/federal-reserve";
import { collectFred } from "@/lib/collectors/fred";
import { collectGdelt } from "@/lib/collectors/gdelt";
import { collectSecFilings } from "@/lib/collectors/sec";
import { collectStooqMarketData } from "@/lib/collectors/stooq";
import { collectTreasuryFiscalData } from "@/lib/collectors/treasury";
import { collectWorldBank } from "@/lib/collectors/world-bank";

const collectors = [
  collectStooqMarketData,
  collectBls,
  collectFederalReserve,
  collectTreasuryFiscalData,
  collectWorldBank,
  collectCftcCot,
  collectSecFilings,
  collectGdelt,
  collectFred,
  collectEia,
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
