import { NextResponse } from "next/server";
import { pickById, updatePick } from "@/lib/store";
import { gradeSelection, PickSelection, verifyReveal } from "@/lib/protocol";
import { writeReceipt } from "@/lib/solana";
import { getMatchById } from "@/lib/txline";

// Reveal + grade a sealed pick.
//
// Order of truth for the final score:
//   1. The TxLINE feed. If the feed has a result, it is the only accepted source.
//   2. A caller-supplied score, ONLY when the feed has nothing for the fixture.
//      The pick is then permanently marked `simulated` and its grade receipt
//      says so — a simulated grade can never masquerade as a proof-backed one.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pick = pickById(id);
  if (!pick) return NextResponse.json({ error: "pick not found" }, { status: 404 });
  if (pick.status !== "sealed") {
    return NextResponse.json({ error: `pick already ${pick.status}` }, { status: 409 });
  }

  const body = await req.json().catch(() => ({}));

  // Client-sealed picks carry no salt or selection server-side; the caller
  // must reveal both and they must reproduce the sealed hash exactly.
  const reveal = {
    salt: typeof body?.salt === "string" ? body.salt : undefined,
    selection: (["home", "draw", "away"] as const).includes(body?.selection)
      ? (body.selection as PickSelection)
      : undefined,
  };

  if (!verifyReveal(pick, reveal)) {
    return NextResponse.json(
      { error: "reveal does not match the sealed commitment" },
      { status: 422 }
    );
  }
  const selection = (reveal.selection ?? pick.selection) as PickSelection;
  const salt = reveal.salt || pick.salt;

  // Score resolution — feed first, simulation only when the feed is silent.
  let score: { home: number; away: number } | null = null;
  let simulated = false;
  try {
    const r = await getMatchById(pick.fixtureId);
    if (r && r.match.status === "ft") score = r.match.score;
  } catch {
    score = null;
  }
  if (!score && body?.demoScore) {
    score = {
      home: Math.max(0, Number(body.demoScore.home) || 0),
      away: Math.max(0, Number(body.demoScore.away) || 0),
    };
    simulated = true;
  }
  if (!score) {
    return NextResponse.json(
      { error: "no verified final score on the feed yet for this fixture" },
      { status: 425 }
    );
  }

  // Attach the Merkle validation receipt for feed-backed grades.
  let proofRoot: string | null = null;
  if (!simulated) {
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
  }

  const grade = gradeSelection(selection, score);

  const revealReceipt = await writeReceipt("reveal", {
    h: pick.commitHash,
    s: salt,
    pick: `${pick.fixtureId}:${selection}@${pick.oddsAtCommit}`,
  });
  const gradeReceipt = await writeReceipt("grade", {
    h: pick.commitHash,
    result: grade,
    score: `${score.home}-${score.away}`,
    source: simulated ? "simulated" : "txline",
    ...(proofRoot ? { root: proofRoot } : {}),
  });

  updatePick(id, {
    status: grade,
    selection,
    salt,
    finalScore: score,
    simulated,
    revealTx: revealReceipt?.signature ?? null,
    gradeTx: gradeReceipt?.signature ?? null,
    proofRoot,
  });

  return NextResponse.json({ pick: pickById(id) });
}
