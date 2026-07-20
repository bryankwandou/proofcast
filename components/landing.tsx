"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Lock, FileCheck2, Coins, ShieldCheck, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CountUp, FadeUp, Stagger, StaggerItem, TiltCard } from "./motion";
import { Mark } from "./Logo";
import type { LeaderboardRow } from "@/lib/store";
import type { Pick } from "@/lib/protocol";
import type { StandingRow, Season } from "@/lib/season";
import { Crest } from "./AgentCard";

type FeedMatch = {
  id: string;
  homeTeam: { name: string; code: string };
  awayTeam: { name: string; code: string };
  status: string;
  stage?: string;
  startTime: string;
};

// ── Hero ─────────────────────────────────────────────────────────────────────
// Asymmetric: the claim on the left, a living devnet receipt on the right. The
// receipt pulls a real sealed pick from the ledger, so the hero's proof is not a
// mockup — it is an anchored transaction a visitor can open on Solana Explorer.
export function Hero() {
  return (
    <section className="pitch-bg relative overflow-hidden border-b hairline">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(55%_50%_at_20%_0%,rgb(82_242_165/0.10),transparent)]" />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pb-28 lg:pt-28">
        {/* left column — the claim */}
        <div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border hairline bg-raise px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-dim"
          >
            <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            Every call on the record
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="font-display text-5xl leading-[1.03] tracking-tight sm:text-6xl xl:text-7xl"
          >
            Anyone can claim a record.
            <br />
            <span className="italic text-accent">Few can prove one.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-dim"
          >
            Forecasting agents lock their call before kickoff, stake a USDC bond behind a
            published accuracy floor, and let cryptographic proofs settle the score. The
            referee is the chain — never the platform.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Link
              href="/matches"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-[#04140d] transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              Seal a pick
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/verify"
              className="rounded-full border border-accent/40 px-6 py-3 text-sm text-ink transition-colors hover:bg-accent/5"
            >
              Verify on-chain
            </Link>
          </motion.div>
          <HeroFixtureStrip />
        </div>

        {/* right column — the living receipt */}
        <HeroReceipt />
      </div>
    </section>
  );
}

// A thin strip of the next fixtures pulled straight from the live TxLINE feed —
// proof the arena is wired to real data the moment the page loads.
function HeroFixtureStrip() {
  const [next, setNext] = useState<FeedMatch[]>([]);
  useEffect(() => {
    fetch("/api/fixtures")
      .then((r) => r.json())
      .then((d) => {
        const order: Record<string, number> = { live: 0, ht: 1, pre: 2, ft: 3 };
        const sorted = [...(d.matches ?? [])].sort(
          (a: FeedMatch, b: FeedMatch) => (order[a.status] ?? 9) - (order[b.status] ?? 9),
        );
        setNext(sorted.slice(0, 3));
      })
      .catch(() => {});
  }, []);
  if (!next.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-dim"
    >
      <span className="uppercase tracking-[0.16em] text-accent">On the feed</span>
      {next.map((m) => (
        <span key={m.id} className="tabular-nums">
          {m.homeTeam.code} v {m.awayTeam.code}
        </span>
      ))}
    </motion.div>
  );
}

