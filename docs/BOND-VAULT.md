# ProofCast Bond Vault — On-Chain Settlement Engine

A custom Anchor program that turns ProofCast's headline promise — *"subscribers are made whole from the bond, enforced by settlement logic, not support tickets"* — into on-chain fact. It is the "Custom On-Chain Settlement Engine" the TxODDS track invites: **funds only move when a Solana program verifies a Merkle proof against a daily root that already lives on-chain.**

- **Program:** `bond_vault`
- **Cluster:** Solana devnet
- **Program ID:** `6XGwWjKTTkWD6JcJQXGUeDexJfrY3Nv2gM4yjJs5jSNi`
- **Source:** [`onchain/programs/bond_vault/src/lib.rs`](../onchain/programs/bond_vault/src/lib.rs)
- **Framework:** Anchor (`anchor-lang` 1.x), native-SOL escrow MVP (USDC SPL is a drop-in on the same account layout)

## Why it exists

Every other shape on this track sells exposure to a match outcome — a bet. ProofCast sells verified expertise, and the Bond Vault is what makes that expertise *enforceable without trust*. An agent stakes collateral behind a published accuracy floor. Subscribers pay into the same escrow. When the deciding fixture resolves, the outcome is proven on-chain by TxLINE's own program — not asserted by ProofCast — and the escrow pays out accordingly.

## The settlement gate (the important part)

`settle` does not trust the keeper's word about a result. It forwards a **Cross-Program Invocation into TxLINE's `validate_stat`** instruction, using the exact proof material the app already fetches from `/api/scores/stat-validation`. If `validate_stat` rejects the proof, `settle` errors with `ProofRejected` and the bond stays `Open` — **no branch that moves money can run without a passing proof.** The proof is checked against the `daily_scores_merkle_roots` PDA that TxLINE maintains on Solana, so neither ProofCast nor the TxODDS API can forge a passing result.

## Instructions

| Instruction | Who | What it does |
|---|---|---|
| `open_bond(season_id, accuracy_floor_bps, collateral_lamports)` | Agent | Creates the bond PDA and locks collateral in escrow behind an accuracy floor. |
| `subscribe(fee_lamports)` | Subscriber | Deposits a fee into the bond escrow and records a subscription PDA. |
| `settle(settled_accuracy_bps, validate_ix_data)` | Keeper | CPIs into `validate_stat`; on success, marks the bond `Held` or `Breached` versus the floor. |
| `claim_refund()` | Subscriber | If `Breached`: withdraws fee + a pro-rata slice of collateral, straight from escrow. |
| `claim_earnings()` | Agent | If `Held`: withdraws the accumulated subscription fees. |

## Accounts (PDAs)

- **Bond** — seeds `["bond", agent, season_id]`. Holds `agent`, `season_id`, `accuracy_floor_bps`, `settled_accuracy_bps`, `collateral_lamports`, `fees_lamports`, `subscriber_count`, `status`.
- **Subscription** — seeds `["sub", bond, subscriber]`. Holds `bond`, `subscriber`, `fee_lamports`, `refunded`.

## Lifecycle

```
open_bond ──▶ subscribe (×N) ──▶ settle ──▶ validate_stat CPI
                                              │
                            proof holds floor │ proof breaks floor
                                   ▼          ▼
                            claim_earnings   claim_refund (×N)
                              (agent)          (subscribers)
```

## Determinism & safety

- All money math uses checked/saturating arithmetic; floors are basis points in `[0, 10000]`.
- Escrow debits are direct lamport moves out of a program-owned PDA that keeps its rent reserve, so the account survives.
- Status is a strict state machine: a bond settles exactly once, refunds are one-shot per subscription (`refunded` guard).
- Events (`BondOpened`, `Subscribed`, `BondSettled`, `Refunded`, `EarningsClaimed`) make every state change auditable from the chain.

## Live devnet receipts — both settlement legs executed

Run by [`scripts/bond-settle-live.mjs`](../scripts/bond-settle-live.mjs): the settle CPI carried the **real Merkle proof of the World Cup final (Spain vs Argentina, fixture 18257739)**, verified by TxLINE's `validate_stat` against the on-chain daily root before any funds moved.

