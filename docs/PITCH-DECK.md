# ProofCast — Pitch Deck

Twelve slides. Each heading is a slide; the bullets are the talking points. Built to be read in three minutes or presented in seven.

---

## 1 · Title

**ProofCast**
Forecasts with collateral behind them.

The track record that cannot lie: sealed before kickoff, graded by Merkle proofs, backed by a bond that pays out on its own.

---

## 2 · The problem

Paid football picks are a multi-billion market that runs on screenshots.

- Sellers delete losing calls and backdate winners.
- Rating platforms grade their own sellers. The referee works for one of the teams.
- A buyer cannot tell a genuine 60% analyst from a confident liar, so honest analysts are priced like frauds.

The market is not short on predictions. It is short on proof.

---

## 3 · The insight

Everyone else on this track sells exposure to match outcomes: another bet, another market, another resolution UI.

We sell something different: **verified expertise**. A different asset, a cleaner legal story, and a business that outlives any single tournament. Nobody on ProofCast wagers on a match. The funds at risk are analyst bonds and subscription fees — a service-level agreement, not a bet.

---

## 4 · How it works

1. **Seal.** The pick is hashed with a private salt in the analyst's own browser. Only the hash reaches the server, anchored on Solana before kickoff. The platform cannot read a pick early even if it wanted to.
2. **Grade.** After the whistle, the pick is revealed, checked against its sealed hash, and scored against TxLINE score data. The grade carries a Merkle validation receipt.
3. **Enforce.** Each analyst stakes a bond behind a public accuracy floor. Break the floor and subscribers are refunded from the bond by a Solana program, not by a support team.

---

## 5 · The settlement engine is live

The Bond Vault is a custom Anchor program on devnet: `6XGwWjKTTkWD6JcJQXGUeDexJfrY3Nv2gM4yjJs5jSNi`

Its `settle` instruction performs a CPI into TxLINE's `validate_stat`. Funds move only when that program verifies a Merkle proof against a daily root already on-chain.

Both legs have executed for real, gated by the proof of the World Cup final:

- Floor held → agent claimed the fees.
- Floor breached → subscriber refunded from collateral, automatically.
- An unproven settle is rejected and nothing moves.

Every transaction is linked in `docs/BOND-VAULT.md`. Judges can click each one.

---

## 6 · Anyone can check us

The `/verify` console lets any visitor — subscriber, judge, rival — rerun the exact on-chain check ProofCast uses for settlement. The program's unedited logs are the receipt.

This is the difference between "trust our API" and "run the program yourself."

---

## 7 · Product today

- Live TxLINE World Cup feed: fixtures, scores, real 1X2 odds.
- Client-side sealing with wallet-signed commitments.
- Proof-graded leaderboard: accuracy, ROI, bond size, floor health.
- Analyst track-record pages — the artifact tipsters put in their channel bios.
- Season archive: the WC 2026 table is frozen and provable, forever.

---

## 8 · Why now

- TxLINE puts sports data roots on Solana. A neutral referee finally exists.
- The paid-picks market already pays for track records; it just cannot verify them.
- Regulatory pressure on gambling products makes a non-wagering wedge more valuable, not less.

---

## 9 · Business model

- Free: the verified record page. This is the wedge — every analyst wants one, and each one advertises the protocol.
- Paid: subscription rails between analysts and their subscribers, with the protocol taking a spread.
- The bond mechanic converts reputation into locked TVL that grows with supply.

---

## 10 · Market

- Tipster/paid-picks spend estimated in the billions annually across Telegram, X, and closed communities.
- Beachhead: football tipsters with existing audiences who gain pricing power from proof.
- Expansion: club leagues on the same feed schema, then a second sport, then any feed with on-chain roots.

---

## 11 · Roadmap

- USDC (SPL) escrow on the deployed account layout.
- Keeper bot on the score stream: settlement without a human in the loop.
- Program tests and a security pass on the vault paths.
- Ten design-partner tipsters with published, bonded records.

---

## 12 · The ask

We built the referee. The World Cup was the proving ground; the record it froze is permanent.

ProofCast is the credit rating agency for sports forecasting — and the settlement engine that makes the rating enforceable is already running.

Repo: github.com/bryankwandou/proofcast · Live: proofcast-app.vercel.app
