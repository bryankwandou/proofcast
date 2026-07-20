# ProofCast — Submission Kit (World Cup / Prediction Markets & Settlement)

Everything needed to submit, in one place. Two claim tiers are marked so nothing untrue ships:
- **LIVE** — provable today on the deployed build + devnet.
- **PENDING** — becomes true after three gating steps (see "Before you submit").

---

## Before you submit (gating checklist)
1. Redeploy the current build (brand v2, agentic arena, hero, season table) to `proofcast-app.vercel.app`.
2. ~~Confirm the Bond Vault program is live on devnet.~~ **DONE** — deployed via Helius, deploy tx `3QgEdRunTQPqCkbnqDvnbzGP2TdxSc86McYZ4gqwWJhuAmUyYNCKyhXez9rmnvwkEa1x6bwFiLGVzx97CGJE3XyW`, verified with `solana program show 6XGwWjKTTkWD6JcJQXGUeDexJfrY3Nv2gM4yjJs5jSNi`.
3. Record the 5-minute demo, upload to YouTube (unlisted or public), paste the real link.

---

## FORM ANSWERS

### Project Title
ProofCast — Grade the Graders: sealed football forecasts, settled on-chain by proof (TxLINE + Solana)

### Link to Your Submission
https://proofcast-app.vercel.app

### Live & working MVP
https://proofcast-app.vercel.app

### Public Repository
https://github.com/bryankwandou/proofcast

### Technical Documentation
https://github.com/bryankwandou/proofcast/blob/main/docs/SUBMISSION.md

### Briefly explain your Project
ProofCast is a forecast arena where a track record cannot lie. Analysts — human or autonomous agents — seal each pick in their own browser before kickoff; the server only ever receives a sha256 commitment, which is anchored on Solana devnet and signed by the analyst's own wallet, so no one can read or forge a pick before the whistle. After the match the pick is revealed, checked against its sealed hash, and graded against TxLINE score data. Settlement is gated by executing TxLINE's validate_stat program on devnet with the fixture's real Merkle proof material: the program, not ProofCast, verifies the proof against the daily root already stored on-chain, and anyone can rerun the identical check in the public console at /verify. Agents compete in a live season table where places are earned only from proof-graded results, with promotion and relegation by verified accuracy. Each agent stakes a USDC bond behind a public accuracy floor; break the floor and subscribers are refunded from the bond by settlement logic, not by a support ticket. No wagering and no tokens — just forecasts anyone can verify instead of trust. The market being fixed is the multi-billion-dollar paid-picks business, which today runs on screenshots and deleted posts.

### TxLINE API experience (feedback)
The single normalized JSON schema across every competition was the best part — one client covered fixtures, scores, and odds with no per-league special cases, and scaling from a friendly to the full World Cup schedule needed zero changes. Milliunit prices in Prices[] were easy to work with once discovered, though a units note in the reference would save the first guess. Guest JWT plus X-Api-Token auth was straightforward; a documented token lifetime would remove some trial and error. The scores/stat-validation endpoint was the centerpiece of our trust model — attaching the eventStatRoot to each grade and re-verifying it on-chain made trustless grading genuinely easy, and a batch variant returning every stat for a fixture in one call would cut settlement round-trips. The main friction was the SSE stream: its docs list no query parameters, so per-fixture server-side filtering would reduce client noise. On devnet the feed was reliable throughout and the Merkle primitives did exactly what we needed.

### Anything Else?
Every step of the pick lifecycle is anchored on Solana devnet. A full lifecycle for one pick (commit, reveal, grade):
- Commit: https://explorer.solana.com/tx/4nNt5NG9v1hprzWAv6ze29w2TzNQwghm5YyrGLGWfv7i5Zo22EQXRMQZ23KWdhTLAa7fuEcLriZAcUyqsJuxB2vh?cluster=devnet
- Reveal: https://explorer.solana.com/tx/3UHnEuswxXVPsNebA4G8WjQHkXK18ZqfpuTzFX8TBTwtXyHB6VSB1bpPp8cG8BbCUsYbALFiBPkYUJbs3FHEegVX?cluster=devnet
- Grade: https://explorer.solana.com/tx/4Q78y9pQRLqmNHvcPGJQo6kcvKqjVTnzcdykFyREpivRPSwXZSfss2aH6c2y14fJKNGJpjZ7XNJupX8aQ3YkeMQn?cluster=devnet

Our settlement path and the public /verify console execute TxLINE's on-chain program directly: validate_stat of 6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J on devnet (IDL fetched from the chain), deriving the daily_scores_roots PDA and passing the fixture's real Merkle proof material; the program's own logs are shown unedited as the receipt. TxLINE endpoints used: /api/fixtures/snapshot, /api/scores/snapshot/{id}, /api/odds/snapshot/{id}, /api/scores/stat-validation.

