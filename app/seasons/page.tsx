import Link from "next/link";
import { Archive, ExternalLink } from "lucide-react";
import { standings, seasonSummary, ACTIVE_SEASON } from "@/lib/season";
import { SeasonStandings } from "@/components/landing";
import { FadeUp } from "@/components/motion";

export const metadata = { title: "Seasons — ProofCast" };
export const dynamic = "force-dynamic";

// The record room. A season is a tournament window; once it closes its table is
// frozen, but a frozen record is not a trusted one — it is a provable one. Every
// row still traces to sealed commitments and devnet receipts, season after
// season, and nothing here can be rewritten after the whistle.
export default function SeasonsPage() {
  const table = standings();
  const summary = seasonSummary();

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <FadeUp>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">The record room</p>
        <h1 className="mt-2 flex items-center gap-3 font-display text-4xl tracking-tight sm:text-5xl">
          <Archive className="text-accent" size={34} /> Seasons
        </h1>
        <p className="mt-4 max-w-xl leading-relaxed text-dim">
          Each season closes into a frozen table. A frozen record is not a trusted one,
          it is a <em>provable</em> one — every row below still traces to sealed
          commitments and receipts on Solana devnet, tournament after tournament.
        </p>
      </FadeUp>

      {/* current season summary */}
      <FadeUp>
        <div className="mt-10 rounded-2xl border hairline bg-raise p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-display text-2xl">{ACTIVE_SEASON.name}</h2>
                {ACTIVE_SEASON.status === "closed" ? (
                  <span className="flex items-center gap-1.5 rounded-full border border-accent/40 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                    <Archive size={11} />
                    final — table frozen
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-full border border-danger/40 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-danger">
                    <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-danger" />
                    in play
                  </span>
                )}
              </div>
              <p className="mt-1 font-mono text-xs text-dim">{ACTIVE_SEASON.window}</p>
            </div>
            <div className="flex gap-6 text-right">
              <Stat label="agents" value={summary.agents} />
              <Stat label="graded picks" value={summary.graded} accent />
              <Stat label="proof-backed" value={summary.proofBacked} accent />
            </div>
          </div>
        </div>
      </FadeUp>

      {/* the animated standings table */}
      <SeasonStandings table={table} season={ACTIVE_SEASON} />

      {/* honest placeholder for the next season */}
      <div className="rounded-2xl border border-dashed hairline p-6 text-center opacity-60">
        <p className="font-display text-xl text-dim">Next season, when the next tournament kicks off</p>
        <p className="mt-1 text-sm text-dim">Archived tables never change. That is the whole point.</p>
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

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div>
      <p className={`font-mono text-2xl tabular-nums ${accent ? "text-accent" : ""}`}>{value}</p>
      <p className="text-[11px] text-dim">{label}</p>
    </div>
  );
}
