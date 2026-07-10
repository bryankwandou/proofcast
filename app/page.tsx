import { allPicks, leaderboard } from "@/lib/store";
import {
  ClosingCta,
  Hero,
  HowItWorks,
  LeaderboardPreview,
  StatsBand,
  Ticker,
} from "@/components/landing";

export default function Home() {
  const rows = leaderboard();
  const picks = allPicks();

  return (
    <>
      <Hero />
      <Ticker picks={picks.slice(0, 10)} />
      <HowItWorks />
      <StatsBand picks={picks.length} />
      <LeaderboardPreview rows={rows} />
      <ClosingCta />
    </>
  );
}