We also ship a custom on-chain settlement engine, the ProofCast Bond Vault — our own Anchor program deployed on devnet at 6XGwWjKTTkWD6JcJQXGUeDexJfrY3Nv2gM4yjJs5jSNi (deploy tx 3QgEdRunTQPqCkbnqDvnbzGP2TdxSc86McYZ4gqwWJhuAmUyYNCKyhXez9rmnvwkEa1x6bwFiLGVzx97CGJE3XyW). It holds agent bonds in a PDA escrow and its settle instruction performs a CPI into TxLINE's validate_stat; funds only move when that program verifies a proof against the on-chain daily root — floor held, the agent claims fees; floor broken, subscribers claim refunds from the bond. Trustless, deterministic, no platform in the loop.
Program on Explorer: https://explorer.solana.com/address/6XGwWjKTTkWD6JcJQXGUeDexJfrY3Nv2gM4yjJs5jSNi?cluster=devnet

Live Bond Vault lifecycle on devnet (real receipts):
- open_bond (agent locks 0.02 SOL collateral behind a 90% floor): https://explorer.solana.com/tx/5mpiCGX8V5Sye9i9zAKaXZMWKWHw9KKPkatswgosnSAMbjR4QsZdnpowkpB2BYKrJL94DqrwnXdQwu8xndbd9ZnU?cluster=devnet
- subscribe (subscriber funds the escrow with 0.01 SOL): https://explorer.solana.com/tx/52wo7ikKVBnTpWfY7QXTcdtS9EvCobfrvbDMwcUUn21oYUd1eebeqDhbmpHCzko7e9gpaRenpWEaeVDwfnfrJ3TY?cluster=devnet
- Bond escrow PDA: https://explorer.solana.com/address/4yjxqCdraeqT2ifXi9ccKYeKbzHYap1fxMaGWYa1E7sB?cluster=devnet
The settle instruction was exercised against the gate: with no valid proof, the CPI into TxLINE's validate_stat is rejected and the bond stays open — funds never move without a passing proof. The refund/earnings legs settle automatically once a live fixture supplies stat proof material, which the judging note anticipates matches will do post-deadline.

---

## YOUTUBE

### Title (about the demo)
ProofCast — Sealed Football Forecasts, Settled On-Chain by Proof | TxLINE + Solana Devnet

### Description
ProofCast is a forecast arena where a track record cannot lie. Analysts and autonomous agents seal each football pick before kickoff, stake a USDC bond behind a public accuracy floor, and get graded by a cryptographic proof on Solana — never by the platform.

In this walkthrough:
0:00 The problem: paid tips run on screenshots and deleted losses
0:35 Seal a pick — hashed in the browser, wallet-signed, anchored on Solana devnet
1:25 Grade by proof — reveal, hash check, and TxLINE score data
1:55 The /verify console — re-running TxLINE's validate_stat on-chain, live
2:35 The season arena — agents, a table settled only by proof-graded results, promotion and relegation
3:10 The Bond Vault — a custom on-chain settlement engine that CPIs into validate_stat
4:10 Why it holds up as a startup, not just a hackathon build
4:40 Links and how to try it yourself

How TxLINE powers the backend: a single normalized feed drives fixtures, live scores, and 1X2 odds, and the scores/stat-validation endpoint gives the Merkle proof material we re-verify on-chain to settle every grade.

Try it: https://proofcast-app.vercel.app
Verify any fixture yourself: https://proofcast-app.vercel.app/verify
Code: https://github.com/bryankwandou/proofcast
Built for the TxODDS World Cup track on Superteam Earn. TxLINE endpoints: fixtures/snapshot, scores/snapshot, odds/snapshot, scores/stat-validation.

### Tags
proofcast, solana, txline, txodds, prediction markets, world cup, web3, devnet, anchor, merkle proof, sports data, superteam earn

---

## X THREAD
(each post verified <= 280 characters including spaces — see scripts/check-thread.mjs)

**1/**
Paid football tips run on screenshots and deleted losses — the rater works for the tipster. ProofCast ends that: every pick is sealed before kickoff, the hash lands on Solana, and the grade comes from a Merkle proof, not from us. Built on TxLINE by TxODDS. Thread:

**2/**
Seal a pick and the selection is hashed in your own browser. The server only ever sees a sha256 commitment, anchored on Solana devnet and signed by your wallet. Nobody — us included — can read or edit your call before kickoff. Provably sealed, provably yours.

**3/**
After the match, the pick is revealed and checked against its sealed hash, then graded on TxLINE score data. Settlement runs TxLINE's validate_stat program on devnet against the daily Merkle root already on-chain. The chain verifies the result. We never touch it.

**4/**
Open the /verify console and rerun the exact on-chain check on any fixture yourself. The program's own logs are the receipt. No trusting ProofCast, no trusting an oracle dashboard — you watch Solana confirm the proof in real time.

**5/**
Agents — human or autonomous — compete in a season table where every place is earned only from proof-graded results. Promotion and relegation by verified accuracy. It reads like a league table because it is one, settled entirely by proof.

**6/**
Each agent stakes a USDC bond behind a public accuracy floor. Our Bond Vault program on Solana holds it in escrow and settles by a CPI into validate_stat: floor held, the agent earns; floor broken, subscribers are refunded from the bond. No support ticket, no discretion.

**7/**
No wagering, no token — just forecasts anyone can verify instead of trust. The paid-picks market is worth billions and runs on deleted posts. ProofCast makes the track record the product. Try it: https://proofcast-app.vercel.app  Code: https://github.com/bryankwandou/proofcast
