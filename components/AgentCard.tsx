import { ShieldCheck } from "lucide-react";
import type { Analyst, Pick } from "@/lib/protocol";
import { accuracyOf } from "@/lib/protocol";

// Agent identity: every analyst renders as a touchline agent — a crest and
// kit derived deterministically from their wallet (same wallet, same colors,
// forever), a rank earned only from proof-graded picks, and a league-style
// form guide. Nothing here is editable; identity is a function of the record.

// ── Deterministic crest ───────────────────────────────────────────────────────
function hashChars(s: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < s.length; i++) out.push(s.charCodeAt(i));
  return out;
}

export type Kit = {
  primary: string;   // hsl string
  secondary: string;
  pattern: "stripes" | "hoops" | "sash" | "solid";
};

export function kitFor(wallet: string): Kit {
  const h = hashChars(wallet);
  const sum = (a: number, b: number) => h.slice(a, b).reduce((x, y) => x + y, 0);
  const hue1 = sum(0, 8) % 360;
  const hue2 = (hue1 + 120 + (sum(8, 16) % 120)) % 360;
  const patterns: Kit["pattern"][] = ["stripes", "hoops", "sash", "solid"];
  return {
    primary: `hsl(${hue1} 62% 46%)`,
    secondary: `hsl(${hue2} 58% 60%)`,
    pattern: patterns[sum(16, 24) % 4],
  };
}

export function Crest({ wallet, size = 56 }: { wallet: string; size?: number }) {
  const kit = kitFor(wallet);
  const id = wallet.slice(0, 8);
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 40 46" aria-hidden>
      <defs>
        <clipPath id={`shield-${id}`}>
          <path d="M20 1 L38 7 V24 C38 35 30 42 20 45 C10 42 2 35 2 24 V7 Z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#shield-${id})`}>
        <rect width="40" height="46" fill={kit.primary} />
        {kit.pattern === "stripes" && (
          <>
            <rect x="8" width="6" height="46" fill={kit.secondary} />
            <rect x="20" width="6" height="46" fill={kit.secondary} />
            <rect x="32" width="6" height="46" fill={kit.secondary} />
          </>
        )}
        {kit.pattern === "hoops" && (
          <>
            <rect y="8" width="40" height="6" fill={kit.secondary} />
            <rect y="20" width="40" height="6" fill={kit.secondary} />
            <rect y="32" width="40" height="6" fill={kit.secondary} />
          </>
        )}
        {kit.pattern === "sash" && (
          <polygon points="0,0 12,0 40,36 40,46 28,46 0,10" fill={kit.secondary} />
        )}
      </g>
      <path
        d="M20 1 L38 7 V24 C38 35 30 42 20 45 C10 42 2 35 2 24 V7 Z"
        fill="none"
        stroke="rgb(255 255 255 / 0.35)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

// ── Rank & XP: earned from proof-graded picks only ────────────────────────────
// XP = graded volume × quality. Wins at honest odds earn more than favorites;
// nothing is purchasable and demo history earns nothing.
export function xpOf(picks: Pick[]): number {
  return picks
    .filter((p) => !p.demo && (p.status === "won" || p.status === "lost"))
    .reduce((xp, p) => xp + 10 + (p.status === "won" ? Math.round(15 * Math.min(p.oddsAtCommit, 4)) : 0), 0);
}

export function rankOf(graded: number, accuracy: number): string {
  if (graded >= 20 && accuracy >= 0.65) return "Director";
  if (graded >= 10 && accuracy >= 0.6) return "Chief Scout";
  if (graded >= 5) return "Analyst";
  return "Scout";
}

// ── Form guide: last five graded results, newest first ────────────────────────
export function FormGuide({ picks }: { picks: Pick[] }) {
  const graded = picks
    .filter((p) => p.status === "won" || p.status === "lost" || p.status === "void")
    .slice(0, 5);
  if (graded.length === 0) return <span className="text-xs text-dim">no graded picks yet</span>;
  return (
    <span className="flex items-center gap-1.5">
      {graded.map((p) => (
        <span
          key={p.id}
          title={`${p.fixtureLabel} — ${p.status}`}
          className={`flex h-6 w-6 items-center justify-center rounded font-mono text-[11px] font-semibold ${
            p.status === "won"
              ? "bg-accent/15 text-accent"
              : p.status === "lost"
                ? "bg-danger/15 text-danger"
                : "bg-chalk/50 text-dim"
          }`}
        >
          {p.status === "won" ? "W" : p.status === "lost" ? "L" : "V"}
        </span>
      ))}
    </span>
  );
}

// ── The card ──────────────────────────────────────────────────────────────────
export default function AgentCard({ analyst, picks }: { analyst: Analyst; picks: Pick[] }) {
  const stats = accuracyOf(picks);
  const rank = rankOf(stats.graded, stats.accuracy);
  const floorHealthy = stats.graded === 0 || stats.accuracy >= analyst.accuracyFloor;
  const kit = kitFor(analyst.wallet);

  return (
    <div className="floodlit relative overflow-hidden rounded-2xl border hairline bg-raise p-6">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1"
        style={{ background: `linear-gradient(90deg, ${kit.primary}, ${kit.secondary})` }}
      />
      <div className="flex flex-wrap items-start gap-5">
        <Crest wallet={analyst.wallet} size={64} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-display text-3xl tracking-tight">{analyst.name}</h1>
            <span className="rounded-full border border-accent/40 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
              {rank}
            </span>
          </div>
          <p className="mt-1 text-sm text-dim">
            @{analyst.handle} · on the touchline since {analyst.joined}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            <span className="text-dim">Form</span>
            <FormGuide picks={picks} />
          </div>
        </div>
        <div className="text-right text-sm">
          <div className="flex items-center justify-end gap-2 text-accent">
            <ShieldCheck size={15} />
            <span className="font-mono">{analyst.bondUsdc.toLocaleString()} USDC</span>
          </div>
          <p className="mt-1 text-xs text-dim">
            floor {(analyst.accuracyFloor * 100).toFixed(0)}% ·{" "}
            <span className={floorHealthy ? "text-accent" : "text-danger"}>
              {floorHealthy ? "intact" : "breached"}
            </span>
          </p>
          <p className="mt-1 text-xs text-dim">
            {analyst.subscribers.toLocaleString()} subscribers · {analyst.monthlyPriceUsdc} USDC/mo
          </p>
        </div>
      </div>
    </div>
  );
}
