import { FadeUp } from "@/components/motion";
import { TXLINE_PROGRAM_DEVNET } from "@/lib/solana";

export const metadata = { title: "Protocol — ProofCast" };

const sections = [
  {
    n: "01",
    title: "The problem: track records you have to take on faith",
    body: `Paid football picks are a large, ugly market. Sellers routinely delete losing calls, backdate winners, or screenshot slips after the result is known. Rating sites cannot fix this because they grade their own sellers — the referee works for one of the teams. Buyers have no way to distinguish a genuine 60% analyst from a confident liar, so honest analysts are priced like frauds.`,
  },
  {
    n: "02",
    title: "Sealed commitments",
    body: `Before kickoff, an analyst's pick is reduced to a canonical string (analyst, fixture, selection, odds), hashed with a private salt, and the hash is anchored in a Solana devnet transaction. From that moment the pick can be proven to exist but cannot be read, edited, or deleted. Timestamped by the chain, not by us.`,
  },
  {
    n: "03",
    title: "Settlement by proof, not by platform",
    body: `When the match ends, the pick is revealed and re-hashed — any mismatch voids it. The result comes from the TxLINE feed, whose score snapshots are committed to daily Merkle roots on Solana. Our settlement path fetches the stat-validation proof (GET /api/scores/stat-validation) and records the eventStatRoot alongside the grade, so every graded pick carries a receipt that traces back to the on-chain root. The validation program lives at ${TXLINE_PROGRAM_DEVNET} on devnet, and the on-chain settlement engine CPIs into its validate_stat instruction to confirm outcomes before any funds move.`,
  },
  {
    n: "04",
    title: "Bonds and the accuracy floor",
    body: `Reputation alone is cheap talk, so ProofCast prices it. Each analyst locks a USDC bond and publishes an accuracy floor — the hit rate they are willing to be held to. Subscription revenue flows normally while the floor holds. The moment proof-graded accuracy drops below the floor over the rolling window, the settlement program pays refunds to active subscribers straight from the bond. No support tickets, no discretion, no appeals to the platform.`,
  },
  {
    n: "05",
    title: "What is on devnet today, and what comes next",
    body: `The build you are looking at anchors commit, reveal, and grade events as signed devnet transactions and attaches TxLINE Merkle roots to every graded pick. The Anchor settlement program — bond vault PDA, subscriber registry, refund instruction gated by a validate_stat CPI — is specified in docs/ROADMAP.md and is the next milestone. Nothing in the product depends on trusting ProofCast: that is the point.`,
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
