"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, ShieldCheck, ExternalLink } from "lucide-react";

// Public verification console. Anyone — a subscriber, a judge, a rival — can
// take any fixture on the feed and make the TxLINE program on Solana devnet
// re-verify its Merkle proof against the daily root stored on-chain. ProofCast
// is not in the trust path: the program's own logs are the receipt.

type Match = {
  id: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  status: string;
  score: { home: number; away: number };
};

type OnChainCheck = {
  valid: boolean;
  fixtureValid: boolean;
  program: string;
  rootsPda: string | null;
  statKey: number;
  statValue: number;
  ts: number;
  logs?: string[];
  error?: string;
};

const STATS = [
  { key: 1, label: "Goals — home" },
  { key: 2, label: "Goals — away" },
];

const TXLINE_PROGRAM = "6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J";

export default function VerifyPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [archive, setArchive] = useState<{ id: string; label: string }[]>([]);
  const [fixtureId, setFixtureId] = useState("");
  const [statKey, setStatKey] = useState(1);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<OnChainCheck | null>(null);

  useEffect(() => {
    fetch("/api/fixtures")
      .then((r) => r.json())
      .then((d) => {
        const m: Match[] = d.matches ?? [];
        setMatches(m);
        setFixtureId((cur) => cur || (m[0]?.id ?? ""));
      })
      .catch(() => setMatches([]));
    // Tournament archive: fixtures our picks were graded against. The feed
    // rotates past finished competitions, but their Merkle roots stay on-chain
    // forever — these are the fixtures a proof can still be replayed for.
    fetch("/api/picks")
      .then((r) => r.json())
      .then((d) => {
        const seen = new Set<string>();
        const arch: { id: string; label: string }[] = [];
        for (const p of d.picks ?? []) {
          const id = String(p.fixtureId ?? "");
          if (!/^\d+$/.test(id) || seen.has(id)) continue;
          seen.add(id);
          arch.push({ id, label: p.fixtureLabel ?? id });
        }
        setArchive(arch);
        // Default to the archive: those fixtures have proofs that pass today.
        if (arch.length) setFixtureId(arch[0].id);
      })
      .catch(() => setArchive([]));
  }, []);

  async function run() {
    if (!fixtureId) return;
    setRunning(true);
    setResult(null);
    try {
      const r = await fetch(`/api/verify?fixtureId=${fixtureId}&seq=latest&statKey=${statKey}`);
      setResult(await r.json());
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber">VAR review room</p>
      <h1 className="mt-2 flex items-center gap-3 font-display text-4xl tracking-tight sm:text-5xl">
        <ShieldCheck className="text-accent" size={36} /> Check it yourself
      </h1>
      <p className="mt-4 leading-relaxed text-dim">
        Don&apos;t take our word for anything. Pick a fixture and this room will execute the{" "}
        <span className="font-mono text-sm">validate_stat</span> instruction of TxLINE&apos;s
        program on Solana devnet with that fixture&apos;s Merkle proof material. The program walks
        the proof up to the daily root already stored on-chain — if the data had been altered
        anywhere between the feed and this page, the check would fail. The raw program logs are
        shown below, unedited.
      </p>

      <div className="mt-8 flex flex-wrap items-end gap-3 rounded-2xl border hairline bg-raise p-5">
        <label className="flex min-w-56 flex-1 flex-col gap-1.5 text-sm text-dim">
          Fixture
          <select
            value={fixtureId}
            onChange={(e) => setFixtureId(e.target.value)}
            className="rounded-lg border hairline bg-bg px-3 py-2.5 text-ink outline-none focus:border-accent/60"
          >
            {archive.length > 0 && (
              <optgroup label="Tournament archive (graded on-chain)">
                {archive.map((f) => (
                  <option key={`a-${f.id}`} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </optgroup>
            )}
            {matches.length > 0 && (
              <optgroup label="Live feed">
                {matches.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.homeTeam.name} vs {m.awayTeam.name} ({m.status})
                  </option>
                ))}
              </optgroup>
            )}
            {matches.length === 0 && archive.length === 0 && <option value="">loading feed…</option>}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-dim">
          Stat to prove
          <select
            value={statKey}
            onChange={(e) => setStatKey(Number(e.target.value))}
            className="rounded-lg border hairline bg-bg px-3 py-2.5 text-ink outline-none focus:border-accent/60"
          >
            {STATS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={run}
          disabled={running || !fixtureId}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-[#04140d] transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {running && <LoaderCircle className="animate-spin" size={14} />}
          {running ? "Reviewing on devnet…" : "Send it to VAR"}
        </button>
        <p className="w-full font-mono text-[11px] text-dim">
          program under review:{" "}
          <a
            className="text-accent hover:underline"
            href={`https://explorer.solana.com/address/${TXLINE_PROGRAM}?cluster=devnet`}
            target="_blank"
            rel="noreferrer"
          >
            {TXLINE_PROGRAM} <ExternalLink className="inline" size={10} />
          </a>{" "}
          (TxLINE devnet)
        </p>
      </div>

      {result && (
        <div className={`mt-6 rounded-2xl border bg-raise p-5 ${result.fixtureValid ? "var-pass border-accent/40" : "hairline"}`}>
          <div className="flex flex-wrap gap-2 text-xs">
            <span
              className={`rounded-full border px-3 py-1 ${
                result.fixtureValid ? "border-accent/40 text-accent" : "hairline text-dim"
              }`}
            >
              fixture proof vs on-chain root: {result.fixtureValid ? "PASSED" : "not proven"}
            </span>
            <span
              className={`rounded-full border px-3 py-1 ${
                result.valid ? "border-accent/40 text-accent" : "border-amber/40 text-amber"
              }`}
            >
              stat-level check: {result.valid ? `PASSED (value ${result.statValue})` : result.error ?? "failed"}
            </span>
          </div>
          <div className="mt-4 grid gap-1 font-mono text-[11px] text-dim sm:grid-cols-2">
            <span>
              program{" "}
              <a
                className="text-accent hover:underline"
                href={`https://explorer.solana.com/address/${result.program}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
              >
                {result.program.slice(0, 10)}…{result.program.slice(-6)} <ExternalLink className="inline" size={10} />
              </a>
            </span>
            {result.rootsPda && (
              <span>
                daily roots PDA{" "}
                <a
                  className="text-accent hover:underline"
                  href={`https://explorer.solana.com/address/${result.rootsPda}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {result.rootsPda.slice(0, 10)}…{result.rootsPda.slice(-6)} <ExternalLink className="inline" size={10} />
                </a>
              </span>
            )}
          </div>
          {result.logs && result.logs.length > 0 && (
            <pre className="mt-4 overflow-x-auto rounded-xl border hairline bg-bg p-4 font-mono text-[11px] leading-relaxed text-dim">
              {result.logs.join("\n")}
            </pre>
          )}
        </div>
      )}

      <div className="mt-10 rounded-2xl border hairline p-5 text-sm leading-relaxed text-dim">
        <p className="font-medium text-ink">How this differs from &quot;trust our API&quot;</p>
        <p className="mt-2">
          A pre-match snapshot will pass the fixture-level proof but report{" "}
          <em>no stats yet</em> at the stat level — that is the honest answer, and the program says
          it, not us. Once the match is underway, the same check proves the exact goal count against
          the root on-chain. ProofCast&apos;s settlement runs this identical gate before marking any
          grade proof-backed.
        </p>
      </div>
    </div>
  );
}
