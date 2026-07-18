import { neon } from "@neondatabase/serverless";
import type { Pick } from "./protocol";

// Persistence for real, user-sealed picks. Seed/demo history stays in-memory
// (lib/store.ts); anything a real wallet seals is written here so it survives
// serverless restarts and shows up for every visitor — not just the one who
// sealed it. When DATABASE_URL is absent the whole layer no-ops gracefully.

function client() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export async function insertPick(p: Pick): Promise<void> {
  const sql = client();
  if (!sql) return;
  try {
    await sql`
      INSERT INTO picks (id, analyst_id, wallet, wallet_sig, fixture_id, fixture_label,
                         selection, odds, reasoning, kickoff, commit_hash, commit_tx, status)
      VALUES (${p.id}, ${p.analystId}, ${p.wallet ?? null}, ${p.walletSig ?? null},
              ${p.fixtureId}, ${p.fixtureLabel}, ${p.selection ?? null}, ${p.oddsAtCommit},
              ${p.reasoning}, ${p.kickoff}, ${p.commitHash}, ${p.commitTx ?? null}, ${p.status})
      ON CONFLICT (id) DO NOTHING`;
  } catch (e) {
    // Persistence is best-effort — a DB hiccup must never break sealing.
    console.error("insertPick failed:", (e as Error).message);
  }
}

export async function listDbPicks(): Promise<Pick[]> {
  const sql = client();
  if (!sql) return [];
  try {
    const rows = await sql`
      SELECT id, analyst_id, wallet, wallet_sig, fixture_id, fixture_label, selection,
             odds, reasoning, committed_at, kickoff, commit_hash, commit_tx, status
      FROM picks ORDER BY committed_at DESC LIMIT 200`;
    return rows.map((r) => ({
      id: r.id as string,
      analystId: r.analyst_id as string,
      wallet: (r.wallet as string) ?? null,
      walletSig: (r.wallet_sig as string) ?? null,
      fixtureId: r.fixture_id as string,
      fixtureLabel: r.fixture_label as string,
      selection: (r.selection as Pick["selection"]) ?? null,
      oddsAtCommit: Number(r.odds),
      reasoning: (r.reasoning as string) ?? "",
      committedAt: new Date(r.committed_at as string).toISOString(),
      kickoff: new Date(r.kickoff as string).toISOString(),
      salt: "",
      commitHash: r.commit_hash as string,
      commitTx: (r.commit_tx as string) ?? null,
      status: r.status as Pick["status"],
      finalScore: null,
      demo: false,
    }));
  } catch (e) {
    console.error("listDbPicks failed:", (e as Error).message);
    return [];
  }
}
