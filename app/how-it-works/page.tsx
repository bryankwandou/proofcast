import { FadeUp } from "@/components/motion";
import { TXLINE_PROGRAM_DEVNET } from "@/lib/solana";

export const metadata = { title: "Protocol — ProofCast" };

const sections = [
  {
    n: "01",
    title: "The problem: track records you have to take on faith",
    body: `Paid football picks are a large, ugly market. Sellers routinely delete losing calls, backdate winners, or screenshot slips after the result is known. Rating sites cannot fix this because they grade their own sellers; the referee works for one of the teams. A buyer looking at two track records has no reliable way to tell a genuine 60% analyst from a confident liar, so honest analysts end up priced like frauds.`,
  },
  {
    n: "02",
    title: "Sealed commitments",
    body: `Before kickoff, an analyst's pick is reduced to a canonical string (analyst, fixture, selection, odds) and hashed with a random salt, in the analyst's own browser. The server receives only the hash, which is then anchored in a Solana devnet transaction. The selection and the salt stay on the analyst's device until reveal. That makes the platform structurally unable to read a pick before the match ends, and the timestamp comes from the chain, not from us.`,
  },
  {
    n: "03",
    title: "Settlement by proof, not by platform",
    body: `When the match ends, the pick is revealed and re-hashed — any mismatch voids it. The result comes from the TxLINE feed, whose score snapshots are committed to daily Merkle roots on Solana. At grading time, settlement executes the validate_stat instruction of the program at ${TXLINE_PROGRAM_DEVNET} on devnet with the fixture's Merkle proof material: the program — not ProofCast — walks the proof against the on-chain daily root, and a grade is only marked proof-backed when that check passes. You can run the exact same check yourself on the Verify page.`,
  },
  {
    n: "04",
    title: "Bonds and the accuracy floor",
    body: `Reputation alone is cheap talk, so ProofCast prices it. Each analyst locks a USDC bond and publishes an accuracy floor: the hit rate they are willing to be held to. Subscription revenue flows normally while the floor holds. The moment proof-graded accuracy drops below the floor over the rolling window, the settlement program pays refunds to active subscribers straight from the bond. No support tickets, no discretion, no appeals to the platform.`,
  },
  {
    n: "05",
    title: "What is on devnet today, and what comes next",
    body: `The build you are looking at anchors commit, reveal, and grade events as signed devnet transactions, executes TxLINE's validate_stat program as a settlement gate on every feed-backed grade, and exposes a public verification console where anyone can rerun that check. The money path is on-chain too: the Bond Vault Anchor program at 6XGwWjKTTkWD6JcJQXGUeDexJfrY3Nv2gM4yjJs5jSNi holds collateral and fees in a PDA escrow, and its settle instruction performs a CPI into validate_stat — both settlement legs (agent earns on a held floor, subscribers refunded on a breach) have executed on devnet, gated by a real Merkle proof; the receipts are in docs/BOND-VAULT.md in the repo. What comes next — USDC (SPL) escrow, a keeper bot on the score stream, and program tests — is sequenced in docs/ROADMAP.md. Nothing in the product depends on trusting ProofCast: that is the point.`,
  },
];

export default function ProtocolPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <FadeUp>
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">The protocol</h1>
        <p className="mt-3 text-dim">
          ProofCast in five parts, from the fraud it removes to the settlement
          engine that removes it.
        </p>
      </FadeUp>
      <div className="mt-12 flex flex-col gap-12">
        {sections.map((s) => (
          <FadeUp key={s.n}>
            <div className="flex gap-5">
              <span className="font-mono text-sm text-accent">{s.n}</span>
              <div>
                <h2 className="text-xl font-medium">{s.title}</h2>
                <p className="mt-3 leading-relaxed text-dim">{s.body}</p>
              </div>
            </div>
          </FadeUp>
        ))}
      </div>
    </div>
  );
}
