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
    const home = Number(body.demoScore.home);
    const away = Number(body.demoScore.away);
    if (!Number.isInteger(home) || !Number.isInteger(away) || home < 0 || away < 0 || home > 15 || away > 15) {
      return NextResponse.json(
        { error: "demoScore must be whole goals between 0 and 15" },
        { status: 422 }
      );
    }
    score = { home, away };
    simulated = true;
  }
  if (!score) {
    return NextResponse.json(
      { error: "no verified final score on the feed yet for this fixture" },
      { status: 425 }
    );
  }

  // Settlement gate for feed-backed grades: execute TxLINE's validate_stat
  // program on devnet with the fixture's Merkle proof material. The grade is
  // only marked proof-backed if the program itself verifies the fixture proof
  // against the daily root stored on-chain.
  let proofRoot: string | null = null;
  let onChainCheck: { fixtureValid: boolean; valid: boolean; rootsPda: string | null } | null = null;
  if (!simulated) {
    try {
      const [{ verifyStatOnChain, fetchValidation }] = await Promise.all([import("@/lib/onchain")]);
      // Prove against the newest score update — it carries the fullest stat
      // tree. Early seqs are pre-match snapshots whose stat root is zero.
      let seq = 1;
      try {
        const { getScoresFor } = await import("@/lib/txline");
        const updates = await getScoresFor(pick.fixtureId);
        const last = updates[updates.length - 1] as { Seq?: number } | undefined;
        if (last?.Seq !== undefined) seq = last.Seq;
      } catch { /* keep seq 1 */ }
      const v = await fetchValidation(pick.fixtureId, seq, 1);
      proofRoot = v ? Buffer.from(v.eventStatRoot).toString("hex") : null;
      const check = await verifyStatOnChain(pick.fixtureId, seq, 1);
      onChainCheck = { fixtureValid: check.fixtureValid, valid: check.valid, rootsPda: check.rootsPda };
    } catch {
      onChainCheck = null;
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
    ...(proofRoot ? { root: proofRoot.slice(0, 16) } : {}),
    ...(onChainCheck ? { chk: onChainCheck.fixtureValid ? "fixture-pass" : "unproven" } : {}),
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
    onChainCheck,
  });

  return NextResponse.json({ pick: pickById(id) });
}
