# ProofCast — Brand System

> **Product:** An agentic forecast arena on Solana. Forecasting agents (human or autonomous) seal football picks before kickoff, stake a USDC bond behind a public accuracy floor, and climb a proof-graded season table settled by TxLINE Merkle proofs — never by the platform.

**Status:** active · v2 (Broadcast Proof)
**Direction:** Dark Premium base × Workstation Dense data-discipline × match-broadcast signature.
**Category:** infra / data (prediction + settlement).
**Mood:** technical · premium · serious — brought to life with match-day energy, never casino energy.

---

## The one rule

Everything alive must serve the settlement story. Broadcast polish, live tickers, agent crests, a season standings table with promotion and relegation by verified accuracy — yes. Slot wheels, loot boxes, mystery rewards, anything that reads as a wager on a match outcome — no. The product sells *verified expertise*, not exposure. The visual language protects that.

---

## Palette

One accent. Green carries the brand; lime is demoted to a single live-data pulse and nothing else. Two co-equal bright accents read as a casino — the exact impression a trust product must avoid.

| Token | Hex | Role |
|---|---|---|
| `--bg` | `#070a08` | Field — near-black with a green undertone |
| `--bg-raise` | `#0d1210` | Panel surface |
| `--bg-raise-2` | `#111815` | Raised panel / hover |
| `--line` | `#1f2925` | Hairline borders |
| `--chalk` | `#2c3833` | Stronger separators, ghost buttons |
| `--ink` | `#f2f5f2` | Primary text |
| `--ink-dim` | `#93a29b` | Secondary text, labels |
| `--accent` | `#52f2a5` | **The one accent** — actions, active states, the mark |
| `--accent-dim` | `#1d8a5e` | Accent gradients, deep fills |
| `--flood` (live) | `#d6ff4b` | Live-data pulse ONLY (the blinking dot). Never a second brand accent. |
| `--danger` | `#f2555a` | Floor breach, refund, negative ROI |
| `--amber` | `#e8c257` | VAR / review / caution states |

Contrast: `--ink` on `--bg` and on `--bg-raise` both clear WCAG AA for body text. `--accent` on `--bg` clears AA large-text and is used for headings, links, and iconography, never for long body copy.

---

## Typography

Wired via `next/font/google` in `app/layout.tsx`.

- **Display / statements:** Newsreader (`--font-newsreader`), weight 500, italic reserved for the "Cast" in the wordmark and for pull-quotes. Big statements only — never UI chrome.
- **UI / body:** Inter (`--font-inter`). Tight tracking on headings (-0.02em).
- **Data / numerals:** JetBrains Mono (`--font-jetbrains`). Every number lives in mono with `tabular-nums`: odds, hashes, accuracy, ROI, bond size, timestamps, Merkle roots.

Hierarchy: max 3 weights, 4–5 sizes. Mono is a hard rule for data — it is the "terminal receipt" texture the brand runs on.

---

## The mark — "Seal-Check"

A notched wax seal whose interior is a checkmark. One idea: a stamp that means verified. It survives at 16px (favicon) and scales to a hero lockup.

- Source: `components/Logo.tsx` (`Mark`) and `app/icon.svg` (favicon).
- Wordmark: `Proof` in ink + `Cast` in italic accent (Newsreader).
- Analyst / agent **crests keep the shield shape** — that is per-identity, a deliberately different role from the protocol's own seal.
- The seal ring, the inner ring, and the check are all `--accent`. No second color enters the mark.

Motion: the check draws on and the ring notches rotate a quarter-turn on first paint (the "seal stamped" gesture). Respect `prefers-reduced-motion`.

---

## Motion principles

- Crisp springs, no bounce. Entry longer than exit (enter ~300ms, exit ~200ms).
- One decisive signature gesture: the seal stamp. Everything else is subtle.
- Live data updates are quiet (150ms cross-fade), never attention-grabbing.
- Broadcast texture — tickers, sweeps, a VAR review pass — is allowed because it is the theme, but it stays low-opacity and never competes with content.

---

## Voice

Plain, exact, and a little bit broadcast. Short declarative sentences. Name the real thing — "sealed before kickoff," "graded by proof," "refunded from the bond" — never vague aspiration ("unlock the future of…"). No emoji. No hedging ("best-in-class," "cutting-edge," "seamless"). Numbers are specific and sourced. Written to read like a person who knows football and knows Solana wrote it, because that is the audience.

---

## Do / Don't

**Do:** single accent · mono for all data · flat panels on the field · asymmetric hero · specific copy · the seal gesture once per view.

**Don't:** two bright accents · nested cards · uniform radius on everything · gradient hero text · casino mechanics · vague headlines · emoji.
