import React from "react";
import { interpolate } from "remotion";
import { C, serif } from "./theme";
import { useEnter } from "./lib";

// ProofCast mark — "Seal-Check", identical to the live site (components/Logo.tsx):
// a notched wax-seal ring whose interior is a checkmark. A stamp that means
// verified. Animated: the seal ring fades in and the check is struck through.
export const Mark: React.FC<{ size?: number; delay?: number }> = ({ size = 96, delay = 0 }) => {
  const e = useEnter(delay, 200);
  const check = useEnter(delay + 10, 200);
  const dash = 22;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* notched seal ring — the wax stamp edge, slowly rotating for life */}
      <g
        style={{
          transformOrigin: "24px 24px",
          transform: `rotate(${interpolate(e, [0, 1], [-25, 0])}deg)`,
          opacity: e,
        }}
      >
        <circle
          cx="24"
          cy="24"
          r="18"
          stroke={C.accent}
          strokeWidth="3.2"
          strokeDasharray="1.6 3.4"
        />
      </g>
      {/* inner containment ring */}
      <circle cx="24" cy="24" r="12.5" stroke={C.accent} strokeWidth="2" opacity={0.55 * e} />
      {/* the seal: a checkmark struck through the center, drawn on */}
      <path
        d="M18 24.5 L22.5 29 L31 19.5"
        stroke={C.accent}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dash}
        strokeDashoffset={interpolate(check, [0, 1], [dash, 0])}
      />
    </svg>
  );
};

export const Wordmark: React.FC<{ delay?: number; size?: number }> = ({ delay = 0, size = 44 }) => {
  const e = useEnter(delay);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: e }}>
      <Mark size={size} delay={delay} />
      <span style={{ fontFamily: serif, fontSize: size, color: C.ink, letterSpacing: -1 }}>
        Proof<span style={{ fontStyle: "italic", color: C.accent }}>Cast</span>
      </span>
    </div>
  );
};
