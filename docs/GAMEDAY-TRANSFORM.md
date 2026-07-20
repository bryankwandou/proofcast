# ProofCast — Gameday Transformation (14 Matchdays)

The plan to take ProofCast from "solid indie build" to a Silicon-Valley-grade **Agentic Forecast Arena** that wins the TxODDS World Cup track and is ready to scale into a real startup.

**The theme, fixed and non-negotiable:** forecasting agents seal picks before kickoff, bond USDC behind an accuracy floor, and climb a proof-graded season table settled by TxLINE Merkle proofs on Solana. Everything below serves that. Match-day energy is welcome. Casino mechanics are not — they lose this track and this doc will refuse them every time.

**How to read this:** each matchday has a goal and a checklist. We execute one matchday at a time and check items off as they land. This is ~180 concrete tasks — real work, not padding. Progress mirrors into the session todo list.

Legend: `[ ]` todo · `[~]` in progress · `[x]` done

---

## Matchday 1 — Foundation & Brand Tokens
Goal: the new brand is physically true in code, not just in `brand.md`.

- [x] Lock the Seal-Check mark into `components/Logo.tsx`
- [x] Update favicon `app/icon.svg` to the Seal-Check
- [x] Write `brand.md` (system of record)
- [ ] Demote `--flood` lime to a single live-pulse token in `globals.css`; audit every current usage and swap non-pulse uses to `--accent`
- [ ] Add `--bg-raise-2` token and a documented three-tier token comment block
- [ ] Add the seal-stamp keyframes (`seal-draw`, `ring-notch`) with `prefers-reduced-motion` guard
- [ ] Build `components/motion.tsx` primitives: `<Reveal>`, `<Stagger>`, `<CountUp>`, `<Stamp>` (framer-motion, spring presets from `brand.md`)
- [ ] Standardise the mono-numeral rule: a `<Num>` component that enforces `tabular-nums` + JetBrains
- [ ] Verify `npm run build` is clean after token changes
- [ ] Screenshot before/after the palette demotion for the design log

## Matchday 2 — The Agentic Reframe (data model)
Goal: analysts become **agents** and a **season** exists in the data layer.

- [ ] Extend the pick/analyst model in `lib/store.ts` + `lib/db.ts`: `agentType` (`human` | `autonomous`), `seasonId`, `division`, `form[]`
- [ ] Add a `Season` concept: id, name (e.g. "World Cup 2026 — Group Stage"), fixtures window, standings snapshot
- [ ] Seed 6–8 credible demo agents with distinct identities, crests, and form guides
- [ ] Define promotion/relegation rule by verified accuracy (deterministic, documented)
- [ ] Standings calculator in `lib/protocol.ts`: points from proof-graded results only
- [ ] API: `GET /api/season` and `GET /api/season/standings`
- [ ] Backfill existing real devnet picks into a season so the real ledger leads
- [ ] Unit-check the standings math with a fixture-based test script in `scripts/`

## Matchday 3 — The Broadcast Hero
Goal: a landing hero that feels like a match-day title sequence and is fully interactive.

- [ ] Rebuild `Hero` in `components/landing.tsx`: asymmetric — claim left, live proof-receipt artifact right
- [ ] Live "sealed pick receipt" card that types out a hash and stamps the seal on scroll-in
- [ ] Animated floodlight sweep + subtle parallax pitch backdrop (respect reduced-motion)
- [ ] Real-time fixture chip pulled from the live TxLINE feed in the hero
- [ ] Primary CTA "Seal a pick", secondary "Verify on-chain" — clear weight hierarchy
- [ ] 3D tilt on the receipt artifact (pointer-driven, spring-damped, disabled on touch)
- [ ] Headline copy that names the real thing (no vague aspiration)
- [ ] Mobile: hero collapses to stacked, receipt becomes a horizontal scroll strip
- [ ] Lighthouse pass: hero interactive < 2.5s, no CLS from the animation

## Matchday 4 — Landing Body
Goal: the rest of the landing tells the whole story in one scroll.

- [ ] Live ticker of recently sealed picks (marquee, pausable, real data)
- [ ] "How it works" as a 3-beat broadcast sequence: Seal → Grade by proof → Bond the claim
- [ ] Scroll-driven diagram: TxLINE feed → settlement path → devnet receipt
- [ ] Season-table preview module (top 5 agents, promotion line highlighted)
- [ ] Stats band with `<CountUp>` on real numbers (picks sealed, roots verified)
- [ ] "Why this is different" section — verified expertise vs exposure, in plain language
- [ ] Closing CTA with the seal-stamp gesture
- [ ] Section-by-section entrance choreography via `page-load-animations` recipes
- [ ] Cross-check every landing string against the anti-AI copy rules

## Matchday 5 — Season / Standings Page
Goal: the "league" — the game layer that stays 100% settlement-native.

- [ ] `/season` route: full standings table, divisions, promotion/relegation lines
- [ ] Form guide per agent (last-5 as proof-graded W/L/void chips)
- [ ] Sort/filter (accuracy, ROI, bond size, division) with cross-fade transitions
- [ ] Matchweek selector that re-queries the feed and re-animates rows
- [ ] Live "on the bubble" highlight for agents near a promotion/relegation line
- [ ] Empty/loading/error states designed, not default
- [ ] Deep-link to any agent from the table

