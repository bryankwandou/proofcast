# ProofCast — 0 → MVP → Startup Pathway

The master execution checklist. Items marked `[x]` shipped in the hackathon build; everything else is sequenced for the weeks after. Phases 1–5 are the hackathon MVP; phases 6–12 are the startup track.

## Phase 1 — Idea and validation
- [x] Interrogate the track brief; list every example idea as off-limits
- [x] Map the tipster-fraud problem: deleted losses, backdated wins, self-graded platforms
- [x] Pass the crypto-necessity gate: neutral settlement is the product, not decoration
- [x] Score against alternates (survivor pools, settlement SDK) and force a winner
- [x] Write the shortlist report with bear cases and kill-criteria
- [ ] DM 10 active tipsters with a mock verified-record page; log replies
- [ ] Post the concept in the TxODDS Discord for sponsor reaction
- [ ] Interview 5 pick buyers on whether bonded refunds change willingness to pay

## Phase 2 — Protocol core
- [x] Canonical pick payload format (analyst | fixture | selection | odds)
- [x] Commit hash: sha256(payload | salt), salt private until reveal
- [x] Reveal verification: recompute and compare before any grading
- [x] Grading: selection vs final score outcome (1X2)
- [x] Accuracy + flat-stake ROI math over graded picks
- [x] Void path for reveals that fail verification
- [ ] Grading windows for extra time / penalties (regulation-time flag per market)
- [ ] Multi-market predicates: totals, both-teams-score, first scorer
- [ ] Rolling accuracy window spec for the bond floor (e.g. trailing 20 graded picks)
- [ ] Property tests over commit/reveal round-trips

## Phase 3 — TxLINE integration
- [x] Guest JWT auth flow with lazy refresh
- [x] Fixtures snapshot ingestion (`/fixtures/snapshot`)
- [x] Score updates per fixture (`/scores/snapshot/{id}`)
- [x] 1X2 odds parsing from milliunit prices (`/odds/snapshot/{id}`)
- [x] Poisson fallback pricing when the feed has no line
- [x] Stat-validation proof fetch wired into the grading path
- [x] Mock-data fallback so every flow works without a key
- [ ] SSE stream consumer (`/scores/stream`) to trigger settlement in real time
- [ ] Proof caching + replay mode for post-tournament demos
- [ ] Full Merkle path verification client-side (leaf → subtree → daily root)

## Phase 4 — Solana settlement layer
- [x] Devnet receipt writer: commit / reveal / grade as signed memo transactions
- [x] Stable protocol signer via keypair file, graceful degradation when unfunded
- [x] Explorer links on every receipt in the UI
- [x] Anchor `bond_vault` program: `open_bond` (bond PDA, accuracy floor, collateral escrow)
- [x] Anchor `bond_vault` program: `subscribe` (subscription PDA, fee into escrow — native-SOL MVP)
- [x] Anchor `bond_vault` program: `settle` with CPI into TxLINE `validate_stat` as the proof gate
- [x] Anchor `bond_vault` program: `claim_refund` / `claim_earnings` payout legs
- [x] Devnet deployment (`6XGwWjKTTkWD6JcJQXGUeDexJfrY3Nv2gM4yjJs5jSNi`) + live lifecycle script (`scripts/bond-lifecycle.mjs`)
- [ ] Anchor program: `commit_pick` storing the hash on-chain natively
- [ ] USDC (SPL) subscription payments on the same account layout
- [ ] Keeper bot: watch SSE stream, submit settle transactions automatically
- [ ] Program tests (bankrun)
- [ ] Security review pass on the vault and refund paths

## Phase 5 — Product (hackathon MVP)
- [x] Landing page: hero, sealed-pick ticker, mechanism explainer, stats band, leaderboard preview, CTA
- [x] Leaderboard with proof-graded accuracy, ROI, bond and floor status
- [x] Analyst profile: bond card, stats, full pick history
- [x] Live fixtures page fed by TxLINE with seal-a-pick modal
- [x] Pick detail: three-step receipt timeline (seal → reveal → grade)
- [x] Public picks ledger
- [x] Protocol explainer page
- [x] Brand system: mark, Newsreader/Inter/JetBrains Mono, dark editorial palette
- [x] Motion system: entrance choreography, stagger, count-up, marquee, modal springs
- [ ] Wallet connect for analysts (their own key signs the commit)
- [ ] Subscribe flow with USDC on devnet
- [ ] Mobile pass on every page
- [ ] Accessibility pass (focus states, reduced motion, contrast)

## Phase 6 — Submission
- [x] Public GitHub repository
- [x] Vercel production deployment
- [x] Technical documentation (endpoints used, architecture, feedback)
- [x] Demo video ≤5 min: problem → seal → grade → receipt → leaderboard
- [x] Superteam Earn submission form
- [x] TxLINE API feedback writeup

## Phase 7 — Durable infrastructure
- [ ] Postgres (Neon/Supabase) replacing the in-memory store
- [ ] Auth for analysts (wallet-based session)
- [ ] Background jobs for settlement (cron keeper or durable queue)
- [ ] Rate limiting + abuse controls on the pick API
- [ ] Structured logging + error tracking
- [ ] Staging environment with feed replay fixtures

## Phase 8 — Supply side (analysts)
- [ ] Verified-record page as a free shareable artifact (the wedge)
- [ ] Onboarding: import claimed history as "unverified", start sealed from day one
- [ ] Bond tiers and floor presets with clear payout math
- [ ] Analyst dashboard: pending picks, floor headroom, refund exposure
- [ ] Payout rails for subscription revenue net of refund reserve

## Phase 9 — Demand side (subscribers)
- [ ] Discovery: filter by league coverage, floor level, bond size, ROI
- [ ] Subscription checkout in USDC, cancellation, proration
- [ ] Refund claims page with on-chain proof of the floor breach
- [ ] Notifications when a followed analyst seals or gets graded
- [ ] Public API for third parties to read verified records

## Phase 10 — Legal and compliance
- [ ] Counsel review: subscription-with-SLA framing vs gambling statutes per market
- [ ] Terms of service + refund policy mirroring the on-chain logic
- [ ] Geo policy for jurisdictions where any pick-selling is restricted
- [ ] KYC decision for analyst payouts above thresholds

## Phase 11 — Growth
- [ ] Ten design-partner tipsters with published bonded records
- [ ] Case study: one analyst's fraud-proof tournament record
- [ ] Integrations: badge/widget for Telegram channels and X bios
- [ ] Expand past the World Cup: club leagues on the same feed schema
- [ ] Second sport once soccer predicates are stable

## Phase 12 — Fundraise readiness
- [ ] Metrics dashboard: sealed picks/week, bonded TVL, refund events, retention
- [ ] Narrative deck: "the credit rating agency for sports forecasting"
- [ ] Hackathon result + sponsor relationship as distribution proof
- [ ] Angel/pre-seed target list in Solana consumer + sports data
