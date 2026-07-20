// ProofCast mark — "Seal-Check". One idea: a notched wax seal whose interior
// is a checkmark. A stamp that means verified. It reads at 16px and scales to a
// hero. The analyst crests keep the shield shape (that is identity, not brand);
// this seal is the protocol's own mark.
export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      className="pc-mark"
    >
      {/* notched seal ring — the wax stamp edge */}
      <circle
        cx="24"
        cy="24"
        r="18"
        stroke="var(--accent)"
        strokeWidth="3.2"
        strokeDasharray="1.6 3.4"
        className="pc-mark-ring"
      />
      {/* inner containment ring */}
      <circle cx="24" cy="24" r="12.5" stroke="var(--accent)" strokeWidth="2" opacity="0.55" />
      {/* the seal: a checkmark struck through the center */}
      <path
        d="M18 24.5 L22.5 29 L31 19.5"
        stroke="var(--accent)"
        strokeWidth="3.4"
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
