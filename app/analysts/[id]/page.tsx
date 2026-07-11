import { notFound } from "next/navigation";
import { analystById, picksByAnalyst } from "@/lib/store";
import { accuracyOf } from "@/lib/protocol";
import PickCard from "@/components/PickCard";
import AgentCard, { xpOf } from "@/components/AgentCard";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion";

export default async function AnalystPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const analyst = analystById(id);
  if (!analyst) notFound();
  const picks = picksByAnalyst(analyst.id);
  const stats = accuracyOf(picks);
  const xp = xpOf(picks);

  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <FadeUp>
        <AgentCard analyst={analyst} picks={picks} />
        <p className="mt-4 max-w-lg text-sm text-dim">{analyst.bio}</p>

        <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border hairline bg-raise p-5 text-center sm:grid-cols-4">
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
          <div>
            <p className="font-mono text-2xl text-flood">{xp.toLocaleString()}</p>
            <p className="text-xs text-dim">XP — proof-graded only</p>
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
