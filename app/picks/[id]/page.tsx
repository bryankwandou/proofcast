"use client";

import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, XCircle, ExternalLink, LoaderCircle, FileCheck2, ShieldCheck } from "lucide-react";
import type { Pick } from "@/lib/protocol";

type OnChainCheck = {
  valid: boolean;
  fixtureValid: boolean;
  program: string;
  rootsPda: string | null;
  statKey: number;
  statValue: number;
  logs?: string[];
  error?: string;
};

const explorer = (sig: string) => `https://explorer.solana.com/tx/${sig}?cluster=devnet`;

export default function PickPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [pick, setPick] = useState<Pick | null>(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [home, setHome] = useState(2);
  const [away, setAway] = useState(1);
  const [check, setCheck] = useState<OnChainCheck | null>(null);
  const [checking, setChecking] = useState(false);

  async function runOnChainCheck() {
    if (!pick) return;
    setChecking(true);
    setCheck(null);
    try {
      const r = await fetch(`/api/verify?fixtureId=${pick.fixtureId}&seq=latest&statKey=1`);
      setCheck(await r.json());
    } finally {
      setChecking(false);
    }
  }

  async function load() {
    const d = await fetch("/api/picks").then((r) => r.json());
    setPick((d.picks as Pick[]).find((p) => p.id === id) ?? null);
    setLoading(false);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function grade() {
    setGrading(true);
    setError(null);
    try {
      // Client-sealed picks: the reveal material (salt + selection) lives in
      // this browser only, and is handed over at grading time.
      let reveal: { salt?: string; selection?: string } = {};
      try {
        const stored = localStorage.getItem(`proofcast:${id}`);
        if (stored) reveal = JSON.parse(stored);
      } catch {
        reveal = {};
      }
      const res = await fetch(`/api/picks/${id}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...reveal, demoScore: { home, away } }),
      });
      const d = await res.json();
      if (!res.ok) setError(d.error ?? "grading failed");
      else setPick(d.pick);
    } finally {
      setGrading(false);
    }
  }

  if (loading)
    return (
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-5 py-24 text-dim">
        <LoaderCircle className="animate-spin" size={18} /> Loading pick…
      </div>
    );
  if (!pick)
    return <div className="mx-auto max-w-3xl px-5 py-24 text-dim">Pick not found (in-memory demo data resets on redeploy).</div>;

  const timeline = [
    {
      title: "Commitment sealed",
      done: true,
      body: `sha256:${pick.commitHash}`,
      tx: pick.commitTx,
      ts: pick.committedAt,
      Icon: Lock,
    },
    {
      title: "Selection revealed",
      done: pick.status !== "sealed",
      body:
        pick.status === "sealed"
          ? "Hidden until the match ends."
          : `${pick.selection} @ ${pick.oddsAtCommit.toFixed(2)} · salt ${pick.salt}`,
      tx: pick.revealTx,
      ts: null,
      Icon: FileCheck2,
    },
    {
      title: "Graded against TxLINE",
      done: pick.status === "won" || pick.status === "lost",
      body: pick.finalScore
        ? `Final ${pick.finalScore.home}-${pick.finalScore.away} → ${pick.status === "won" ? "correct" : "missed"}${pick.simulated ? " · simulated score (feed had no result)" : ""}${pick.onChainCheck?.fixtureValid ? " · validate_stat: fixture proof PASSED on devnet" : ""}${pick.proofRoot ? ` · Merkle root ${String(pick.proofRoot).slice(0, 18)}…` : ""}`
        : "Waiting for a verified final score.",
      tx: pick.gradeTx,
      ts: null,
      Icon: pick.status === "lost" ? XCircle : CheckCircle2,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">Match replay</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">{pick.fixtureLabel}</h1>
      <p className="mt-2 text-dim">
        Pick <span className="font-mono text-sm">{pick.id}</span> · sealed{" "}
        {new Date(pick.committedAt).toLocaleString()}
      </p>

      <div className="mt-10 flex flex-col gap-0">
        {timeline.map((t, i) => (
          <motion.div
            key={t.title}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12 }}
            className="relative flex gap-4 pb-10 last:pb-0"
          >
            {i < timeline.length - 1 && (
              <span className="absolute left-[15px] top-8 h-full w-px bg-line" />
            )}
            <span
              className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                t.done ? "border-accent/50 bg-accent/10 text-accent" : "hairline bg-raise text-dim"
              }`}
            >
              <t.Icon size={15} />
            </span>
            <div className="min-w-0">
              <p className="font-medium">{t.title}</p>
              <p className="mt-1 break-all font-mono text-xs text-dim">{t.body}</p>
              {t.tx && (
                <a
                  href={explorer(t.tx)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1.5 rounded border border-accent/30 bg-accent/5 px-2 py-0.5 font-mono text-[11px] text-accent hover:bg-accent/10"
                >
                  devnet receipt · {t.tx.slice(0, 6)}…{t.tx.slice(-4)} <ExternalLink size={10} />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border hairline bg-raise p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-medium">
              <ShieldCheck size={18} className="text-accent" /> Check gate: run TxLINE&apos;s program yourself
            </h2>
            <p className="mt-1 max-w-lg text-sm text-dim">
              This executes the <span className="font-mono text-xs">validate_stat</span> instruction
              on Solana devnet with this fixture&apos;s Merkle proof material. The program — not
              ProofCast — walks the proof against the daily root stored on-chain.
            </p>
          </div>
          <button
            onClick={runOnChainCheck}
            disabled={checking}
            className="inline-flex items-center gap-2 rounded-full border border-accent/50 px-5 py-2.5 text-sm text-accent transition-colors hover:bg-accent/10 disabled:opacity-60"
          >
            {checking && <LoaderCircle className="animate-spin" size={14} />}
            Run on-chain check
          </button>
        </div>
        {check && (
          <div className="mt-4 rounded-xl border hairline bg-bg p-4">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className={`rounded-full border px-3 py-1 ${check.fixtureValid ? "border-accent/40 text-accent" : "hairline text-dim"}`}>
                fixture proof vs on-chain root: {check.fixtureValid ? "PASSED" : "not proven"}
              </span>
              <span className={`rounded-full border px-3 py-1 ${check.valid ? "border-accent/40 text-accent" : "border-amber/40 text-amber"}`}>
                stat-level check: {check.valid ? "PASSED" : check.error ?? "failed"}
              </span>
            </div>
            {check.rootsPda && (
              <p className="mt-3 font-mono text-[11px] text-dim">
                program {pick ? "" : ""}{check.program.slice(0, 8)}… · daily roots PDA{" "}
                <a
                  className="text-accent hover:underline"
                  href={`https://explorer.solana.com/address/${check.rootsPda}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {check.rootsPda.slice(0, 8)}…{check.rootsPda.slice(-6)}
                </a>
              </p>
            )}
            {check.logs && check.logs.length > 0 && (
              <pre className="mt-3 overflow-x-auto rounded-lg border hairline p-3 font-mono text-[11px] leading-relaxed text-dim">
                {check.logs.join("\n")}
              </pre>
            )}
          </div>
        )}
      </div>

      {pick.status === "sealed" && (
        <div className="mt-10 rounded-2xl border hairline bg-raise p-6">
          <h2 className="font-medium">Settle this pick</h2>
          <p className="mt-1 text-sm text-dim">
            In production a keeper grades picks the moment TxLINE publishes the
            verified result. For fixtures without a final score on the feed yet,
            enter one to run the exact same settlement path.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <input
              type="number"
              min={0}
              value={home}
              onChange={(e) => setHome(Number(e.target.value))}
              className="w-16 rounded-xl border hairline bg-bg p-2 text-center font-mono outline-none focus:border-accent-dim"
            />
            <span className="text-dim">—</span>
            <input
              type="number"
              min={0}
              value={away}
              onChange={(e) => setAway(Number(e.target.value))}
              className="w-16 rounded-xl border hairline bg-bg p-2 text-center font-mono outline-none focus:border-accent-dim"
            />
            <button
              onClick={grade}
              disabled={grading}
              className="ml-auto inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-[#04140d] disabled:opacity-60"
            >
              {grading && <LoaderCircle className="animate-spin" size={14} />}
              Reveal + grade
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        </div>
      )}
    </div>
  );
}
