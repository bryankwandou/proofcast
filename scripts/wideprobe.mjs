// Cast a wide net: pull the full TxLINE fixture snapshot, prioritise fixtures
// that look in-play/finished (GameState set), and probe /api/verify for any
// that pass validate_stat against a persisted on-chain daily root.
import { readFileSync } from "node:fs";
const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const KEY = env.match(/TXLINE_API_KEY="?([^"\n]+)"?/)[1];
const BASE = "https://txline-dev.txodds.com/api";
const HOST = "https://txline-dev.txodds.com";

const jwt = (await (await fetch(`${HOST}/auth/guest/start`, { method: "POST" })).json()).token;
const snap = await (await fetch(`${BASE}/fixtures/snapshot`, {
  headers: { Authorization: `Bearer ${jwt}`, "X-Api-Token": KEY },
})).json();
console.log("total fixtures in feed:", snap.length);

// GameState present and > 0 usually means in-play/finished (has stats).
const candidates = snap
  .filter((f) => f.GameState !== undefined && f.GameState !== null)
  .map((f) => ({ id: String(f.FixtureId), label: `${f.Participant1}-${f.Participant2}`, gs: f.GameState }));
console.log("with GameState:", candidates.length);

const local = "http://localhost:3000";
let hit = null;
let tested = 0;
for (const f of candidates) {
  if (hit) break;
  for (const seq of [0, 1, 2]) {
    for (const sk of [1, 0]) {
      tested++;
      try {
        const d = await (await fetch(`${local}/api/verify?fixtureId=${f.id}&seq=${seq}&statKey=${sk}`)).json();
        if (d.valid || d.fixtureValid) {
          console.log(`>>> HIT ${f.id} ${f.label} gs=${f.gs} seq=${seq} sk=${sk} rootsPda=${d.rootsPda} valid=${d.valid} fixtureValid=${d.fixtureValid}`);
          hit = { fixtureId: f.id, label: f.label, seq, sk, rootsPda: d.rootsPda, valid: d.valid };
          break;
        }
      } catch {}
    }
    if (hit) break;
  }
}
console.log("tested checks:", tested);
console.log("BEST HIT:", JSON.stringify(hit));
