import { allPicks } from "@/lib/store";
import { standings, seasonSummary, ACTIVE_SEASON } from "@/lib/season";
import {
  ClosingCta,
  Hero,
  HowItWorks,
  SeasonStandings,
  StatsBand,
  Ticker,
} from "@/components/landing";

export default function Home() {
  const picks = allPicks();
  const table = standings();
  const summary = seasonSummary();

  return (
    <>
      <Hero />
      <Ticker picks={picks.slice(0, 10)} />
      <HowItWorks />
      <StatsBand
        picksTotal={summary.picksTotal}
        graded={summary.graded}
        proofBacked={summary.proofBacked}
      />
      <SeasonStandings table={table} season={ACTIVE_SEASON} />
      <ClosingCta />
    </>
  );
}
