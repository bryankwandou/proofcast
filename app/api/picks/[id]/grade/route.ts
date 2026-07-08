import { NextResponse } from "next/server";
import { pickById, updatePick } from "@/lib/store";
import { gradeSelection, verifyReveal } from "@/lib/protocol";
import { writeReceipt } from "@/lib/solana";
import { getMatchById } from "@/lib/txline";

// Reveal + grade a sealed pick. The final score comes from the TxLINE feed,
// the reveal is checked against the sealed hash, and both steps land as
// devnet receipts. A stat-validation proof root is attached when available.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pick = pickById(id);
  if (!pick) return NextResponse.json({ error: "pick not found" }, { status: 404 });
  if (pick.status !== "sealed") {
    return NextResponse.json({ error: `pick already ${pick.status}` }, { status: 409 });
  }

  if (!verifyReveal(pick)) {
    return NextResponse.json({ error: "reveal does not match sealed commitment" }, { status: 422 });
  }

  // Pull the outcome from TxLINE. If the fixture is unknown to the feed
  // (demo fixtures), fall back to a supplied score so the flow stays testable.
  let score: { home: number; away: number } | null = null;
  let proofRoot: string | null = null;
  try {
    const r = await getMatchById(pick.fixtureId);
    if (r && (r.match.status === "ft" || r.match.status === "live")) {
      score = r.match.score;
    }
  } catch {
    score = null;
  }
  if (!score) {
    const body = await _req.json().catch(() => null);
    if (body?.demoScore) score = body.demoScore;
  }
  if (!score) {
    return NextResponse.json({ error: "no final score available yet for this fixture" }, { status: 425 });
  }

  // Try to fetch a Merkle validation receipt for the goals stat.
  try {
    const base = process.env.TXLINE_BASE_URL ?? "https://txline-dev.txodds.com/api";
    const res = await fetch(
      `${base}/scores/stat-validation?fixtureId=${pick.fixtureId}&seq=1&statKey=1`,
      { headers: { "X-Api-Token": process.env.TXLINE_API_KEY ?? "" } }
    );
    if (res.ok) {
      const v = await res.json();
      proofRoot = v?.eventStatRoot ?? null;
    }
  } catch {
    proofRoot = null;
  }

  const grade = gradeSelection(pick.selection, score);

  const revealReceipt = await writeReceipt("reveal", {
    h: pick.commitHash,
    s: pick.salt,
    pick: `${pick.fixtureId}:${pick.selection}@${pick.oddsAtCommit}`,
  });
  const gradeReceipt = await writeReceipt("grade", {
    h: pick.commitHash,
    result: grade,
    score: `${score.home}-${score.away}`,
    ...(proofRoot ? { root: proofRoot } : {}),
  });

  updatePick(id, {
    status: grade,
    finalScore: score,
    revealTx: revealReceipt?.signature ?? null,
    gradeTx: gradeReceipt?.signature ?? null,
    proofRoot,
  });

  return NextResponse.json({ pick: pickById(id) });
}