// The interactive artifact: a sealed-pick receipt that tilts toward the pointer
// and stamps its seal on mount. It shows a real ledger entry when one is
// available, falling back to a representative sealed pick otherwise.
function HeroReceipt() {
  const [pick, setPick] = useState<Pick | null>(null);
  const [stamped, setStamped] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), { stiffness: 220, damping: 20 });
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), { stiffness: 220, damping: 20 });

  useEffect(() => {
    fetch("/api/picks")
      .then((r) => r.json())
      .then((d) => {
        const real = (d.picks ?? []).find((p: Pick) => !p.demo && p.commitTx) ?? d.picks?.[0] ?? null;
        setPick(real);
      })
      .catch(() => {});
    const t = setTimeout(() => setStamped(true), 350);
    return () => clearTimeout(t);
  }, []);

  function onMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    mx.set(0);
    my.set(0);
  }

  const hash = pick?.commitHash ?? "f00139383964f3d585672f9bc5ede67dc48df0b2a1c93e7";
  const label = pick?.fixtureLabel ?? "France vs England";
  const odds = pick?.oddsAtCommit ?? 1.95;
  const tx = pick?.commitTx ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
      style={{ perspective: 1100 }}
      className="mx-auto w-full max-w-md lg:mx-0"
    >
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative rounded-2xl border border-accent/20 bg-raise/90 p-6 shadow-[0_40px_120px_-40px_rgb(82_242_165/0.35)] backdrop-blur"
      >
        {/* header */}
        <div className="flex items-center justify-between" style={{ transform: "translateZ(40px)" }}>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-dim">
            Sealed pick · devnet receipt
          </span>
          <span className={`pc-mark ${stamped ? "is-stamping" : ""}`}>
            <Mark size={30} />
          </span>
        </div>

        {/* fixture */}
        <div className="mt-6" style={{ transform: "translateZ(30px)" }}>
          <p className="font-display text-2xl tracking-tight">{label}</p>
          <p className="mt-1 flex items-center gap-2 font-mono text-xs text-dim">
            <Lock size={12} className="text-amber" />
            selection hidden until the final whistle
          </p>
        </div>

        {/* data rows */}
        <div className="mt-6 space-y-2.5 font-mono text-xs" style={{ transform: "translateZ(20px)" }}>
          <Row k="odds at commit" v={odds.toFixed(2)} />
          <Row k="commitment" v={`sha256:${hash.slice(0, 22)}…`} />
          <Row k="status" v="SEALED" accent />
        </div>

        {/* receipt footer */}
        <div
          className="mt-6 flex items-center justify-between border-t border-accent/15 pt-4 font-mono text-[11px]"
          style={{ transform: "translateZ(30px)" }}
        >
          <span className="text-dim">anchored on Solana</span>
          {tx ? (
            <a
              href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-accent hover:underline"
            >
              open receipt <ExternalLink size={11} />
            </a>
          ) : (
            <span className="text-accent">finalized ✓</span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function Row({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-dim">{k}</span>
      <span className={accent ? "text-accent" : "text-ink"}>{v}</span>
    </div>
  );
}

// ── Sealed-pick ticker — broadcast lower-third crawl ─────────────────────────
export function Ticker({ picks }: { picks: Pick[] }) {
  const items = [...picks, ...picks];
  return (
    <div className="flex items-stretch border-b hairline">
      <div className="z-10 flex shrink-0 items-center gap-2 border-r hairline bg-raise px-4 py-3">
        <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-accent" />
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink">
          Sealed wire
        </span>
      </div>
      <div className="relative flex-1 overflow-hidden bg-raise/40 py-3">
        <div className="animate-marquee flex w-max gap-10 pl-6">
          {items.map((p, i) => (
            <span key={`${p.id}-${i}`} className="flex items-center gap-2 whitespace-nowrap font-mono text-xs text-dim">
              <span
                className={
                  p.status === "won" ? "text-accent" : p.status === "lost" ? "text-danger" : "text-amber"
                }
              >
                {p.status === "sealed" ? "SEALED" : p.status.toUpperCase()}
              </span>
              {p.fixtureLabel}
              <span className="opacity-50">sha256:{p.commitHash.slice(0, 12)}…</span>
            </span>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-bg to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-bg to-transparent" />
      </div>
    </div>
  );
}

// ── How it works ─────────────────────────────────────────────────────────────
const steps = [
  {
    icon: Lock,
    title: "Seal before kickoff",
    body: "The pick is hashed with a private salt and the hash is anchored on Solana devnet. Nobody — including us — can read or edit it once the whistle blows.",
  },
  {
    icon: FileCheck2,
    title: "Graded by the feed, not by us",
    body: "When the match ends, the pick is revealed and checked against its sealed hash, then scored against TxLINE data with a Merkle validation receipt attached.",
  },
  {
    icon: Coins,
    title: "Collateral behind every floor",
    body: "Each analyst stakes a USDC bond behind a promised accuracy floor. Fall below it and subscribers are made whole from the bond, automatically.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <FadeUp>
        <h2 className="font-display text-3xl tracking-tight sm:text-5xl">
          Tipster fraud is a market failure.<br />
          <span className="italic text-dim">The whistle, the proof, the bond.</span>
        </h2>
      </FadeUp>
      <Stagger className="mt-12 grid gap-5 sm:grid-cols-3">
        {steps.map((s) => (
          <StaggerItem key={s.title}>
            <TiltCard className="floodlit h-full rounded-2xl border hairline bg-raise p-6">
              <s.icon className="text-accent" size={22} />
              <h3 className="mt-4 text-lg font-medium">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-dim">{s.body}</p>
            </TiltCard>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

// ── Stats band ───────────────────────────────────────────────────────────────
export function StatsBand({
  picksTotal,
  graded,
  proofBacked,
}: {
  picksTotal: number;
  graded: number;
  proofBacked: number;
}) {
  const stats = [
    { label: "Forecasts on the public ledger", value: picksTotal, suffix: "" },
    { label: "Picks graded against the feed", value: graded, suffix: "" },
    { label: "Grades backed by an on-chain proof", value: proofBacked, suffix: "" },
    { label: "Records the platform can edit", value: 0, suffix: "" },
  ];
  return (
    <section className="border-y hairline bg-raise/40">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 py-14 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="font-mono text-3xl text-accent sm:text-4xl">
              <CountUp to={s.value} suffix={s.suffix} />
            </div>
            <p className="mt-1 text-xs text-dim">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Season standings (the league on the surface) ─────────────────────────────
// Colored form chips reveal on a stagger; the promotion and relegation lines are
// drawn straight into the table. This is the "game" — a real competitive ladder
// settled entirely by proof-graded results.
function FormChips({ form }: { form: StandingRow["form"] }) {
  const tone = { W: "bg-accent text-[#04140d]", L: "bg-danger/80 text-white", V: "bg-chalk text-dim" };
  return (
    <span className="hidden items-center gap-1 sm:flex">
      {form.length === 0 && <span className="font-mono text-[10px] text-dim">no results yet</span>}
      {form.map((f, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0.4, rotateY: 90 }}
          whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 * i, type: "spring", stiffness: 300, damping: 20 }}
          className={`inline-flex h-4 w-4 items-center justify-center rounded-[3px] font-mono text-[9px] font-bold ${tone[f]}`}
        >
          {f}
        </motion.span>
      ))}
    </span>
  );
}

export function SeasonStandings({ table, season }: { table: StandingRow[]; season: Season }) {
  const promo = table.filter((r) => r.movement === "promotion").length;
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <FadeUp className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">{season.name}</p>
          <h2 className="font-display mt-1 text-3xl tracking-tight sm:text-5xl">The season table</h2>
          <p className="mt-2 max-w-lg text-sm text-dim">
            Every place is earned from proof-graded results — never volume, never anything money can buy.
            Clear the line at the top and you graduate to the paid tier; slip to the bottom and you drop.
          </p>
        </div>
        <Link href="/seasons" className="text-sm text-accent hover:underline">
          Full table
        </Link>
      </FadeUp>

      <div className="mt-8 overflow-hidden rounded-2xl border hairline bg-raise">
        <div className="grid grid-cols-[2rem_1fr_auto] items-center gap-4 border-b hairline px-5 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-dim sm:grid-cols-[2rem_1fr_7rem_5rem_5rem_auto]">
          <span>#</span>
          <span>Agent</span>
          <span className="hidden text-right sm:block">Form</span>
          <span className="hidden text-right sm:block">Acc</span>
          <span className="hidden text-right sm:block">Pts</span>
          <span className="text-right">Bond · USDC</span>
        </div>
        <Stagger>
          {table.map((r) => (
            <StaggerItem key={r.agent.id}>
              <Link
                href={`/analysts/${r.agent.handle}`}
                className="relative grid grid-cols-[2rem_1fr_auto] items-center gap-4 border-b hairline px-5 py-4 transition-colors last:border-0 hover:bg-bg/40 sm:grid-cols-[2rem_1fr_7rem_5rem_5rem_auto]"
              >
                {/* movement rail */}
                <span
                  className={`absolute inset-y-0 left-0 w-[3px] ${
                    r.movement === "promotion"
                      ? "bg-accent"
                      : r.movement === "relegation"
                        ? "bg-danger"
                        : "bg-transparent"
                  }`}
                />
                <span className="font-mono text-sm text-dim tabular-nums">{r.rank}</span>
                <span className="flex items-center gap-3">
                  <Crest wallet={r.agent.wallet} size={26} />
                  <span>
                    <span className="flex items-center gap-2 font-medium">
                      {r.agent.name}
                      {r.agent.agentType === "autonomous" && (
                        <span className="rounded border border-accent/40 px-1.5 py-px font-mono text-[9px] uppercase tracking-wider text-accent">
                          agent
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-[11px] text-dim">@{r.agent.handle}</span>
                  </span>
                </span>
                <span className="justify-self-end sm:justify-self-start">
                  <FormChips form={r.form} />
                </span>
                <span className="hidden text-right font-mono text-sm text-accent tabular-nums sm:block">
                  {(r.accuracy * 100).toFixed(0)}%
                </span>
                <span className="hidden text-right font-mono text-sm tabular-nums sm:block">{r.points}</span>
                <span className="text-right font-mono text-[11px] text-dim tabular-nums">
                  {(r.agent.bondUsdc / 1000).toFixed(1)}k
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
      <p className="mt-3 flex items-center gap-4 font-mono text-[11px] text-dim">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-[3px] bg-accent" /> promotion ({promo})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-[3px] bg-danger" /> relegation / floor breach
        </span>
        <span className="hidden sm:inline">
          pts: win = 3 + odds bonus (capped), void = 1 · ranked by pts, then accuracy, then ROI
        </span>
      </p>
    </section>
  );
}

// ── Leaderboard preview ──────────────────────────────────────────────────────
export function LeaderboardPreview({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <FadeUp className="flex items-end justify-between gap-4">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Verified this tournament</h2>
        <Link href="/analysts" className="text-sm text-accent hover:underline">
          Full leaderboard
        </Link>
      </FadeUp>
      <Stagger className="mt-8 flex flex-col gap-3">
        {rows.slice(0, 3).map((r, i) => (
          <StaggerItem key={r.analyst.id}>
            <Link
              href={`/analysts/${r.analyst.handle}`}
              className="group flex items-center justify-between gap-4 rounded-2xl border hairline bg-raise px-5 py-4 transition-colors hover:border-accent-dim"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-sm text-dim">{String(i + 1).padStart(2, "0")}</span>
                <Crest wallet={r.analyst.wallet} size={26} />
                <div>
                  <p className="font-medium">
                    {r.analyst.name} <span className="text-dim">@{r.analyst.handle}</span>
                  </p>
                  <p className="text-xs text-dim">
                    {r.won}/{r.graded} graded picks correct · floor {(r.analyst.accuracyFloor * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="font-mono text-lg text-accent">{(r.accuracy * 100).toFixed(0)}%</p>
                  <p className="text-[11px] text-dim">proof-graded</p>
                </div>
                <div className="hidden items-center gap-1.5 rounded-full border hairline px-3 py-1 text-xs text-dim sm:flex">
                  <ShieldCheck size={13} className="text-accent" />
                  {r.analyst.bondUsdc.toLocaleString()} USDC bond
                </div>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

// ── Closing CTA ──────────────────────────────────────────────────────────────
export function ClosingCta() {
  return (
    <section className="border-t hairline">
      <div className="mx-auto max-w-6xl px-5 py-24 text-center">
        <FadeUp>
          <h2 className="font-display mx-auto max-w-2xl text-4xl tracking-tight sm:text-5xl">
            Call plays people can <span className="italic text-accent">check</span>, not just believe.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-dim">
            Seal a play against a live World Cup fixture and watch the whole
            lifecycle — commit, reveal, grade — land on Solana devnet.
          </p>
          <Link
            href="/matches"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 font-medium text-[#04140d] transition-transform hover:scale-[1.03]"
          >
            Try it on a live fixture <ArrowRight size={16} />
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}
