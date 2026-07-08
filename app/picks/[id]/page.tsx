"use client";

import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, XCircle, ExternalLink, LoaderCircle, FileCheck2 } from "lucide-react";
import type { Pick } from "@/lib/protocol";

const explorer = (sig: string) => `https://explorer.solana.com/tx/${sig}?cluster=devnet`;

export default function PickPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [pick, setPick] = useState<Pick | null>(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [home, setHome] = useState(2);
  const [away, setAway] = useState(1);

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
      const res = await fetch(`/api/picks/${id}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demoScore: { home, away } }),
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
        ? `Final ${pick.finalScore.home}-${pick.finalScore.away} → ${pick.status === "won" ? "correct" : "missed"}${pick.proofRoot ? ` · Merkle root ${String(pick.proofRoot).slice(0, 18)}…` : ""}`
        : "Waiting for a verified final score.",
      tx: pick.gradeTx,
      ts: null,
      Icon: pick.status === "lost" ? XCircle : CheckCircle2,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-display text-4xl tracking-tight">{pick.fixtureLabel}</h1>
      <p className="mt-2 text-dim">
        Pick <span className="font-mono text-sm">{pick.id}</span> · committed{" "}
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
                  className="mt-1 inline-flex items-center gap-1 text-xs text-accent hover:underline"
                >
                  Devnet receipt <ExternalLink size={11} />
                </a>
              )}
            </div>
          </motion.div>
        ))}
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
