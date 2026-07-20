import { clsx } from "clsx";

// Every number in ProofCast lives in mono with tabular figures — odds, accuracy,
// ROI, bond size, timestamps, Merkle roots. This is the "terminal receipt"
// texture the brand runs on. Use <Num> instead of raw text for any figure.
export function Num({
  children,
  className,
  tone,
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "pos" | "neg" | "dim" | "accent";
}) {
  return (
    <span
      className={clsx(
        "font-mono tabular-nums",
        tone === "pos" && "text-accent",
        tone === "neg" && "text-danger",
        tone === "dim" && "text-dim",
        tone === "accent" && "text-accent",
        className,
      )}
    >
      {children}
    </span>
  );
}

// Signed value helper: prefixes + / − and colors by direction (color-blind safe
// because the sign carries the meaning, not the color alone).
export function Signed({
  value,
  suffix = "",
  decimals = 1,
  className,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const positive = value >= 0;
  const sign = positive ? "+" : "−";
  return (
    <Num tone={positive ? "pos" : "neg"} className={className}>
      {sign}
      {Math.abs(value).toFixed(decimals)}
      {suffix}
    </Num>
  );
}
