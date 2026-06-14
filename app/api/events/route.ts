import { NextResponse } from "next/server";
import { getDashboardPayload } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = await getDashboardPayload();
  return NextResponse.json({ events: payload.events, mode: payload.mode, generatedAt: payload.generatedAt });
}

