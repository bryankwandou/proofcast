"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Lock, FileCheck2, Coins, ShieldCheck } from "lucide-react";
import { CountUp, FadeUp, Stagger, StaggerItem, TiltCard } from "./motion";
import type { LeaderboardRow } from "@/lib/store";
import type { Pick } from "@/lib/protocol";

// ── Hero ─────────────────────────────────────────────────────────────────────
export function Hero() {
  return (
    <section className="grid-bg relative overflow-hidden border-b hairline">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(60%_50%_at_50%_0%,rgb(52_229_155/0.09),transparent)]" />
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-24 text-center sm:pb-28 sm:pt-32">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border hairline bg-raise px-4 py-1.5 text-xs text-dim"
        >
          <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          Grading every World Cup pick with TxLINE Merkle proofs
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="font-display mx-auto max-w-3xl text-5xl leading-[1.05] tracking-tight sm:text-7xl"
        >
          Anyone can claim a record. <span className="italic text-accent">Few can prove one.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mx-auto mt-6 max-w-xl text-lg text-dim"
        >
          Football analysts seal their predictions before kickoff, put a USDC bond
          behind a public accuracy floor, and let cryptographic proofs do the grading.
          The platform never touches the result.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/analysts"
            className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-[#04140d] transition-transform hover:scale-[1.03]"
          >
            See verified records
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/how-it-works"
            className="rounded-full border hairline px-6 py-3 text-sm text-dim transition-colors hover:text-ink"
          >
            Read the protocol
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ── Sealed-pick ticker ───────────────────────────────────────────────────────
export function Ticker({ picks }: { picks: Pick[] }) {
  const items = [...picks, ...picks];
  return (
    <div className="overflow-hidden border-b hairline bg-raise/40 py-3">
      <div className="animate-marquee flex w-max gap-8">
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
          <span className="italic text-dim">Settlement fixes it.</span>
        </h2>
      </FadeUp>
      <Stagger className="mt-12 grid gap-5 sm:grid-cols-3">
        {steps.map((s) => (
          <StaggerItem key={s.title}>
            <TiltCard className="h-full rounded-2xl border hairline bg-raise p-6">
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
export function StatsBand({ picks }: { picks: number }) {
  const stats = [
    { label: "Forecasts on the public ledger", value: picks, suffix: "" },
    { label: "On-chain receipts per graded pick", value: 3, suffix: "" },
    { label: "Matches on the TxLINE feed", value: 104, suffix: "" },
    { label: "Self-graded records allowed", value: 0, suffix: "" },
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
            Post picks people can <span className="italic text-accent">check</span>, not just believe.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-dim">
            Seal a pick against a live World Cup fixture and watch the whole
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