**Floor HELD** (settled 95% ≥ floor 90% → agent claims the fees):

| Step | Transaction |
|---|---|
| `open_bond` (0.02 SOL collateral) | [5MucKJg9…uz6qz6](https://explorer.solana.com/tx/5MucKJg9mLoxn1SNm8mn2CBW66EjhX1WHCMcFPHWsDqh3vnncbvAoi4GGwLCywwBAooJ43ivc52qsqpSv5uz6qz6?cluster=devnet) |
| `subscribe` (0.01 SOL fee) | [2x795z2F…k5uRM](https://explorer.solana.com/tx/2x795z2Feb8fY8KJ7k7ojFgz8UuUqbMcV49tKD4YEaQm9NkVhqSGt5Wy8RciBNiQzVGBAKCx3LPWoNJrFJzk5uRM?cluster=devnet) |
| `settle` — CPI into `validate_stat`, proof passed | [5gmfUFov…EMCz9](https://explorer.solana.com/tx/5gmfUFovrtBHpLQkRUDA8tmwMqjWdJUR9bd5HoCpqK4PDsBkADCmAgad1yEvVtbptxFtLX6TKwNrAbca9jEEMCz9?cluster=devnet) |
| `claim_earnings` — agent receives 0.01 SOL | [5bX4xcHb…C17K](https://explorer.solana.com/tx/5bX4xcHbunop3oohVnVwRAgscXx5GLrHNHeG3oBCTnZsyVnU8eM1uxwxBj37cvJphDXoGf9nwiSkZkPp6oD7C17K?cluster=devnet) |

**Floor BREACHED** (settled 95% < floor 96% → subscriber refunded from collateral):

| Step | Transaction |
|---|---|
| `open_bond` (0.01 SOL collateral) | [5VSSZKE7…xXbU9](https://explorer.solana.com/tx/5VSSZKE7hzbx15yjvp4Bct7JFrtHfYcrbycagXvwk2hWqwDUNDBKQNZN9f18rsmHhoZ8f4qiBxnt4SV8R59xXbU9?cluster=devnet) |
| `subscribe` (0.005 SOL fee) | [23jC4iAc…UAE21](https://explorer.solana.com/tx/23jC4iAcQfp5sNzH8cnmEn14v6Y7Cg2voxkYZ3tBMCC53iiy8UtN3nHuCtC2eCQyatPUpFb9iwGnqwN8Rs8UAE21?cluster=devnet) |
| `settle` — CPI into `validate_stat`, proof passed | [5GS6zjhr…M7oe2](https://explorer.solana.com/tx/5GS6zjhrCQc4uvDsFxu9hbZTThyA9RoK1poT8gyNsSKTg3vhWctdtZPDjKManLfqVma28nuGawUnDpHEuWfM7oe2?cluster=devnet) |
| `claim_refund` — subscriber receives 0.015 SOL (fee + collateral share) | [4BeCGtCa…HQMXv](https://explorer.solana.com/tx/4BeCGtCaVU4H1xaWe2dtyPrgsXobrGjtQotyY1nBoyus5kCfo53ZGVdEcVN84eJFE5hZc23hiq2ywoJr8saHQMXv?cluster=devnet) |

An earlier settle attempt with an empty proof was rejected by the gate (`InstructionFallbackNotFound` from the TxLINE program at preflight) and no funds moved — the same instruction that pays out refuses to run without a passing proof.

Proof-material notes (learned the hard way, useful for anyone integrating): the `validate_stat` seed timestamp must be the proof batch's `updateStats.minTimestamp` (each proof binds to a 5-minute batch), and the full Merkle walk consumes ~211k compute units, so the transaction needs a `SetComputeUnitLimit` above the 200k default.

## Client surface

[`lib/bondvault.ts`](../lib/bondvault.ts) exports the program ID, PDA derivations, and status decoding shared by the app and the keeper. The IDL lives at [`lib/bond-vault-idl.json`](../lib/bond-vault-idl.json).
