import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { analystById, picksByAnalyst } from "@/lib/store";
import { accuracyOf } from "@/lib/protocol";
import PickCard from "@/components/PickCard";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion";

export default async function AnalystPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const analyst = analystById(id);
  if (!analyst) notFound();
  const picks = picksByAnalyst(analyst.id);
  const stats = accuracyOf(picks);
  const floorHealthy = stats.graded === 0 || stats.accuracy >= analyst.accuracyFloor;

  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <FadeUp>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl tracking-tight">{analyst.name}</h1>
            <p className="mt-1 text-dim">@{analyst.handle} · publishing since {analyst.joined}</p>
            <p className="mt-3 max-w-lg text-sm text-dim">{analyst.bio}</p>
          </div>
          <div className="rounded-2xl border hairline bg-raise p-5 text-sm">
            <div className="flex items-center gap-2 text-accent">
              <ShieldCheck size={16} />
              <span className="font-mono">{analyst.bondUsdc.toLocaleString()} USDC</span> bonded
            </div>
            <p className="mt-1 text-xs text-dim">
              accuracy floor {(analyst.accuracyFloor * 100).toFixed(0)}% ·{" "}
              <span className={floorHealthy ? "text-accent" : "text-danger"}>
                {floorHealthy ? "intact" : "breached — refunds active"}
              </span>
            </p>
            <p className="mt-1 text-xs text-dim">
              {analyst.subscribers.toLocaleString()} subscribers · {analyst.monthlyPriceUsdc} USDC/mo
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 rounded-2xl border hairline bg-raise p-5 text-center">
          <div>
            <p className="font-mono text-2xl text-accent">{(stats.accuracy * 100).toFixed(0)}%</p>
            <p className="text-xs text-dim">proof-graded accuracy</p>
          </div>
          <div>
            <p className="font-mono text-2xl">{stats.won}/{stats.graded}</p>
            <p className="text-xs text-dim">graded picks correct</p>
          </div>
          <div>
            <p className={`font-mono text-2xl ${stats.roi >= 0 ? "text-accent" : "text-danger"}`}>
              {stats.roi >= 0 ? "+" : ""}{(stats.roi * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-dim">flat-stake ROI</p>
          </div>
        </div>
      </FadeUp>

      <h2 className="font-display mt-12 text-2xl">Pick history</h2>
      <p className="mt-1 text-sm text-dim">
        Each entry was hashed and anchored before kickoff. Click through for the full receipt.
      </p>
      <Stagger className="mt-6 flex flex-col gap-3">
        {picks.map((p) => (
          <StaggerItem key={p.id}>
            <PickCard pick={p} />
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
