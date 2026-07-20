import { NextResponse } from "next/server";
import { ACTIVE_SEASON, standings } from "@/lib/season";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ season: ACTIVE_SEASON, table: standings() });
}
