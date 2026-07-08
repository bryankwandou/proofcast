import Link from "next/link";
import { ShieldCheck, TrendingUp } from "lucide-react";
import { leaderboard } from "@/lib/store";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion";

export const metadata = { title: "Analysts — ProofCast" };

export default function AnalystsPage() {
  const rows = leaderboard();
  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <FadeUp>
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Leaderboard</h1>
        <p className="mt-3 max-w-xl text-dim">
          Every figure below comes from picks sealed before kickoff and graded
          against TxLINE data. Nothing here is self-reported, and nothing can be
          quietly edited after the fact.
        </p>
      </FadeUp>
      <Stagger className="mt-10 flex flex-col gap-4">
        {rows.map((r, i) => (
          <StaggerItem key={r.analyst.id}>
            <Link
              href={`/analysts/${r.analyst.handle}`}
              className="group grid gap-4 rounded-2xl border hairline bg-raise p-6 transition-colors hover:border-accent-dim sm:grid-cols-[auto_1fr_auto_auto_auto] sm:items-center"
            >
              <span className="font-mono text-lg text-dim">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="text-lg font-medium">
                  {r.analyst.name} <span className="text-dim">@{r.analyst.handle}</span>
                </p>
                <p className="mt-1 max-w-md text-sm text-dim">{r.analyst.bio}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-mono text-2xl text-accent">{(r.accuracy * 100).toFixed(0)}%</p>
                <p className="text-xs text-dim">{r.won}/{r.graded} correct</p>
              </div>
              <div className="text-left sm:text-right">
                <p className={`font-mono text-2xl ${r.roi >= 0 ? "text-accent" : "text-danger"}`}>
                  {r.roi >= 0 ? "+" : ""}{(r.roi * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-dim">flat-stake ROI</p>
              </div>
              <div className="flex flex-col items-start gap-1.5 sm:items-end">
                <span className="inline-flex items-center gap-1.5 rounded-full border hairline px-3 py-1 text-xs text-dim">
                  <ShieldCheck size={13} className="text-accent" />
                  {r.analyst.bondUsdc.toLocaleString()} USDC bond
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-full border hairline px-3 py-1 text-xs ${r.floorHealthy ? "text-dim" : "text-danger"}`}>
                  <TrendingUp size={13} />
                  floor {(r.analyst.accuracyFloor * 100).toFixed(0)}% · {r.floorHealthy ? "intact" : "breached"}
                </span>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
