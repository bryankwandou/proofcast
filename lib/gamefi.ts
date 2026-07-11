import type { Pick } from "./protocol";
import { accuracyOf } from "./protocol";

// The game layer. Every reward here is a pure function of proof-graded picks —
// there is no purchasable XP, no boosts, no token. Demo/seed history earns
// nothing; only picks that were sealed and then graded against the feed count.
// If a mechanic can't end the sentence "…and it's backed by a receipt", it
// doesn't belong in this file.

export function gradedReal(picks: Pick[]): Pick[] {
  return picks.filter((p) => !p.demo && (p.status === "won" || p.status === "lost"));
}

// ── XP ────────────────────────────────────────────────────────────────────────
// Base 10 per graded pick (you showed up and sealed it), plus a win bonus that
// scales with the honest odds — calling a 3.0 upset right is worth more than a
// 1.2 favorite. Odds are capped so nobody farms XP with absurd longshots.
export function xpOf(picks: Pick[]): number {
  return gradedReal(picks).reduce(
    (xp, p) => xp + 10 + (p.status === "won" ? Math.round(15 * Math.min(p.oddsAtCommit, 4)) : 0),
    0
  );
}

// ── Ranks ─────────────────────────────────────────────────────────────────────
export type Rank = {
  name: string;
  minXp: number;
};

export const RANKS: Rank[] = [
  { name: "Scout", minXp: 0 },
  { name: "Analyst", minXp: 120 },
  { name: "Chief Scout", minXp: 400 },
  { name: "Director", minXp: 900 },
  { name: "Gaffer", minXp: 1800 },
];

export function rankProgress(xp: number): {
  current: Rank;
  next: Rank | null;
  pct: number; // 0..1 toward next
} {
  let current = RANKS[0];
  let next: Rank | null = null;
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].minXp) {
      current = RANKS[i];
      next = RANKS[i + 1] ?? null;
    }
  }
  const pct = next ? (xp - current.minXp) / (next.minXp - current.minXp) : 1;
  return { current, next, pct: Math.max(0, Math.min(1, pct)) };
}

// ── Streaks ─────────────────────────────────────────────────────────────────
// Longest and current run of correct graded picks, oldest → newest. Honest by
// construction: a wrong pick breaks it, no grace, no buy-back.
export function streaks(picks: Pick[]): { current: number; best: number } {
  const chron = gradedReal(picks)
    .slice()
    .sort((a, b) => +new Date(a.kickoff) - +new Date(b.kickoff));
  let current = 0;
  let best = 0;
  for (const p of chron) {
    if (p.status === "won") {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return { current, best };
}

// ── Badges ────────────────────────────────────────────────────────────────────
// Each badge is a rule evaluated over the pick record. Awarded means the
// receipts already prove it — badges are read, never granted.
export type Badge = {
  id: string;
  label: string;
  blurb: string;
  earned: boolean;
};

export function badgesFor(picks: Pick[]): Badge[] {
  const real = gradedReal(picks);
  const stats = accuracyOf(picks);
  const { best } = streaks(picks);
  const sealedBeforeKO = picks.filter(
    (p) => !p.demo && +new Date(p.committedAt) < +new Date(p.kickoff)
  ).length;
  const upsetWin = real.some((p) => p.status === "won" && p.oddsAtCommit >= 3);
  const survivedFloor = stats.graded >= 5 && stats.accuracy >= 0.6;
  const perfectFive =
    real.length >= 5 && real.slice(-5).every((p) => p.status === "won");
  const onChainProven = picks.some((p) => p.onChainCheck?.fixtureValid);

  const defs: Omit<Badge, "earned">[] = [
    { id: "first-seal", label: "First whistle", blurb: "Sealed a pick before kickoff." },
    { id: "ten-sealed", label: "Regular starter", blurb: "Sealed ten picks before kickoff." },
    { id: "streak-3", label: "On a run", blurb: "Three graded picks correct in a row." },
    { id: "streak-5", label: "Unplayable", blurb: "Five graded picks correct in a row." },
    { id: "upset", label: "Giant-killer", blurb: "Won a pick at 3.00+ odds." },
    { id: "floor", label: "Floor held", blurb: "Stayed above the accuracy floor over 5+ picks." },
    { id: "perfect-5", label: "Clean sheet week", blurb: "Last five graded picks all correct." },
    { id: "on-chain", label: "VAR-approved", blurb: "A grade passed the on-chain fixture check." },
  ];

  const earned: Record<string, boolean> = {
    "first-seal": sealedBeforeKO >= 1,
    "ten-sealed": sealedBeforeKO >= 10,
    "streak-3": best >= 3,
    "streak-5": best >= 5,
    upset: upsetWin,
    floor: survivedFloor,
    "perfect-5": perfectFive,
    "on-chain": onChainProven,
  };

  return defs.map((d) => ({ ...d, earned: earned[d.id] ?? false }));
}
