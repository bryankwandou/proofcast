import { NextResponse } from "next/server";
import { verifyStatOnChain } from "@/lib/onchain";

export const dynamic = "force-dynamic";

// On-chain check gate: executes TxLINE's validate_stat instruction on devnet
// with real Merkle proof material. GET /api/verify?fixtureId=…&seq=0&statKey=1
export async function GET(req: Request) {
  const url = new URL(req.url);
  const fixtureId = url.searchParams.get("fixtureId");
  if (!fixtureId) {
    return NextResponse.json({ error: "fixtureId is required" }, { status: 400 });
  }
  const seqParam = url.searchParams.get("seq") ?? "latest";
  const statKey = Number(url.searchParams.get("statKey") ?? 1);

  // "latest" resolves to the newest score update, which carries the fullest
  // stat tree — the right target once a match is underway or finished.
  let seq = Number(seqParam);
  if (seqParam === "latest" || Number.isNaN(seq)) {
    seq = 0;
    try {
      const { getScoresFor } = await import("@/lib/txline");
      const updates = await getScoresFor(fixtureId);
      const last = updates[updates.length - 1] as { Seq?: number } | undefined;
      if (last?.Seq !== undefined) seq = last.Seq;
    } catch {
      seq = 0;
    }
  }

  const result = await verifyStatOnChain(fixtureId, seq, statKey);
  return NextResponse.json(result, { status: result.error && !result.valid ? 200 : 200 });
}
