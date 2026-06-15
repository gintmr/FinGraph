import { NextResponse } from "next/server";
import { currentDataMode, getIngestionStatus } from "@/lib/db/repository";
import { sourceStatusSummary } from "@/lib/config/sources";

export const dynamic = "force-dynamic";

export async function GET() {
  const ingestion = await getIngestionStatus();

  return NextResponse.json({
    ok: true,
    mode: currentDataMode(),
    supabaseConfigured: currentDataMode() === "supabase",
    liveDataReady: (ingestion.mode === "supabase" || ingestion.mode === "local_cache") && (ingestion.eventCount > 0 || ingestion.indicatorCount > 0),
    ingestion,
    sources: sourceStatusSummary(),
    time: new Date().toISOString()
  });
}
