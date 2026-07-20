import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
const url = readFileSync(new URL("../.env.local", import.meta.url), "utf8").match(/DATABASE_URL="?([^"\n]+)"?/)[1];
const sql = neon(url);
const rows = await sql`SELECT DISTINCT fixture_id, fixture_label, status FROM picks`;
console.log("distinct fixtures in DB:", rows.length);
rows.forEach((r) => console.log(" ", r.fixture_id, "|", r.fixture_label, "|", r.status));
const base = "http://localhost:3000";
let hit = null;
for (const r of rows) {
  for (const seq of [0, 1, 2, 3, 4, 5]) {
    for (const sk of [1, 0, 2, 3]) {
      try {
        const d = await (await fetch(`${base}/api/verify?fixtureId=${r.fixture_id}&seq=${seq}&statKey=${sk}`)).json();
        if (d.valid || d.fixtureValid) {
          console.log(`>>> HIT ${r.fixture_id} seq=${seq} sk=${sk} rootsPda=${d.rootsPda} valid=${d.valid} fixtureValid=${d.fixtureValid}`);
          if (!hit) hit = { fixtureId: r.fixture_id, seq, sk, rootsPda: d.rootsPda, valid: d.valid };
        }
      } catch {}
    }
  }
}
console.log("BEST HIT:", JSON.stringify(hit));
