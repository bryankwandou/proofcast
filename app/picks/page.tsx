import { allPicks, analystById } from "@/lib/store";
import PickCard from "@/components/PickCard";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion";

export const metadata = { title: "Picks — ProofCast" };
export const dynamic = "force-dynamic";

export default function PicksPage() {
  const picks = allPicks();
  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <FadeUp>
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">All picks</h1>
        <p className="mt-3 max-w-xl text-dim">
          The full public ledger: sealed commitments, revealed selections, and
          proof-graded results, newest first.
        </p>
      </FadeUp>
      <Stagger className="mt-10 flex flex-col gap-3">
        {picks.map((p) => (
          <StaggerItem key={p.id}>
            <PickCard pick={p} analystHandle={analystById(p.analystId)?.handle} />
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
