"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, ExternalLink, LoaderCircle } from "lucide-react";
import type { TxMatch } from "@/lib/txline";

type Sel = "home" | "draw" | "away";

export default function MatchesPage() {
  const [matches, setMatches] = useState<TxMatch[]>([]);
  const [source, setSource] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<TxMatch | null>(null);
  const [sel, setSel] = useState<Sel>("home");
  const [reasoning, setReasoning] = useState("");
  const [sealing, setSealing] = useState(false);
  const [result, setResult] = useState<{ id: string; hash: string; explorer: string | null } | null>(null);

  useEffect(() => {
    fetch("/api/fixtures")
      .then((r) => r.json())
      .then((d) => {
        setMatches(d.matches ?? []);
        setSource(d.source ?? "");
      })
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const live = matches.filter((m) => m.status === "live" || m.status === "ht");
    const pre = matches.filter((m) => m.status === "pre");
    const done = matches.filter((m) => m.status === "ft");
    return { live, pre, done };
  }, [matches]);

  async function seal() {
    if (!active) return;
    setSealing(true);
    try {
      const odds = active.odds[sel] || 2.0;
      const analystId = "a-tunde";

      // Seal locally: the hash is computed in the browser and the salt never
      // leaves this device until reveal. The server receives only the hash.
      const saltBytes = new Uint8Array(16);
      crypto.getRandomValues(saltBytes);
      const salt = Array.from(saltBytes, (b) => b.toString(16).padStart(2, "0")).join("");
      const payload = `${analystId}|${active.id}|${sel}|${odds.toFixed(2)}|${salt}`;
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
      const commitHash = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");

      const res = await fetch("/api/picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analystId,
          fixtureId: active.id,
          fixtureLabel: `${active.homeTeam.name} vs ${active.awayTeam.name}`,
          commitHash,
          oddsAtCommit: odds,
          kickoff: active.startTime,
          reasoning,
        }),
      });
      const d = await res.json();
      // Reveal material stays local until the match ends.
      localStorage.setItem(`proofcast:${d.pick.id}`, JSON.stringify({ salt, selection: sel }));
      setResult({ id: d.pick.id, hash: d.pick.commitHash, explorer: d.explorer });
    } finally {
      setSealing(false);
    }
  }

  function closeModal() {
    setActive(null);
    setResult(null);
    setReasoning("");
    setSel("home");
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Matchday board</h1>
      <p className="mt-3 max-w-xl text-dim">
        Straight from the TxLINE feed{source === "txline" ? "" : " (demo data while the feed is unreachable)"}.
        Call your play before the whistle — it is hashed on your device and anchored
        on-chain before anyone, including us, can read it.
      </p>

      {loading ? (
        <div className="mt-16 flex items-center gap-2 text-dim">
          <LoaderCircle className="animate-spin" size={18} /> Loading the feed…
        </div>
      ) : (
        <>
          {(["live", "pre", "done"] as const).map((k) => {
            const list = grouped[k];
            if (!list.length) return null;
            const title = k === "live" ? "Live now" : k === "pre" ? "Upcoming" : "Finished";
            return (
              <section key={k} className="mt-12">
                <h2 className="flex items-center gap-2 text-sm uppercase tracking-widest text-dim">
                  {k === "live" && <span className="live-dot h-2 w-2 rounded-full bg-accent" />}
                  {title}
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {list.slice(0, 12).map((m) => (
                    <motion.button
                      key={m.id}
                      whileHover={{ y: -3 }}
                      onClick={() => setActive(m)}
                      className="floodlit rounded-2xl border hairline bg-raise p-5 text-left"
                    >
                      <p className="flex items-center justify-between text-xs text-dim">
                        <span>{m.stage}</span>
                        {m.status === "pre" && (
                          <span className="font-mono">
                            KO {new Date(m.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-medium">{m.homeTeam.name}</span>
                        <span className="font-mono text-lg">{m.status === "pre" ? "–" : m.score.home}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="font-medium">{m.awayTeam.name}</span>
                        <span className="font-mono text-lg">{m.status === "pre" ? "–" : m.score.away}</span>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-chalk/30 p-1 font-mono text-xs text-dim">
                        <span className="rounded px-2 py-1 text-center">1 {m.odds.home.toFixed(2)}</span>
                        <span className="rounded px-2 py-1 text-center">X {m.odds.draw.toFixed(2)}</span>
                        <span className="rounded px-2 py-1 text-center">2 {m.odds.away.toFixed(2)}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="w-full max-w-md rounded-3xl border hairline bg-raise p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {!result ? (
                <>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-dim">Call the play</p>
                  <h3 className="font-display mt-1 text-2xl">
                    {active.homeTeam.name} vs {active.awayTeam.name}
                  </h3>
                  <p className="mt-1 text-sm text-dim">
                    Hashed on this device with a private salt. Only the hash goes
                    on-chain before the whistle — the play stays in your pocket.
                  </p>
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {(
                      [
                        ["home", active.homeTeam.code, active.odds.home],
                        ["draw", "X", active.odds.draw],
                        ["away", active.awayTeam.code, active.odds.away],
                      ] as [Sel, string, number][]
                    ).map(([key, label, odd]) => (
                      <button
                        key={key}
                        onClick={() => setSel(key)}
                        className={`rounded-xl border p-3 text-center transition-colors ${
                          sel === key ? "border-accent bg-accent/10 text-accent" : "hairline text-dim hover:text-ink"
                        }`}
                      >
                        <div className="text-sm font-medium">{label}</div>
                        <div className="font-mono text-xs">{odd.toFixed(2)}</div>
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                    placeholder="Reasoning (revealed with the pick after the match)"
                    className="mt-4 h-20 w-full resize-none rounded-xl border hairline bg-bg p-3 text-sm outline-none focus:border-accent-dim"
                  />
                  <button
                    onClick={seal}
                    disabled={sealing}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3 font-medium text-[#04140d] transition-transform hover:scale-[1.02] disabled:opacity-60"
                  >
                    {sealing ? <LoaderCircle className="animate-spin" size={16} /> : <Lock size={16} />}
                    {sealing ? "Anchoring on devnet…" : "Seal the play"}
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
                    className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/15"
                  >
                    <Lock className="text-accent" size={24} />
                  </motion.div>
                  <h3 className="font-display mt-4 text-2xl">Play sealed</h3>
                  <div className="mt-3 rounded-xl border border-accent/30 bg-bg p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Stadium screen</p>
                    <p className="mt-1.5 break-all font-mono text-xs leading-relaxed text-ink">
                      sha256:{result.hash}
                    </p>
                  </div>
                  {result.explorer ? (
                    <a
                      href={result.explorer}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
                    >
                      View the devnet receipt <ExternalLink size={14} />
                    </a>
                  ) : (
                    <p className="mt-4 text-xs text-dim">
                      Devnet receipt pending — the commitment hash above is your local proof.
                    </p>
                  )}
                  <div className="mt-5 flex gap-2">
                    <a href={`/picks/${result.id}`} className="flex-1 rounded-full bg-accent py-2.5 text-sm font-medium text-[#04140d]">
                      Open the pick
                    </a>
                    <button onClick={closeModal} className="flex-1 rounded-full border hairline py-2.5 text-sm text-dim hover:text-ink">
                      Done
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
