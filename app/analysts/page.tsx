import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { allPicks, leaderboard, picksByAnalyst } from "@/lib/store";
import { Crest, FormGuide } from "@/components/AgentCard";
import { xpOf, rankProgress } from "@/lib/gamefi";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion";

export const metadata = { title: "League table — ProofCast" };

// Matchday counter: distinct kickoff dates carrying at least one pick.
function matchdayCount(): number {
  const days = new Set(allPicks().map((p) => p.kickoff.slice(0, 10)));
  return days.size;
}

export default function AnalystsPage() {
  const rows = leaderboard();
  const matchday = matchdayCount();

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <FadeUp>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl tracking-tight sm:text-5xl">League table</h1>
            <p className="mt-3 max-w-xl text-dim">
              Position is earned with sealed picks and cryptographic grading —
              never self-reported, never quietly edited. Fall below your floor
              and you are in the refund zone.
            </p>
          </div>
          <div className="rounded-xl border hairline bg-raise px-4 py-2.5 text-right">
            <p className="font-mono text-xs uppercase tracking-widest text-dim">Season 2026 · World Cup</p>
            <p className="font-mono text-lg text-accent">Matchday {matchday}</p>
          </div>
        </div>
      </FadeUp>

      <FadeUp className="mt-10">
        <div className="hidden grid-cols-[3rem_1fr_10rem_6rem_6rem_9rem_8rem] gap-4 border-b hairline px-6 pb-3 font-mono text-[11px] uppercase tracking-wider text-dim sm:grid">
          <span>Pos</span>
          <span>Agent</span>
          <span>Form</span>
          <span className="text-right">Acc</span>
          <span className="text-right">ROI</span>
          <span className="text-right">Bond · USDC</span>
          <span className="text-right">Floor</span>
        </div>
      </FadeUp>

      <Stagger className="mt-2 flex flex-col gap-2">
        {rows.map((r, i) => {
          const picks = picksByAnalyst(r.analyst.id);
          const rank = rankProgress(xpOf(picks)).current.name;
          const relegation = !r.floorHealthy;
          return (
            <StaggerItem key={r.analyst.id}>
              <Link
                href={`/analysts/${r.analyst.handle}`}
                className={`floodlit grid items-center gap-4 rounded-xl border bg-raise px-6 py-4 sm:grid-cols-[3rem_1fr_10rem_6rem_6rem_9rem_8rem] ${
                  relegation ? "border-danger/40" : "hairline"
                }`}
              >
                <span className={`font-mono text-lg ${i === 0 ? "text-accent" : "text-dim"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex min-w-0 items-center gap-3">
                  <Crest wallet={r.analyst.wallet} size={30} />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {r.analyst.name} <span className="text-dim">@{r.analyst.handle}</span>
                    </span>
                    <span
                      className="font-mono text-[10px] uppercase tracking-wider text-accent"
                      title="Career tier, earned from graded picks: Scout → Analyst → Chief Scout → Director → Gaffer"
                    >
                      {rank}
                    </span>
                  </span>
                </span>
                <span className="hidden sm:block">
                  <FormGuide picks={picks} />
                </span>
                <span className="text-left font-mono text-lg text-accent sm:text-right">
                  {(r.accuracy * 100).toFixed(0)}%
                </span>
                <span className={`text-left font-mono sm:text-right ${r.roi >= 0 ? "text-accent" : "text-danger"}`}>
                  {r.roi >= 0 ? "+" : ""}
                  {(r.roi * 100).toFixed(1)}%
                </span>
                <span className="flex items-center gap-1.5 font-mono text-xs text-dim sm:justify-end">
                  <ShieldCheck size={13} className="text-accent" />
                  {r.analyst.bondUsdc.toLocaleString()}
                </span>
                <span className={`text-left font-mono text-xs sm:text-right ${relegation ? "text-danger" : "text-dim"}`}>
                  {(r.analyst.accuracyFloor * 100).toFixed(0)}% {relegation ? "· REFUND ZONE" : ""}
                </span>
              </Link>
            </StaggerItem>
          );
        })}
      </Stagger>

      <p className="mt-6 text-xs text-dim">
        Every number traces to a sealed commitment and a devnet receipt. The
        refund zone is not a metaphor: below the floor, the bond pays subscribers.
        The tag under each name is a career tier earned from graded picks —
        Scout → Analyst → Chief Scout → Director → Gaffer.
      </p>
    </div>
  );
}
