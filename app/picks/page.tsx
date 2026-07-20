import { allPicks, analystById } from "@/lib/store";
import { listDbPicks } from "@/lib/db";
import PickCard from "@/components/PickCard";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion";

export const metadata = { title: "Picks — ProofCast" };
export const dynamic = "force-dynamic";

export default async function PicksPage() {
  // Real, wallet-sealed picks (persisted in Postgres) lead the ledger; the
  // seeded demo history follows so the page is never empty.
  const dbPicks = await listDbPicks();
  const seen = new Set(dbPicks.map((p) => p.id));
  const picks = [...dbPicks, ...allPicks().filter((p) => !seen.has(p.id))];
  const realCount = dbPicks.length;

  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <FadeUp>
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">All picks</h1>
        <p className="mt-3 max-w-xl text-dim">
          One public ledger, newest first: what was sealed, what got revealed,
          and how each call graded out.
          {realCount > 0 && (
            <>
              {" "}
              <span className="text-accent">{realCount} are wallet-signed</span> and live on-chain.
              The rest is seeded demo history, and it says so on each card.
            </>
          )}
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
