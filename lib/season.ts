import type { Analyst, Pick } from "./protocol";
import { accuracyOf } from "./protocol";
import { allAnalysts, allPicks, picksByAnalyst } from "./store";

// ── The season ────────────────────────────────────────────────────────────────
// A season is a competitive window. Forecasting agents earn a place in the table
// purely from proof-graded results — never from volume, never from anything that
// can be bought. The table has divisions with promotion and relegation lines, so
// the "game" is a real league standing, not a casino. Every number below is a
// pure function of graded picks.

export type Season = {
  id: string;
  name: string;
  window: string; // human label for the fixture window
  status: "live" | "upcoming" | "closed";
};

export const ACTIVE_SEASON: Season = {
  id: "wc26-group",
  name: "World Cup 2026 · Group Stage",
  window: "Matchday 1 → Matchday 3 · final 19 Jul 2026",
  status: "closed",
};

// League points from graded picks only: a correct call is worth more when the
// market rated it against you, so points scale (mildly) with the sealed odds.
// Wrong calls score nothing. Voids score a single point — you showed up, the
// match didn't resolve the market. Odds are capped so no one farms longshots.
const POINTS_CAP = 4;
export function pointsForPick(p: Pick): number {
  if (p.status === "won") return 3 + Math.round((Math.min(p.oddsAtCommit, POINTS_CAP) - 1) * 2);
  if (p.status === "void") return 1;
  return 0;
}

export type FormResult = "W" | "L" | "V";

export type StandingMovement = "promotion" | "relegation" | "safe";

export type StandingRow = {
  rank: number;
  agent: Analyst;
  division: 1 | 2;
  played: number;
  won: number;
  lost: number;
  points: number;
  accuracy: number;
  roi: number;
  form: FormResult[]; // last five, oldest → newest
  floorHealthy: boolean;
  movement: StandingMovement;
};

function formOf(picks: Pick[]): FormResult[] {
  return picks
    .filter((p) => p.status === "won" || p.status === "lost" || p.status === "void")
    .slice()
    .sort((a, b) => +new Date(a.kickoff) - +new Date(b.kickoff))
    .slice(-5)
    .map((p) => (p.status === "won" ? "W" : p.status === "void" ? "V" : "L"));
}

// Promotion: the top third of division 1 hold European places (kept for scale
// narrative — an agent proving out here graduates to the paid tier). Relegation:
// the bottom quarter of the table, or anyone who has broken their accuracy floor
// over a meaningful sample, drops. Deterministic, documented, no discretion.
export function standings(): StandingRow[] {
  const agents = allAnalysts();

  const scored = agents.map((agent) => {
    const picks = picksByAnalyst(agent.id);
    const stats = accuracyOf(picks);
    const points = picks.reduce((s, p) => s + pointsForPick(p), 0);
    const floorHealthy = stats.graded === 0 || stats.accuracy >= agent.accuracyFloor;
    return {
      agent,
      picks,
      played: stats.graded,
      won: stats.won,
      lost: stats.graded - stats.won,
      points,
      accuracy: stats.accuracy,
      roi: stats.roi,
      form: formOf(picks),
      floorHealthy,
    };
  });

  scored.sort(
    (a, b) =>
      b.points - a.points ||
      b.accuracy - a.accuracy ||
      b.roi - a.roi ||
      b.won - a.won,
  );

  const n = scored.length;
  const promoteLine = Math.max(1, Math.ceil(n / 3));
  const relegateLine = Math.max(1, Math.floor(n * 0.75));

  return scored.map((s, i) => {
    const rank = i + 1;
    let movement: StandingMovement = "safe";
    if (rank <= promoteLine) movement = "promotion";
    else if (rank > relegateLine || (!s.floorHealthy && s.played >= 5)) movement = "relegation";
    return {
      rank,
      agent: s.agent,
      division: 1 as const,
      played: s.played,
      won: s.won,
      lost: s.lost,
      points: s.points,
      accuracy: s.accuracy,
      roi: s.roi,
      form: s.form,
      floorHealthy: s.floorHealthy,
      movement,
    };
  });
}

// Bond Vault transactions executed on devnet, each linked from
// docs/BOND-VAULT.md: two full settlement legs (open_bond, subscribe, settle
// with the validate_stat CPI, claim) plus the earlier lifecycle receipts.
export const SETTLEMENT_TXS = 11;

// Season-wide totals for the landing stats band and the season header.
export function seasonSummary() {
  const picks = allPicks();
  const graded = picks.filter((p) => p.status === "won" || p.status === "lost");
  const proofBacked = picks.filter((p) => p.onChainCheck?.fixtureValid).length;
  const sealed = picks.filter((p) => !p.demo).length;
  return {
    season: ACTIVE_SEASON,
    agents: allAnalysts().length,
    picksTotal: picks.length,
    graded: graded.length,
    proofBacked,
    settlementTxs: SETTLEMENT_TXS,
    sealedReal: sealed,
  };
}
