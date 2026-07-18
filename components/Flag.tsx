import { flagClass, isoFor } from "@/lib/flags";

// A real SVG country flag with a gentle broadcast-style wave. Renders on every
// OS (Windows included), unlike emoji flags. Size is set by the caller; the
// wave respects prefers-reduced-motion via the .flag-wave rule in globals.css.
export function Flag({ name, className = "" }: { name: string; className?: string }) {
  const iso = isoFor(name);
  if (!iso) {
    return <span className={`inline-block h-3.5 w-3.5 rounded-full bg-accent/30 ${className}`} />;
  }
  return (
    <span
      className={`flag-wave ${flagClass(name)} ${className}`}
      title={name}
      style={{ borderRadius: 3, boxShadow: "0 0 0 1px rgb(255 255 255 / 0.12)" }}
    />
  );
}
