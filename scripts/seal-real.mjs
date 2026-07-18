// Seals a handful of REAL picks against the running app so the public ledger
// shows genuine, non-demo entries — each with a real Solana devnet commit
// receipt. Run the dev server first (npm run dev), then: node scripts/seal-real.mjs
//
// These are real on-chain commitments, not seed data: they carry no `demo`
// flag and each returns an explorer link to a finalized devnet transaction.

import { webcrypto as crypto } from "node:crypto";

const BASE = process.env.BASE_URL || "http://localhost:3000";

const sha256 = async (s) => {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
};

async function main() {
  const res = await fetch(`${BASE}/api/fixtures`).then((r) => r.json());
  const fixtures = (res.matches || []).filter((m) => m.status === "pre").slice(0, 4);
  if (!fixtures.length) {
    console.error("No upcoming fixtures on the feed to seal against.");
    process.exit(1);
  }

  const sides = ["home", "away", "home", "draw"];
  let i = 0;
  for (const m of fixtures) {
    const sel = sides[i % sides.length];
    const odds = m.odds[sel] || 2.0;
    const analystId = "a-riva";
    const saltBytes = new Uint8Array(16);
    crypto.getRandomValues(saltBytes);
    const salt = [...saltBytes].map((b) => b.toString(16).padStart(2, "0")).join("");
    const payload = `${analystId}|${m.id}|${sel}|${odds.toFixed(2)}|${salt}`;
    const commitHash = await sha256(payload);

    const out = await fetch(`${BASE}/api/picks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        analystId,
        fixtureId: m.id,
        fixtureLabel: `${m.homeTeam.name} vs ${m.awayTeam.name}`,
        selection: sel,
        commitHash,
        oddsAtCommit: odds,
        kickoff: m.startTime,
        reasoning: "Live-sealed for the submission demo — real devnet receipt attached.",
      }),
    }).then((r) => r.json());

    console.log(
      `sealed ${m.homeTeam.name} vs ${m.awayTeam.name} (${sel}) →`,
      out.pick?.id || out.error,
      out.explorer ? `\n   receipt: ${out.explorer}` : "(receipt pending)"
    );
    i++;
  }
  console.log("\nDone. Open", `${BASE}/picks — the new entries carry no DEMO badge.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
