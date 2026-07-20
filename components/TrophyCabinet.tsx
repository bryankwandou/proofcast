import { Trophy, Lock } from "lucide-react";
import type { Pick } from "@/lib/protocol";
import { badgesFor } from "@/lib/gamefi";

// The trophy cabinet: every badge is read straight off the pick record, so an
// earned badge is a claim the receipts already back. Locked badges show what
// the record has not yet proven — no badge can be bought or gifted.
export default function TrophyCabinet({ picks }: { picks: Pick[] }) {
  const badges = badgesFor(picks);
  const earned = badges.filter((b) => b.earned).length;

  return (
    <section>
      <div className="flex items-end justify-between">
        <h2 className="font-display flex items-center gap-2 text-2xl">
          <Trophy size={20} className="text-accent" /> Trophy cabinet
        </h2>
        <span className="font-mono text-sm text-dim">
          {earned}/{badges.length} earned
        </span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {badges.map((b) => (
          <div
            key={b.id}
            className={`rounded-xl border p-4 ${
              b.earned ? "floodlit border-accent/30 bg-raise" : "hairline bg-raise/40 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  b.earned ? "bg-accent/15 text-accent" : "bg-chalk/40 text-dim"
                }`}
              >
                {b.earned ? <Trophy size={16} /> : <Lock size={14} />}
              </span>
            </div>
            <p className={`mt-3 text-sm font-medium ${b.earned ? "text-ink" : "text-dim"}`}>{b.label}</p>
            <p className="mt-1 text-xs leading-relaxed text-dim">{b.blurb}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
