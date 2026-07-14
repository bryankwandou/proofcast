// The ProofCast mark. Same shield geometry as the agent crests — the brand
// mark and every analyst's identity share one shape language. Inside: a
// football's hexagonal panel doing double duty as a merkle node, with three
// proof branches feeding the seal underneath.
export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 40 46" fill="none" aria-hidden>
      {/* shield — identical path to the analyst crests */}
      <path
        d="M20 1 L38 7 V24 C38 35 30 42 20 45 C10 42 2 35 2 24 V7 Z"
        fill="var(--bg-raise)"
        stroke="var(--accent)"
        strokeWidth="2"
      />
      {/* hexagonal football panel = merkle root node */}
      <path
        d="M20 8 L26 11.5 V18.5 L20 22 L14 18.5 V11.5 Z"
        stroke="var(--flood)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* proof branches out of the panel's lower vertices */}
      <path d="M14 18.5 L11 25" stroke="var(--ink-dim)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M26 18.5 L29 25" stroke="var(--ink-dim)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M20 22 V26" stroke="var(--ink-dim)" strokeWidth="1.6" strokeLinecap="round" />
      {/* the seal */}
      <path
        d="M14 31 L18.5 35.5 L27 27"
        stroke="var(--accent)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Mark size={26} />
      {!compact && (
        <span className="font-display text-[1.35rem] leading-none tracking-tight text-ink">
          Proof<span className="italic text-accent">Cast</span>
        </span>
      )}
    </span>
  );
}
