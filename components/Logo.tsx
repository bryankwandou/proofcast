// ProofCast mark — notched seal ring with a checkmark inside.
// Three-layer depth: outer dashed ring (the stamp edge), a solid inner ring,
// and the check. A gradient arc behind the check adds dimension without
// introducing a second brand color.
export function Mark({ size = 28 }: { size?: number }) {
  const id = `pc-g-${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      className="pc-mark"
    >
      <defs>
        {/* radial glow behind the check — accent fading to transparent */}
        <radialGradient id={id} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* glow disc */}
      <circle cx="24" cy="24" r="18" fill={`url(#${id})`} />
      {/* outer notched stamp ring */}
      <circle
        cx="24"
        cy="24"
        r="18"
        stroke="var(--accent)"
        strokeWidth="3.2"
        strokeDasharray="1.6 3.4"
        className="pc-mark-ring"
      />
      {/* inner solid ring — slightly thicker for depth */}
      <circle cx="24" cy="24" r="12.5" stroke="var(--accent)" strokeWidth="2.2" opacity="0.6" />
      {/* the check — slightly bolder */}
      <path
        d="M17.5 24.5 L22.5 29.5 L31.5 19"
        stroke="var(--accent)"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pc-mark-check"
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
