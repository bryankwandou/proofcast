import React from "react";
import { interpolate } from "remotion";
import { C, serif } from "./theme";
import { useEnter } from "./lib";

// Animated ProofCast mark: merkle branches converge into a sealed check.
export const Mark: React.FC<{ size?: number; delay?: number }> = ({ size = 96, delay = 0 }) => {
  const e = useEnter(delay, 200);
  const check = useEnter(delay + 10, 200);
  const dash = 60;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect
        x="1.5"
        y="1.5"
        width="29"
        height="29"
        rx="8"
        stroke={C.accent}
        strokeWidth="1.5"
        style={{ opacity: e }}
      />
      <path d="M7 8v6c0 1.7 1.3 3 3 3h3" stroke={C.dim} strokeWidth="1.6" strokeLinecap="round" style={{ opacity: e }} />
      <path d="M25 8v6c0 1.7-1.3 3-3 3h-3" stroke={C.dim} strokeWidth="1.6" strokeLinecap="round" style={{ opacity: e }} />
      <path d="M16 6v11" stroke={C.dim} strokeWidth="1.6" strokeLinecap="round" style={{ opacity: e }} />
      <path
        d="M10.5 21.5l3.5 3.5 7.5-7.5"
        stroke={C.accent}
        strokeWidth="2.4"
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
