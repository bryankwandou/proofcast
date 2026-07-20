// One-time schema setup + connection check for the ProofCast picks store.
// Run: node scripts/db-setup.mjs  (reads DATABASE_URL from .env.local)
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

// Load DATABASE_URL from .env.local without adding a dotenv dependency.
function envFromLocal(key) {
  if (process.env[key]) return process.env[key];
  try {
    const txt = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    const m = txt.match(new RegExp(`^${key}="?([^"\\n]+)"?`, "m"));
    return m ? m[1] : undefined;
  } catch {
    return undefined;
  }
}

const url = envFromLocal("DATABASE_URL");
if (!url) {
  console.error("DATABASE_URL not found in env or .env.local");
  process.exit(1);
}
const sql = neon(url);

const [{ now }] = await sql`SELECT now() as now`;
console.log("Connected to Neon. Server time:", now);

await sql`
  CREATE TABLE IF NOT EXISTS picks (
    id            TEXT PRIMARY KEY,
    analyst_id    TEXT NOT NULL,
    wallet        TEXT,
    wallet_sig    TEXT,
    fixture_id    TEXT NOT NULL,
    fixture_label TEXT NOT NULL,
    selection     TEXT,
    odds          NUMERIC NOT NULL DEFAULT 0,
    reasoning     TEXT NOT NULL DEFAULT '',
    committed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    kickoff       TIMESTAMPTZ NOT NULL,
    commit_hash   TEXT NOT NULL,
    commit_tx     TEXT,
    status        TEXT NOT NULL DEFAULT 'committed'
  )`;
console.log("Table 'picks' ready.");

await sql`CREATE INDEX IF NOT EXISTS picks_committed_at_idx ON picks (committed_at DESC)`;
console.log("Index ready.");

const [{ count }] = await sql`SELECT count(*)::int AS count FROM picks`;
console.log("Rows in picks:", count);
console.log("DB setup OK.");
