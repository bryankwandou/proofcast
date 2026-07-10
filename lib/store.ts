import { Analyst, Pick, accuracyOf, canonicalPayload, commitHashFor } from "./protocol";

// In-memory working set. Seed data models a cohort of analysts who have been
// committing picks through the group stage; user-created picks join the same
// pool for the life of the server process. A durable store replaces this
// post-hackathon (see docs/ROADMAP.md, phase 7).

const seededAnalysts: Analyst[] = [
  {
    id: "a-kondo",
    handle: "kondo",
    name: "M. Kondo",
    bio: "Ex-quant, models Asian handicap value on national sides. Publishes every pick sealed before kickoff.",
    bondUsdc: 5000,
    accuracyFloor: 0.55,
    subscribers: 412,
    monthlyPriceUsdc: 29,
    wallet: "Kondo3xJ9dQvWkH2mN8pRtY5cLbAe7fUgSiD4hT6oPqZ",
    joined: "2026-06-11",
  },
  {
    id: "a-riva",
    handle: "rivamarkets",
    name: "Riva",
    bio: "Covers South American qualifiers since 2019. Every claim carries a bond — if the floor breaks, subscribers are made whole.",
    bondUsdc: 12000,
    accuracyFloor: 0.6,
    subscribers: 1093,
    monthlyPriceUsdc: 49,
    wallet: "RivaQ8kY2wLp5xC7vB1nM4jH9eTgAs6fRdUoZi3cXmNb",
    joined: "2026-06-02",
  },
  {
    id: "a-tunde",
    handle: "tundexg",
    name: "Tunde A.",
    bio: "Expected-goals purist. Sealed picks only, graded by cryptographic proofs, never edited after the whistle.",
    bondUsdc: 2500,
    accuracyFloor: 0.5,
    subscribers: 178,
    monthlyPriceUsdc: 15,
    wallet: "TundeF5rW8qK1zX4cV7bN2mJ6hYgEs9dRaUpLo3iTxWc",
    joined: "2026-06-18",
  },
];

function seedPick(
  n: number,
  analystId: string,
  fixtureId: string,
  fixtureLabel: string,
  selection: NonNullable<Pick["selection"]>,
  odds: number,
  kickoff: string,
  status: Pick["status"],
  finalScore: Pick["finalScore"],
  reasoning: string
): Pick {
  const salt = `seed${n.toString().padStart(4, "0")}${analystId}`;
  const payload = canonicalPayload({ analystId, fixtureId, selection, oddsAtCommit: odds });
  return {
    id: `p-${n}`,
    analystId,
    fixtureId,
    fixtureLabel,
    selection,
    oddsAtCommit: odds,
    reasoning,
    committedAt: new Date(new Date(kickoff).getTime() - 6 * 3600e3).toISOString(),
    kickoff,
    salt,
    commitHash: commitHashFor(payload, salt),
    status,
    finalScore,
    commitTx: null,
    revealTx: null,
    gradeTx: null,
    // Seed history predates the receipt layer — no proof material is faked for it.
    proofRoot: null,
    demo: true,
  };
}

const seededPicks: Pick[] = [
  seedPick(1, "a-riva", "17952101", "Brazil vs Serbia", "home", 1.62, "2026-06-15T18:00:00Z", "won", { home: 2, away: 0 }, "Serbia concede early against high pressing sides; Brazil's front three thrive in opening fixtures."),
  seedPick(2, "a-riva", "17952104", "Argentina vs Denmark", "home", 1.85, "2026-06-16T15:00:00Z", "won", { home: 1, away: 0 }, "Denmark's back line struggles with movement between the lines."),
  seedPick(3, "a-riva", "17952110", "Uruguay vs Ghana", "draw", 3.4, "2026-06-17T12:00:00Z", "lost", { home: 2, away: 1 }, "Both sides tend to sit deep after scoring; low-event match profile."),
  seedPick(4, "a-riva", "17952119", "Colombia vs Poland", "home", 2.05, "2026-06-19T18:00:00Z", "won", { home: 3, away: 1 }, "Poland's midfield gets bypassed by vertical passing teams."),
  seedPick(5, "a-riva", "17952125", "Ecuador vs Italy", "away", 2.3, "2026-06-21T15:00:00Z", "won", { home: 0, away: 1 }, "Italy control tempo against sides that press only in bursts."),
  seedPick(6, "a-kondo", "17952102", "Japan vs Morocco", "away", 2.6, "2026-06-15T12:00:00Z", "lost", { home: 1, away: 1 }, "Morocco's counter profile suits the matchup, but rotation risk noted."),
  seedPick(7, "a-kondo", "17952107", "Korea Republic vs Mexico", "draw", 3.2, "2026-06-16T21:00:00Z", "won", { home: 1, away: 1 }, "Both managers prioritize group-stage point security in game one."),
  seedPick(8, "a-kondo", "17952113", "Australia vs Netherlands", "away", 1.55, "2026-06-18T09:00:00Z", "won", { home: 0, away: 2 }, "Netherlands dominate wide areas; Australia's fullbacks get pinned."),
  seedPick(9, "a-kondo", "17952121", "Iran vs Portugal", "away", 1.7, "2026-06-20T15:00:00Z", "won", { home: 1, away: 3 }, "Set-piece delta is decisive here."),
  seedPick(10, "a-tunde", "17952103", "Senegal vs Switzerland", "home", 2.9, "2026-06-15T15:00:00Z", "lost", { home: 0, away: 1 }, "xG models rate Senegal's chance creation above market consensus."),
  seedPick(11, "a-tunde", "17952112", "Nigeria vs Croatia", "draw", 3.1, "2026-06-18T12:00:00Z", "won", { home: 0, away: 0 }, "Croatia manage games; Nigeria rarely lose the midfield battle outright."),
  seedPick(12, "a-tunde", "17952118", "Egypt vs Belgium", "away", 1.5, "2026-06-19T15:00:00Z", "won", { home: 0, away: 2 }, "Belgium's second unit alone outrates Egypt's first eleven on xG."),
];

// Module-level mutable state; survives per-server-process.
const g = globalThis as unknown as { __proofcast?: { picks: Pick[] } };
if (!g.__proofcast) g.__proofcast = { picks: [...seededPicks] };

export function allAnalysts(): Analyst[] {
  return seededAnalysts;
}

export function analystById(id: string): Analyst | undefined {
  return seededAnalysts.find((a) => a.id === id || a.handle === id);
}

export function allPicks(): Pick[] {
  return g.__proofcast!.picks;
}

export function picksByAnalyst(analystId: string): Pick[] {
  return allPicks().filter((p) => p.analystId === analystId);
}

export function pickById(id: string): Pick | undefined {
  return allPicks().find((p) => p.id === id);
}

export function addPick(p: Pick) {
  g.__proofcast!.picks.unshift(p);
}

export function updatePick(id: string, patch: Partial<Pick>) {
  const p = pickById(id);
  if (p) Object.assign(p, patch);
}

export type LeaderboardRow = {
  analyst: Analyst;
  graded: number;
  won: number;
  accuracy: number;
  roi: number;
  floorHealthy: boolean;
};

export function leaderboard(): LeaderboardRow[] {
  return seededAnalysts
    .map((analyst) => {
      const stats = accuracyOf(picksByAnalyst(analyst.id));
      return {
        analyst,
        ...stats,
        floorHealthy: stats.graded === 0 || stats.accuracy >= analyst.accuracyFloor,
      };
    })
    .sort((a, b) => b.accuracy - a.accuracy || b.roi - a.roi);
}
