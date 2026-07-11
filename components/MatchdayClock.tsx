"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

// The sealing window: counts down to the next upcoming kickoff on the feed.
// A pick has to be sealed before the whistle, so this is the appointment —
// once it hits zero, that fixture is closed to new sealed picks.
type Match = { id: string; homeTeam: { name: string }; awayTeam: { name: string }; status: string; startTime: string };

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    h: String(Math.floor(s / 3600)).padStart(2, "0"),
    m: String(Math.floor((s % 3600) / 60)).padStart(2, "0"),
    s: String(s % 60).padStart(2, "0"),
  };
}

export default function MatchdayClock() {
  const [next, setNext] = useState<Match | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let stop = false;
    fetch("/api/fixtures")
      .then((r) => r.json())
      .then((d) => {
        if (stop) return;
        const upcoming = (d.matches ?? [])
          .filter((m: Match) => m.status === "pre")
          .sort((a: Match, b: Match) => +new Date(a.startTime) - +new Date(b.startTime));
        setNext(upcoming[0] ?? null);
      })
      .catch(() => {});
    return () => {
      stop = true;
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!next) return null;
  const { h, m, s } = parts(+new Date(next.startTime) - now);

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border hairline bg-raise px-5 py-4">
      <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-dim">
        <Clock size={13} /> Sealing window closes in
      </span>
      <span className="flex items-center gap-1 font-mono text-2xl text-flood tabular-nums">
        {h}<span className="text-dim">:</span>{m}<span className="text-dim">:</span>{s}
      </span>
      <span className="text-sm text-dim">
        {next.homeTeam.name} vs {next.awayTeam.name}
      </span>
    </div>
  );
}
