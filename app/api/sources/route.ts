import { NextResponse } from "next/server";
import { sourceStatusSummary } from "@/lib/config/sources";
import { getSources } from "@/lib/db/repository";

export async function GET() {
  return NextResponse.json({ summary: sourceStatusSummary(), sources: await getSources() });
}
