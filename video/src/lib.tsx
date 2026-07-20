import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C } from "./theme";

// ── Background: deep charcoal with a faint grid and top glow ──────────────────
export const Backdrop: React.FC<{ children: React.ReactNode; glow?: boolean }> = ({
  children,
  glow = true,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.line}55 1px, transparent 1px), linear-gradient(90deg, ${C.line}55 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
          opacity: 0.5,
          maskImage: "radial-gradient(70% 70% at 50% 40%, black, transparent)",
          WebkitMaskImage: "radial-gradient(70% 70% at 50% 40%, black, transparent)",
        }}
      />
      {glow && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(55% 45% at 50% 0%, ${C.accent}22, transparent)`,
          }}
        />
      )}
      {/* Grain/dither overlay — breaks up 8-bit banding on the dark gradient
          (the "pecah" look) and adds a subtle film texture. */}
      <AbsoluteFill style={{ opacity: 0.06, mixBlendMode: "overlay", pointerEvents: "none" }}>
        <svg width="100%" height="100%">
          <filter id="pc-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#pc-grain)" />
        </svg>
      </AbsoluteFill>
      {children}
    </AbsoluteFill>
  );
};

// Spring helper with the app's easing feel (no bounce by default).
export const useEnter = (delay: number, damping = 200) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, mass: 0.8 } });
};

// Fade + rise wrapper.
export const Rise: React.FC<{
  delay?: number;
  y?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, y = 28, children, style }) => {
  const e = useEnter(delay);
  return (
    <div
      style={{
        opacity: e,
        transform: `translateY(${interpolate(e, [0, 1], [y, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Scene wrapper: fades the whole scene in and out at its edges.
export const Scene: React.FC<{
  durationInFrames: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ durationInFrames, children, style }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 12, durationInFrames - 12, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return (
    <AbsoluteFill
      style={{
        opacity,
        justifyContent: "center",
        alignItems: "center",
        padding: 96,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// Kicker label used at the top of scenes.
export const Kicker: React.FC<{ children: React.ReactNode; delay?: number; mono?: string }> = ({
  children,
  delay = 0,
}) => {
  const e = useEnter(delay);
  return (
    <div
      style={{
        opacity: e,
        color: C.accent,
        letterSpacing: 6,
        fontSize: 20,
        textTransform: "uppercase",
        marginBottom: 28,
      }}
    >
      {children}
    </div>
  );
};

// Count-up number that eases to a value.
export const CountUp: React.FC<{
  to: number;
  delay?: number;
  decimals?: number;
  suffix?: string;
  style?: React.CSSProperties;
}> = ({ to, delay = 0, decimals = 0, suffix = "", style }) => {
  const e = useEnter(delay, 60);
  const v = interpolate(e, [0, 1], [0, to], { extrapolateRight: "clamp" });
  return (
    <span style={style}>
      {v.toFixed(decimals)}
      {suffix}
    </span>
  );
};

export const truncMid = (s: string, head = 8, tail = 8) =>
  s.length <= head + tail ? s : `${s.slice(0, head)}…${s.slice(-tail)}`;
