"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { flagFor } from "@/lib/flags";

// Broadcast score-bug strip: sits under the nav, shows what the TxLINE feed
// is showing right now. Live matches lead with a red minute counter; today's
// upcoming fixtures follow with kickoff times. Renders nothing when the feed
// has nothing — an empty stadium doesn't need a scoreboard.

type Match = {
  id: string;
  homeTeam: { name: string; code: string };
  awayTeam: { name: string; code: string };
  score: { home: number; away: number };
  minute: number;
  status: "pre" | "live" | "ht" | "ft";
  startTime: string;
};

function code(team: { name: string; code: string }) {
  return (team.code || team.name.slice(0, 3)).toUpperCase();
}

function Bug({ m }: { m: Match }) {
  const live = m.status === "live" || m.status === "ht";
  return (
    <Link
      href="/matches"
      className="floodlit flex shrink-0 items-center gap-2.5 rounded-lg border hairline bg-raise px-3.5 py-1.5 font-mono text-xs"
    >
      <span className="flex items-center gap-1 text-ink">
        <span className="text-sm leading-none">{flagFor(m.homeTeam.name)}</span>
        {code(m.homeTeam)}
      </span>
      {m.status === "pre" ? (
        <span className="text-dim">
          {new Date(m.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      ) : (
        <span className="rounded bg-chalk/60 px-1.5 py-0.5 text-ink">
          {m.score.home}–{m.score.away}
        </span>
      )}
      <span className="flex items-center gap-1 text-ink">
        <span className="text-sm leading-none">{flagFor(m.awayTeam.name)}</span>
        {code(m.awayTeam)}
      </span>
      {live && (
        <span className="flex items-center gap-1 text-danger">
          <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-danger" />
          {m.status === "ht" ? "HT" : `${m.minute}'`}
        </span>
      )}
      {m.status === "ft" && <span className="text-dim">FT</span>}
    </Link>
  );
}

export default function ScoreBug() {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    let stop = false;
    const load = () =>
      fetch("/api/fixtures")
        .then((r) => r.json())
        .then((d) => {
          if (stop) return;
          const all: Match[] = d.matches ?? [];
          const order = { live: 0, ht: 1, ft: 2, pre: 3 } as const;
          setMatches(
            [...all].sort((a, b) => order[a.status] - order[b.status]).slice(0, 8)
          );
        })
        .catch(() => {});
    load();
    const t = setInterval(load, 45_000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, []);

  if (matches.length === 0) return null;

  return (
    <div className="border-b hairline bg-bg/90">
      <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto px-5 py-2 [scrollbar-width:none]">
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
          Feed
        </span>
        {matches.map((m) => (
          <Bug key={m.id} m={m} />
        ))}
      </div>
    </div>
  );
}
