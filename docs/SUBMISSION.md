# Hackathon Submission — ProofCast

Track: **Prediction Markets and Settlement** (TxODDS World Cup, Superteam Earn)

## One paragraph

ProofCast is a marketplace for football forecasts where the track record cannot lie. Analysts seal picks before kickoff (only a sha256 commitment goes on-chain), stake a USDC bond behind a published accuracy floor, and get graded against TxLINE data with Merkle validation receipts. If an analyst's proof-graded accuracy breaks their floor, subscribers are refunded from the bond by settlement logic — the platform never touches a result. Nobody bets on matches; the market being fixed is the multi-billion paid-picks market, which currently runs on screenshots and deleted posts.

## Why this is different from the other 27 submissions

The brief's example ideas (auto-markets, resolution UIs, market viewers, prediction AMMs, parametric props) all sell exposure to match outcomes. ProofCast sells **verified expertise** — a different asset, a cleaner legal story, and a business that outlives the tournament. The settlement primitive is used where it is genuinely irreplaceable: as a referee that neither the analyst nor the platform can bribe.

## Core functionality shipped

- Live TxLINE World Cup feed: fixtures, scores, real 1X2 odds (milliunit parsing) with Poisson fallback pricing
- Commit-reveal pick lifecycle with devnet receipts for every step (memo transactions by a protocol signer)
- Settlement path that fetches `GET /api/scores/stat-validation` and stores the `eventStatRoot` with each grade
- Proof-graded leaderboard: accuracy, flat-stake ROI, bond size, floor health
- Analyst track-record pages — the shareable artifact tipsters put in their channel bios
- Demo settlement mode so judges can run the full seal → reveal → grade flow on any fixture even after the tournament ends

## TxLINE endpoints used

| Endpoint | Use |
| --- | --- |
| `/api/fixtures/snapshot` | tournament fixture list |
| `/api/scores/snapshot/{id}` | score updates, final results |
| `/api/odds/snapshot/{id}` | 1X2 prices captured at commit time |
| `/api/scores/stat-validation` | Merkle proof material attached to grades |
| Devnet program `6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J` | validate_stat CPI target for the Anchor settlement engine (phase 4 of docs/ROADMAP.md) |

## Demo video script (≤5 min)

1. **0:00–0:40 Problem.** Screenshots of tipster channels selling picks; explain deleted losses and self-graded platforms.
2. **0:40–1:30 Seal.** Open Matches (live TxLINE data), pick a fixture, seal a pick, show the sha256 commitment and the devnet receipt on Solana Explorer.
3. **1:30–2:30 Grade.** Open the pick, run reveal + grade; show the hash check, final score from the feed, the Merkle root on the receipt timeline.
4. **2:30–3:30 Trust market.** Leaderboard and an analyst page: proof-graded accuracy, USDC bond, accuracy floor, refund rule.
5. **3:30–4:30 Architecture.** One diagram: TxLINE feed → settlement path → devnet receipts; where the Anchor program with validate_stat CPI lands next.
6. **4:30–5:00 Startup case.** The paid-picks market size, the free verified-record wedge, expansion past the World Cup.

## Feedback on the TxLINE API (for the submission form)

- The single normalized JSON schema across competitions was the best part — one client covered fixtures, scores, and odds with no per-league cases.
- Milliunit prices in `Prices[]` were easy to work with once discovered, but the field would benefit from a units note in the reference.
- Guest JWT + `X-Api-Token` auth was straightforward; a documented token lifetime would remove some guesswork.
- `stat-validation` responses are excellent for receipts; a batch variant (all stats for a fixture at once) would cut settlement round-trips.
- SSE stream docs list no query parameters — per-fixture filtering server-side would reduce client noise significantly.
