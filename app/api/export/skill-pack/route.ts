import { NextRequest, NextResponse } from "next/server";
import { buildSkillPack, buildTextSkillPack, type ExportPromptLanguage } from "@/lib/export/skill-pack";
import { getEventsForExport, getGraphForExport, getIndicatorsForExport, registerExport } from "@/lib/db/repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const days = Number(request.nextUrl.searchParams.get("days") ?? "14");
  const safeDays = Number.isFinite(days) ? Math.min(Math.max(days, 1), 90) : 14;
  const format = request.nextUrl.searchParams.get("format") === "txt" ? "txt" : "zip";
  const promptLanguage: ExportPromptLanguage = request.nextUrl.searchParams.get("prompt") === "en" ? "en" : "zh";

  const [events, indicators, graph] = await Promise.all([
    getEventsForExport(safeDays),
    getIndicatorsForExport(),
    getGraphForExport()
  ]);

  if (format === "txt") {
    const pack = await buildTextSkillPack({ events, indicators, graph, days: safeDays, promptLanguage });
    await registerExport(pack.manifest);

    return new NextResponse(pack.text, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "content-disposition": `attachment; filename="${pack.manifest.fileName}"`,
        "cache-control": "no-store"
      }
    });
  }

  const pack = await buildSkillPack({ events, indicators, graph, days: safeDays, promptLanguage });
  await registerExport(pack.manifest);

  return new NextResponse(new Uint8Array(pack.buffer), {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="${pack.manifest.fileName}"`,
      "cache-control": "no-store"
    }
  });
}
