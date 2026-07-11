# ProofCast — Agentic Football Redesign

Branch: `redesign/agentic-football`. `main` stays frozen as the hackathon
submission build until after 19 July. Nothing here may drift from the core
thesis: **verified expertise, no wagering**. Every game mechanic rewards
proof-graded accuracy, never match exposure.

## Design thesis

ProofCast today reads like a fintech dashboard. The redesign makes it read
like a **broadcast control room run by football agents**: every analyst is an
agent on the touchline, every sealed pick is a play called before the whistle,
and the chain is the referee that never blinks. Dark stadium palette, floodlit
accents, live-data motion everywhere data actually moves — and stillness where
it doesn't, so the motion stays believable.

Visual pillars:
1. **Stadium night** — near-black pitch greens, chalk-line hairlines, floodlight
   glow on interactive elements.
2. **Broadcast chrome** — score-bug ticker, formation cards, replay-style
   timelines; UI furniture borrowed from match TV, not from SaaS.
3. **Agent identity** — each analyst gets a touchline persona: crest, kit
   colors, formation-style stat card, seasonal form guide.
4. **Proof as spectacle** — the on-chain check is the VAR review: dramatic,
   slow, and public. Logs render like the stadium screen.

## Game layer (all non-monetary; bonds/floors unchanged)

- **Seasons**: leaderboard resets per tournament window; historic seasons
  archived and provable forever.
- **Form guide**: last-5 sealed results as W/L/V chips, like league tables.
- **XP & ranks**: Scout → Analyst → Chief Scout → Director, earned only from
  proof-graded picks (volume × accuracy × odds honesty). No purchase path.
- **Badges**: cryptographic achievements ("Sealed 10 before kickoff",
  "Survived a floor test", "Perfect matchday") — each backed by receipts.
- **Streaks & matchdays**: daily sealing windows create appointment behavior.
- **Club mode (later)**: analysts form crews with shared floor; crew accuracy
  is the crew's league position.

Explicitly out of scope, forever: pick-to-earn tokens, paid boosts, any
mechanic where users profit from match outcomes.

## 14-day plan

Each day is a working session on this branch; ship = commit + preview deploy.

**Day 1 — Foundation**
- [ ] Design tokens v2: stadium palette (pitch blacks, chalk, floodlight lime,
      VAR amber, card red), display type scale, motion durations
- [ ] Pitch backdrop component: chalk-line grid + vignette floodlight
- [ ] Nav rebrand: score-bug style, LIVE pulse dot when feed has live matches

**Day 2 — Broadcast ticker**
- [ ] Persistent top score-bug: live fixtures, minute, score from TxLINE
- [ ] Sealed-pick ticker becomes a lower-third crawl
- [ ] Reduced-motion audit for both

**Day 3 — Agent identity core**
- [ ] Agent card: crest, kit color, rank chip, form guide (W/L/V last 5)
- [ ] Deterministic crest/kit generation from analyst wallet
- [ ] Analyst pages adopt the card as hero

**Day 4 — Leaderboard → League table**
- [ ] League-table layout: position, movement arrows, form, bond, floor health
- [ ] Season header with matchday counter
- [ ] Floor-breach rendered as relegation zone

**Day 5 — Seal flow as play-calling**
- [ ] Matches page: formation-card fixtures with odds as touchline boards
- [ ] Seal modal becomes "call the play": pitch diagram select, whistle CTA
- [ ] Commit confirmation: stadium-screen hash reveal animation

**Day 6 — VAR review (verify)**
- [ ] /verify restyled as VAR room: big screen, program logs typed on it
- [ ] PASS = green light sweep; pre-match = "check pending" board
- [ ] Pick page check panel inherits the same treatment

**Day 7 — Timeline as replay**
- [ ] Pick detail: seal→reveal→grade as broadcast replay strip with timestamps
- [ ] Receipt links styled as fourth-official boards
- [ ] Mid-point QA: lighthouse, contrast, mobile pass on all reworked pages

**Day 8 — XP & ranks**
- [ ] XP formula from graded picks only; rank thresholds; store fields
- [ ] Rank chips on cards, table, pick pages
- [ ] Rank-up moment (one-time animation, receipt-backed)

**Day 9 — Badges**
- [ ] Badge engine: rules evaluated over receipts; 8 launch badges
- [ ] Trophy cabinet on analyst pages
- [ ] Badge share card (og-image) per badge

**Day 10 — Streaks & matchdays**
- [ ] Matchday clock: countdown to next sealing window
- [ ] Streak tracking + display; grace rules documented honestly
- [ ] Empty states: off-matchday stadium at rest

**Day 11 — Sound & micro-motion (restrained)**
- [ ] Optional UI sounds: whistle on seal, crowd swell on PASS (default off)
- [ ] Micro-interactions: hover floodlights, tab transitions
- [ ] Full reduced-motion / silent audit

**Day 12 — Landing rebuild**
- [ ] Hero: night stadium, agentic copy, live score-bug embedded
- [ ] Section flow retold as matchday story (problem → whistle → proof → league)
- [ ] Video/OG assets refreshed to new brand

**Day 13 — Season archive & polish**
- [ ] Season archive page (provable history)
- [ ] Cross-page consistency sweep; kill every leftover fintech idiom
- [ ] Copy pass: zero AI-ish language, broadcast voice throughout

**Day 14 — Ship**
- [ ] Full regression: seal→reveal→grade→verify on the new UI
- [ ] Performance budget check; bundle audit
- [ ] Merge to main + production deploy + announcement assets

## Progress log

Days 1–14 landed on `redesign/agentic-football` across this build:
stadium-night tokens + pitch backdrop; broadcast score-bug and sealed-wire
ticker; deterministic agent crests/kits/form/rank; league table with a live
refund zone; play-calling seal flow; VAR review room at `/verify`; replay-style
pick timeline; a single `lib/gamefi.ts` engine (XP, five ranks, streaks) with a
rank-progress bar cross-page; a receipt-backed badge engine + trophy cabinet; a
matchday sealing-window clock + off-matchday empty states; an animated nav pill;
broadcast-voice landing copy; and a frozen-but-provable season archive at
`/seasons`. Every route returns 200 and the production build is green. `main`
stays frozen as the hackathon submission until after 19 July.

## Ground rules

- The submission build on `main` is untouchable until results/deadline pass.
- Every mechanic must be explainable in one sentence ending in "…and it's
  backed by a receipt."
- If a design choice makes ProofCast look like a sportsbook, it's wrong.
