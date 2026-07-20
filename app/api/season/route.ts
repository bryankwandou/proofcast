import { NextResponse } from "next/server";
import { seasonSummary } from "@/lib/season";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(seasonSummary());
}