## Matchday 6 — Agent Profile Pages
Goal: the shareable artifact an agent puts in its bio.

- [ ] Rebuild `/analysts/[id]` as `/agents/[id]` (redirect old path)
- [ ] Hero: crest, verified accuracy, ROI, bond health bar, division badge
- [ ] Proof-graded history timeline with on-chain receipt links
- [ ] "Bond health" visual: floor line, current accuracy, distance to breach
- [ ] Autonomous-agent badge + (optional) strategy blurb for AI agents
- [ ] OpenGraph card generation per agent (the "prove it" share link)
- [ ] Copy-link + share affordances

## Matchday 7 — The Seal Flow
Goal: committing a pick feels like a broadcast moment and stays trustless.

- [ ] Redesign the seal (commit) flow UI end to end
- [ ] Client-side salt + hash visibly happens in the browser (show the commitment forming)
- [ ] The seal-stamp animation fires on successful devnet receipt
- [ ] Wallet-bound commitment signature surfaced clearly
- [ ] Odds-at-commit captured from the live feed and shown on the receipt
- [ ] Error and pending states for the on-chain write
- [ ] Micro-interactions: button feedback, hash copy, explorer link

## Matchday 8 — The Grade / VAR Review
Goal: grading is theatre backed by real proofs.

- [ ] Redesign reveal + grade flow
- [ ] "VAR review" pass animation while the proof is checked
- [ ] Show: hash match ✓, final score from feed, `eventStatRoot` on the receipt
- [ ] Clear proof-backed vs simulated labelling (never blur the two)
- [ ] Result reveal choreography (score bug drops in, seal turns green or red)
- [ ] Refund path visibly triggers when a floor breaks

## Matchday 9 — The /verify Console (trust showpiece)
Goal: the page that proves nobody is trusting the platform.

- [ ] Redesign `/verify` as the flagship trust surface
- [ ] Any judge can pick any fixture and re-run the identical on-chain check
- [ ] Show the program's unedited logs as the receipt
- [ ] Explain the `validate_stat` gate in plain language, inline
- [ ] Copyable transaction signature + explorer deep link
- [ ] "Run it yourself" one-click for the demo video

## Matchday 10 — Bond Vault Program (on-chain settlement engine)
Goal: the ceiling-raiser — the "Custom On-Chain Settlement Engine" the brief asks for.

- [ ] Scaffold an Anchor program `bond_vault` (devnet)
- [ ] `open_bond`: analyst locks USDC into a PDA escrow behind an accuracy floor
- [ ] `subscribe`: subscriber joins under an agent's bond for a season window
- [ ] `settle`: keeper submits the fixture proof; program CPIs into TxLINE `validate_stat`
- [ ] Proof-verified accuracy vs floor decides release vs refund — on-chain, deterministic
- [ ] `claim`: subscribers pull refunds from the bond when the floor breaks
- [ ] Anchor tests covering the happy path and the breach path
- [ ] Deploy to devnet; record program id + IDL in the repo

## Matchday 11 — Bond Vault Integration
Goal: the app drives the real program.

- [ ] `lib/onchain.ts`: client for `bond_vault` (open, subscribe, settle, claim)
- [ ] Wire the seal/subscribe UI to real escrow transactions
- [ ] Keeper script in `scripts/` that settles a fixture via CPI
- [ ] Bond-health UI reads the on-chain PDA state, not a mock
- [ ] Auto-refund demonstrated end to end on devnet with receipts
- [ ] Fallback demo mode preserved (labelled) for post-tournament judging

## Matchday 12 — Copy Rewrite Pass
Goal: every word reads human-natural, 0 emoji, low AI-detection.

- [ ] Inventory every user-facing string across all pages
- [ ] Rewrite landing, how-it-works, season, agent, seal, grade, verify copy
- [ ] Kill all hedging and aspiration-slop; name real mechanisms
- [ ] Vary sentence rhythm; add specific football + Solana detail a person would write
- [ ] Pass a plagiarism/AI-detection self-check; target under 5%
- [ ] README, SUBMISSION, and in-app copy aligned to one voice

## Matchday 13 — Pitch & Media
Goal: submission materials at demo-day quality, nothing blurry.

- [ ] Pitch deck (Dark Premium direction) — crisp, one idea per slide, real numbers
- [ ] Brief technical documentation: core idea, highlights, TxLINE endpoints used
- [ ] TxLINE API feedback write-up for the submission form
- [ ] Demo video script locked to the 5-minute structure
- [ ] Record the demo following the solana.new / official Solana demo standard
- [ ] Export at full resolution; verify no compression blur on text
- [ ] Thumbnail + OpenGraph images

## Matchday 14 — Ship
Goal: submit with everything working and verified.

- [ ] Full `/verify` skill run — drive every flow end to end on devnet
- [ ] Production deploy (Vercel) with live TxLINE feed
- [ ] Public repo cleaned, README current, license + env example correct
- [ ] Submission package assembled: deploy link, repo, video, tech doc, feedback
- [ ] Dry-run the demo top to bottom against the judging criteria
- [ ] Final pass on the three judging axes: core functionality, UX/use case, code quality
- [ ] Submit on Superteam Earn

---

### Running scoreboard
- Matchday 1: 3/10
- Matchdays 2–14: not started

_Progress is updated here as items land. The session todo list tracks the active matchday._
