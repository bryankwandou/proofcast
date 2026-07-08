# ProofCast

**Forecasts with collateral behind them.** Football analysts seal their predictions before kickoff, stake a USDC bond behind a public accuracy floor, and get graded by TxLINE Merkle proofs on Solana — never by the platform.

Built for the TxODDS World Cup hackathon, *Prediction Markets and Settlement* track on Superteam Earn.

## The problem

Paid football picks are a large market run on unverifiable claims. Sellers delete losing calls, backdate winners, and screenshot slips after results are known. Rating platforms grade their own sellers, so the referee works for one of the teams. Honest analysts get priced like frauds because buyers cannot tell the difference.

## How ProofCast removes the trust

1. **Seal.** A pick (analyst, fixture, selection, odds) is hashed with a private salt; the hash is anchored in a Solana devnet transaction before kickoff. Provably exists, provably unreadable, provably unedited.
2. **Grade by proof.** After the match, the pick is revealed, checked against its sealed hash, and scored against TxLINE score data. The settlement path pulls the Merkle stat-validation receipt (`GET /api/scores/stat-validation`) and records the `eventStatRoot` with the grade.
3. **Bond the claim.** Each analyst locks a USDC bond behind an accuracy floor. If proof-graded accuracy breaks the floor, subscribers are refunded from the bond — enforced by settlement logic, not support tickets.

No user ever wagers on a match. The funds at risk are analyst bonds and subscription fees — a service-level agreement, not a bet.

## TxLINE endpoints used

- `GET /api/fixtures/snapshot` — full World Cup fixture list
- `GET /api/scores/snapshot/{fixtureId}` — score updates per fixture
- `GET /api/odds/snapshot/{fixtureId}` — 1X2 price history (milliunit prices)
- `GET /api/scores/stat-validation` — Merkle proof material for settlement receipts
- Devnet validation program: `6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J` (validate_stat CPI target for the Anchor settlement engine on the roadmap)

## Stack

Next.js 16 (App Router) · Tailwind v4 · framer-motion · @solana/web3.js · TxLINE devnet feed.

## Run it

```bash
npm install
cp .env.example .env.local   # add your TxLINE key
npm run dev
```

Without a key the app falls back to demo fixtures, so every flow stays testable.

## Repository map

- `lib/protocol.ts` — commit-reveal, grading, and accuracy math
- `lib/txline.ts` — TxLINE client (fixtures, scores, odds, auth)
- `lib/solana.ts` — devnet receipt writer (commit / reveal / grade events)
- `app/api/*` — fixtures proxy, pick lifecycle endpoints
- `docs/ROADMAP.md` — the full 0 → MVP → startup checklist
- `docs/SUBMISSION.md` — hackathon submission notes and demo script
