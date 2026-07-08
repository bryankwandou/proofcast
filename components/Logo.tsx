// ProofCast mark: three merkle branches converging into a sealed check.
export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="1.5" y="1.5" width="29" height="29" rx="8" stroke="var(--accent)" strokeWidth="1.5" />
      <path d="M7 8v6c0 1.7 1.3 3 3 3h3" stroke="var(--ink-dim)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M25 8v6c0 1.7-1.3 3-3 3h-3" stroke="var(--ink-dim)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 6v11" stroke="var(--ink-dim)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10.5 21.5l3.5 3.5 7.5-7.5" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Mark />
      {!compact && (
        <span className="font-display text-[1.35rem] leading-none tracking-tight text-ink">
          Proof<span className="italic text-accent">Cast</span>
        </span>
      )}
    </span>
  );
}
