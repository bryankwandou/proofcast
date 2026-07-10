import Link from "next/link";
import { Lock, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import type { Pick } from "@/lib/protocol";
import { explorerTx } from "@/lib/solana";

const statusMeta = {
  sealed: { label: "Sealed", cls: "text-amber border-amber/40", Icon: Lock },
  revealed: { label: "Revealed", cls: "text-dim hairline", Icon: Lock },
  won: { label: "Correct", cls: "text-accent border-accent/40", Icon: CheckCircle2 },
  lost: { label: "Missed", cls: "text-danger border-danger/40", Icon: XCircle },
  void: { label: "Void", cls: "text-dim hairline", Icon: XCircle },
} as const;

export default function PickCard({ pick, analystHandle }: { pick: Pick; analystHandle?: string }) {
  const m = statusMeta[pick.status];
  return (
    <div className="rounded-2xl border hairline bg-raise p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href={`/picks/${pick.id}`} className="font-medium hover:text-accent">
            {pick.fixtureLabel}
          </Link>
          <p className="mt-0.5 text-xs text-dim">
            {analystHandle ? `@${analystHandle} · ` : ""}
            {pick.status === "sealed"
              ? "selection hidden until the final whistle"
              : `${pick.selection} @ ${pick.oddsAtCommit.toFixed(2)}`}
            {pick.finalScore ? ` · final ${pick.finalScore.home}-${pick.finalScore.away}` : ""}
          </p>
        </div>
        <span className="flex items-center gap-2">
          {pick.demo && (
            <span className="rounded-full border hairline px-2.5 py-1 text-[10px] uppercase tracking-wider text-dim" title="Seeded history shown for illustration — receipts begin at commit">
              demo
            </span>
          )}
          {pick.simulated && (
            <span className="rounded-full border border-amber/40 px-2.5 py-1 text-[10px] uppercase tracking-wider text-amber" title="Graded with a user-supplied score because the feed had no result">
              simulated
            </span>
          )}
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${m.cls}`}>
            <m.Icon size={13} /> {m.label}
          </span>
        </span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-dim">
        <span title="commitment hash">sha256:{pick.commitHash.slice(0, 16)}…</span>
        {pick.commitTx && (
          <a href={explorerTx(pick.commitTx)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-accent">
            commit tx <ExternalLink size={11} />
          </a>
        )}
        {pick.gradeTx && (
          <a href={explorerTx(pick.gradeTx)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-accent">
            grade tx <ExternalLink size={11} />
          </a>
        )}
        {pick.proofRoot && <span title="TxLINE eventStatRoot">root:{String(pick.proofRoot).slice(0, 14)}…</span>}
      </div>
    </div>
  );
}
