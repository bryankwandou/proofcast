import { createHash, randomBytes } from "crypto";

// ── Pick model ────────────────────────────────────────────────────────────────
// A pick is sealed before kickoff: only sha256(payload + salt) goes on-chain.
// After the match, the payload + salt are revealed and the grade is derived
// from TxLINE score data, with the Merkle validation receipt attached.

export type PickSelection = "home" | "draw" | "away";

export type Pick = {
  id: string;
  analystId: string;
  fixtureId: string;
  fixtureLabel: string;      // "Argentina vs France"
  selection: PickSelection;
  oddsAtCommit: number;      // decimal odds captured at commit time
  reasoning: string;
  committedAt: string;       // ISO
  kickoff: string;           // ISO
  salt: string;              // hex, revealed post-match
  commitHash: string;        // sha256(canonical payload | salt)
  commitTx?: string | null;  // devnet signature of the commit receipt
  status: "sealed" | "revealed" | "won" | "lost" | "void";
  revealTx?: string | null;
  gradeTx?: string | null;
  proofRoot?: string | null; // eventStatRoot from TxLINE stat-validation
  finalScore?: { home: number; away: number } | null;
};

export type Analyst = {
  id: string;
  handle: string;
  name: string;
  bio: string;
  bondUsdc: number;          // collateral staked behind the accuracy floor
  accuracyFloor: number;     // e.g. 0.55 — below this, subscribers get refunds
  subscribers: number;
  monthlyPriceUsdc: number;
  wallet: string;
  joined: string;
};

export function canonicalPayload(p: {
  analystId: string; fixtureId: string; selection: PickSelection; oddsAtCommit: number;
}): string {
  return `${p.analystId}|${p.fixtureId}|${p.selection}|${p.oddsAtCommit.toFixed(2)}`;
}

export function commitHashFor(payload: string, salt: string): string {
  return createHash("sha256").update(`${payload}|${salt}`).digest("hex");
}

export function newSalt(): string {
  return randomBytes(16).toString("hex");
}

// Verify a revealed pick matches its sealed commitment.
export function verifyReveal(pick: Pick): boolean {
  const payload = canonicalPayload({
    analystId: pick.analystId,
    fixtureId: pick.fixtureId,
    selection: pick.selection,
    oddsAtCommit: pick.oddsAtCommit,
  });
  return commitHashFor(payload, pick.salt) === pick.commitHash;
}

// Grade a revealed pick against a final score.
export function gradeSelection(
  selection: PickSelection,
  score: { home: number; away: number }
): "won" | "lost" {
  const outcome: PickSelection =
    score.home > score.away ? "home" : score.home < score.away ? "away" : "draw";
  return outcome === selection ? "won" : "lost";
}

// Accuracy stats for an analyst over graded picks.
export function accuracyOf(picks: Pick[]): { graded: number; won: number; accuracy: number; roi: number } {
  const graded = picks.filter((p) => p.status === "won" || p.status === "lost");
  const won = graded.filter((p) => p.status === "won");
  // Flat-stake ROI: each pick risks 1 unit, winners return oddsAtCommit.
  const returned = won.reduce((s, p) => s + p.oddsAtCommit, 0);
  const roi = graded.length ? (returned - graded.length) / graded.length : 0;
  return {
    graded: graded.length,
    won: won.length,
    accuracy: graded.length ? won.length / graded.length : 0,
    roi,
  };
}
