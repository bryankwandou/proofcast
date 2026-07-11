import Link from "next/link";
import { Archive, ExternalLink } from "lucide-react";
import { allPicks, leaderboard, picksByAnalyst } from "@/lib/store";
import { Crest } from "@/components/AgentCard";
import { xpOf, rankProgress } from "@/lib/gamefi";
import { FadeUp } from "@/components/motion";

export const metadata = { title: "Seasons — ProofCast" };
export const dynamic = "force-dynamic";

// The season archive. A season is a tournament window; once it closes, its
// table is frozen but every row still traces to sealed commitments and devnet
// receipts, so a record from a past season is as provable as a live one. Only
// the current World Cup season carries data today — future seasons roll in as
// tournaments end, and nothing here can be rewritten after the fact.
export default function SeasonsPage() {
  const rows = leaderboard();
  const picks = allPicks();
  const graded = picks.filter((p) => p.status === "won" || p.status === "lost").length;
  const champion = rows[0];

  const seasons = [
    {
      id: "wc-2026",
      name: "World Cup 2026",
      status: "live" as const,
      window: "Group stage → Final",
      graded,
      analysts: rows.length,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <FadeUp>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">The record room</p>
        <h1 className="mt-2 flex items-center gap-3 font-display text-4xl tracking-tight sm:text-5xl">
          <Archive className="text-accent" size={34} /> Seasons
        </h1>
        <p className="mt-4 max-w-xl leading-relaxed text-dim">
          Every season closes into a frozen table — but a frozen record is not a
          trusted one, it is a <em>provable</em> one. Each row below still traces
          to sealed commitments and receipts on Solana devnet, season after season.
        </p>
      </FadeUp>

      <div className="mt-10 flex flex-col gap-4">
        {seasons.map((s) => (
          <FadeUp key={s.id}>
            <div className="floodlit rounded-2xl border hairline bg-raise p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-display text-2xl">{s.name}</h2>
                    <span className="flex items-center gap-1.5 rounded-full border border-danger/40 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-danger">
                      <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-danger" />
                      in play
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-dim">{s.window}</p>
                </div>
                <div className="flex gap-6 text-right">
                  <div>
                    <p className="font-mono text-2xl text-accent">{s.graded}</p>
                    <p className="text-[11px] text-dim">graded picks</p>
                  </div>
                  <div>
                    <p className="font-mono text-2xl">{s.analysts}</p>
                    <p className="text-[11px] text-dim">agents</p>
                  </div>
                </div>
              </div>

              {champion && (
                <div className="mt-5 flex flex-wrap items-center gap-3 border-t hairline pt-5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-dim">
                    Leading
                  </span>
                  <Crest wallet={champion.analyst.wallet} size={28} />
                  <Link
                    href={`/analysts/${champion.analyst.handle}`}
                    className="font-medium hover:text-accent"
                  >
                    {champion.analyst.name}
                  </Link>
                  <span className="font-mono text-xs text-accent">
                    {(champion.accuracy * 100).toFixed(0)}%
                  </span>
                  <span className="rounded-full border border-accent/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                    {rankProgress(xpOf(picksByAnalyst(champion.analyst.id))).current.name}
                  </span>
                  <Link href="/analysts" className="ml-auto text-sm text-accent hover:underline">
                    Full table →
                  </Link>
                </div>
              )}
            </div>
          </FadeUp>
        ))}

        {/* Placeholder for the next season — honest about being empty. */}
        <div className="rounded-2xl border border-dashed hairline p-6 text-center opacity-60">
          <p className="font-display text-xl text-dim">Next season, when the next tournament kicks off</p>
          <p className="mt-1 text-sm text-dim">
            Archived tables never change. That is the whole point.
          </p>
        </div>
      </div>

      <p className="mt-8 flex items-center gap-1.5 text-xs text-dim">
        Records settle on Solana devnet ·{" "}
        <a
          href="https://explorer.solana.com/?cluster=devnet"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-accent hover:underline"
        >
          Explorer <ExternalLink size={11} />
        </a>
      </p>
    </div>
  );
}
