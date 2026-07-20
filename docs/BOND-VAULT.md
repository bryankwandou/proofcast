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

## Client surface

[`lib/bondvault.ts`](../lib/bondvault.ts) exports the program ID, PDA derivations, and status decoding shared by the app and the keeper. The IDL lives at [`lib/bond-vault-idl.json`](../lib/bond-vault-idl.json).
