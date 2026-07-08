import { NextResponse } from "next/server";
import { getLiveMatches, HAS_TXLINE_KEY, MOCK_MATCHES } from "@/lib/txline";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!HAS_TXLINE_KEY) {
      return NextResponse.json({ source: "mock", reason: "no key", matches: MOCK_MATCHES });
    }
    const matches = await getLiveMatches();
    return NextResponse.json({ source: "txline", matches });
  } catch (e) {
    return NextResponse.json({
      source: "mock",
      reason: e instanceof Error ? e.message : "unknown",
      matches: MOCK_MATCHES,
    });
  }
}
