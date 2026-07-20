"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Flag } from "./Flag";

// Broadcast score-bug strip: sits under the nav, shows what the TxLINE feed
// is showing right now. Live matches lead with a pulsing minute counter; today's
// upcoming fixtures follow with kickoff times. Each bug carries a competition
// tag so World Cup and friendly fixtures are never confused. Renders nothing
// when the feed is empty — an empty stadium needs no scoreboard.

type Match = {
  id: string;
  homeTeam: { name: string; code: string };
  awayTeam: { name: string; code: string };
  score: { home: number; away: number };
  minute: number;
  status: "pre" | "live" | "ht" | "ft";
  startTime: string;
  stage?: string;
};

function code(team: { name: string; code: string }) {
  return (team.code || team.name.slice(0, 3)).toUpperCase();
}

// Competition tag — World Cup fixtures are the arena's main event; friendlies
// are labelled plainly so nothing is passed off as tournament data.
function CompTag({ stage }: { stage?: string }) {
  const wc = /world\s*cup|qualif/i.test(stage ?? "");
  return (
    <span
      className={`shrink-0 rounded-[3px] px-1 py-px text-[8px] font-semibold uppercase leading-none tracking-[0.14em] ${
        wc ? "bg-accent/15 text-accent" : "bg-chalk/50 text-dim"
      }`}
      title={stage}
    >
      {wc ? "WC" : "FR"}
    </span>
  );
}

function Bug({ m }: { m: Match }) {
  const live = m.status === "live" || m.status === "ht";
  return (
    <Link
      href="/matches"
      className="group floodlit flex shrink-0 items-center gap-2.5 rounded-lg border hairline bg-raise px-3 py-1.5 font-mono text-xs transition-transform hover:-translate-y-px"
    >
      <CompTag stage={m.stage} />
      <span className="flex items-center gap-1.5 text-ink">
        <Flag name={m.homeTeam.name} className="!w-[22px] !h-[15px]" />
        <span className="tracking-wide">{code(m.homeTeam)}</span>
      </span>
      {m.status === "pre" ? (
        <span className="tabular-nums text-dim">
          {new Date(m.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      ) : (
        <span className="rounded bg-chalk/60 px-1.5 py-0.5 tabular-nums text-ink">
          {m.score.home}–{m.score.away}
        </span>
      )}
      <span className="flex items-center gap-1.5 text-ink">
        <span className="tracking-wide">{code(m.awayTeam)}</span>
        <Flag name={m.awayTeam.name} className="!w-[22px] !h-[15px]" />
      </span>
      {live && (
        <span className="flex items-center gap-1 font-semibold text-danger">
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

  const anyLive = matches.some((m) => m.status === "live" || m.status === "ht");

  return (
    <div className="relative border-b hairline bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto px-5 py-2 [scrollbar-width:none]">
        <span className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
          {anyLive && <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-flood" />}
          Live feed
        </span>
        {matches.map((m) => (
          <Bug key={m.id} m={m} />
        ))}
      </div>
      {/* edge fade so the scroll strip dissolves instead of cutting hard */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-bg to-transparent" />
    </div>
  );
}
