import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { Lock, FileCheck2, Coins, ShieldCheck, Check, X, ArrowRight } from "lucide-react";
import { C, serif, mono, RECEIPTS } from "./theme";
import { Backdrop, Scene, Rise, Kicker, CountUp, useEnter, truncMid } from "./lib";
import { Mark, Wordmark } from "./Mark";

const H = (px: number): React.CSSProperties => ({
  fontFamily: serif,
  fontWeight: 500,
  letterSpacing: -1.5,
  lineHeight: 1.02,
  color: C.ink,
  fontSize: px,
  margin: 0,
});

// ── Scene 1 — Hook ────────────────────────────────────────────────────────────
const Hook: React.FC = () => {
  return (
    <Scene durationInFrames={120}>
      <Kicker delay={6}>ProofCast</Kicker>
      <Rise delay={14}>
        <h1 style={{ ...H(96), textAlign: "center" }}>Anyone can claim a record.</h1>
      </Rise>
      <Rise delay={34} style={{ marginTop: 10 }}>
        <h1 style={{ ...H(96), textAlign: "center", fontStyle: "italic", color: C.accent }}>
          Few can prove one.
        </h1>
      </Rise>
    </Scene>
  );
};

// ── Scene 2 — Problem ─────────────────────────────────────────────────────────
const FailCard: React.FC<{ title: string; body: string; delay: number }> = ({ title, body, delay }) => {
  const e = useEnter(delay);
  return (
    <div
      style={{
        opacity: e,
        transform: `translateY(${interpolate(e, [0, 1], [26, 0])}px)`,
        flex: 1,
        backgroundColor: C.raise,
        border: `1px solid ${C.line}`,
        borderRadius: 20,
        padding: 34,
      }}
    >
      <X size={30} color={C.danger} />
      <div style={{ fontFamily: serif, fontSize: 32, color: C.ink, marginTop: 16 }}>{title}</div>
      <div style={{ fontSize: 22, lineHeight: 1.5, color: C.dim, marginTop: 12 }}>{body}</div>
    </div>
  );
};

const Problem: React.FC = () => {
  return (
    <Scene durationInFrames={180} style={{ alignItems: "flex-start" }}>
      <Kicker delay={6}>The problem</Kicker>
      <Rise delay={12}>
        <h2 style={H(64)}>
          Paid football picks run on <span style={{ color: C.dim, fontStyle: "italic" }}>unverifiable claims.</span>
        </h2>
      </Rise>
      <div style={{ display: "flex", gap: 22, marginTop: 54, width: "100%" }}>
        <FailCard delay={34} title="Deleted losses" body="Losing calls vanish minutes after full time. Buyers only ever see the wins." />
        <FailCard delay={46} title="Backdated wins" body="Screenshots produced after results are known. No timestamp anyone can check." />
        <FailCard delay={58} title="Captured referees" body="Rating sites grade their own sellers. The referee works for one of the teams." />
      </div>
    </Scene>
  );
};

// ── Scene 3 — Mechanism ───────────────────────────────────────────────────────
const Step: React.FC<{ icon: React.ReactNode; label: string; body: string; delay: number; last?: boolean }> = ({
  icon,
  label,
  body,
  delay,
  last,
}) => {
  const e = useEnter(delay);
  return (
    <>
      <div style={{ opacity: e, transform: `scale(${interpolate(e, [0, 1], [0.9, 1])})`, flex: 1, textAlign: "center" }}>
        <div
          style={{
            width: 108,
            height: 108,
            margin: "0 auto",
            borderRadius: 28,
            backgroundColor: C.raise,
            border: `1px solid ${C.accentDim}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
        <div style={{ fontFamily: serif, fontSize: 34, color: C.ink, marginTop: 22 }}>{label}</div>
        <div style={{ fontSize: 21, lineHeight: 1.45, color: C.dim, marginTop: 10, maxWidth: 300, marginLeft: "auto", marginRight: "auto" }}>
          {body}
        </div>
      </div>
      {!last && (
        <div style={{ display: "flex", alignItems: "center", paddingBottom: 90, opacity: e }}>
          <ArrowRight size={38} color={C.accent} />
        </div>
      )}
    </>
  );
};

const Mechanism: React.FC = () => {
  return (
    <Scene durationInFrames={210}>
      <Kicker delay={6}>How it works</Kicker>
      <Rise delay={12} style={{ marginBottom: 60 }}>
        <h2 style={{ ...H(60), textAlign: "center" }}>
          Seal it. Prove it. <span style={{ fontStyle: "italic", color: C.accent }}>Bond it.</span>
        </h2>
      </Rise>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, width: "100%" }}>
        <Step delay={30} icon={<Lock size={46} color={C.accent} />} label="Seal" body="The pick is hashed and anchored on Solana before kickoff. Unreadable, uneditable." />
        <Step delay={48} icon={<FileCheck2 size={46} color={C.accent} />} label="Grade" body="Scored against TxLINE data with a Merkle proof receipt. Not by the platform." />
        <Step delay={66} icon={<Coins size={46} color={C.accent} />} label="Bond" body="A USDC bond backs the accuracy floor. Break it, subscribers get refunded." last />
      </div>
    </Scene>
  );
};

// ── Scene 4 — Pick receipt timeline (the product) ─────────────────────────────
const TimelineRow: React.FC<{
  icon: React.ReactNode;
  title: string;
  body: string;
  tx?: string;
  delay: number;
  last?: boolean;
  done?: boolean;
}> = ({ icon, title, body, tx, delay, last, done = true }) => {
  const e = useEnter(delay);
  return (
    <div style={{ display: "flex", gap: 26, opacity: e, transform: `translateX(${interpolate(e, [0, 1], [-24, 0])}px)` }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            border: `1px solid ${done ? C.accentDim : C.line}`,
            backgroundColor: done ? `${C.accent}18` : C.raise,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
        {!last && <div style={{ width: 2, flex: 1, backgroundColor: C.line, marginTop: 6 }} />}
      </div>
      <div style={{ paddingBottom: last ? 0 : 34 }}>
        <div style={{ fontSize: 30, color: C.ink, fontWeight: 500 }}>{title}</div>
        <div style={{ fontFamily: mono, fontSize: 20, color: C.dim, marginTop: 8 }}>{body}</div>
        {tx && (
          <div style={{ fontFamily: mono, fontSize: 19, color: C.accent, marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <ShieldCheck size={17} /> devnet receipt · {truncMid(tx, 6, 6)}
          </div>
        )}
      </div>
    </div>
  );
};

const Product: React.FC = () => {
  return (
    <Scene durationInFrames={270} style={{ alignItems: "flex-start" }}>
      <Kicker delay={6}>One pick, start to finish</Kicker>
      <Rise delay={12} style={{ marginBottom: 44 }}>
        <h2 style={H(56)}>Spain vs Belgium — sealed before kickoff</h2>
      </Rise>
      <div style={{ width: "100%", maxWidth: 1080 }}>
        <TimelineRow
          delay={30}
          icon={<Lock size={26} color={C.accent} />}
          title="Commitment sealed"
          body={`sha256:${RECEIPTS.commitHash.slice(0, 24)}…`}
          tx={RECEIPTS.commit}
        />
        <TimelineRow
          delay={56}
          icon={<FileCheck2 size={26} color={C.accent} />}
          title="Selection revealed"
          body="home @ 1.95 · salt verified against the sealed hash"
          tx={RECEIPTS.reveal}
        />
        <TimelineRow
          delay={82}
          icon={<Check size={26} color={C.accent} />}
          title="Graded against TxLINE"
          body="Final 2–0 → correct · settlement gated by validate_stat on devnet"
          tx={RECEIPTS.grade}
          last
        />
      </div>
    </Scene>
  );
};

// ── Scene 4b — On-chain check gate (real program logs) ────────────────────────
// These lines are the unedited devnet output of TxLINE's validate_stat
// instruction, exactly as surfaced on proofcast-theta.vercel.app/verify.
const GATE_LOGS = [
  "$ validate_stat · 6pW64gN1…5wyP2J · devnet",
  "Instruction: ValidateStat",
  "Receive score stat validation request with predicate",
  "Verify account integrity",
  "Find valid on-chain root for interval 42",
  "Perform fixture-level validation",
  "Pass fixture-level validation",
];

const LogLine: React.FC<{ text: string; delay: number; pass?: boolean; cmd?: boolean }> = ({ text, delay, pass, cmd }) => {
  const frame = useCurrentFrame();
  const chars = Math.max(0, Math.floor((frame - delay) * 2.2));
  const shown = text.slice(0, chars);
  if (frame < delay) return <div style={{ height: 34 }} />;
  return (
    <div
      style={{
        fontFamily: mono,
        fontSize: 22,
        lineHeight: "34px",
        color: pass ? C.accent : cmd ? C.ink : C.dim,
        fontWeight: pass ? 600 : 400,
      }}
    >
      {shown}
      {chars < text.length && <span style={{ color: C.accent }}>▋</span>}
    </div>
  );
};

const CheckGate: React.FC = () => {
  const badge = useEnter(150);
  return (
    <Scene durationInFrames={240} style={{ alignItems: "flex-start" }}>
      <Kicker delay={6}>Don’t trust us — run the program</Kicker>
      <Rise delay={12} style={{ marginBottom: 36 }}>
        <h2 style={H(54)}>
          Settlement is gated by TxLINE’s <span style={{ fontStyle: "italic", color: C.accent }}>validate_stat</span> on devnet
        </h2>
      </Rise>
      <Rise delay={22} style={{ width: "100%", maxWidth: 1120 }}>
        <div
          style={{
            backgroundColor: C.raise,
            border: `1px solid ${C.line}`,
            borderRadius: 20,
            padding: "30px 36px",
          }}
        >
          {GATE_LOGS.map((l, i) => (
            <LogLine key={i} text={l} delay={30 + i * 16} cmd={i === 0} pass={l.startsWith("Pass")} />
          ))}
          <div
            style={{
              opacity: badge,
              transform: `translateY(${interpolate(badge, [0, 1], [12, 0])}px)`,
              marginTop: 24,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              border: `1px solid ${C.accentDim}`,
              backgroundColor: `${C.accent}14`,
              borderRadius: 999,
              padding: "12px 24px",
              fontFamily: mono,
              fontSize: 21,
              color: C.accent,
            }}
          >
            <ShieldCheck size={20} /> fixture proof vs on-chain root: PASSED · anyone can rerun this at /verify
          </div>
        </div>
      </Rise>
    </Scene>
  );
};

// ── Scene 5 — Leaderboard proof ───────────────────────────────────────────────
const LbRow: React.FC<{ rank: string; name: string; handle: string; acc: number; bond: string; delay: number }> = ({
  rank,
  name,
  handle,
  acc,
  bond,
  delay,
}) => {
  const e = useEnter(delay);
  return (
    <div
      style={{
        opacity: e,
        transform: `translateY(${interpolate(e, [0, 1], [20, 0])}px)`,
        display: "flex",
        alignItems: "center",
        gap: 26,
        backgroundColor: C.raise,
        border: `1px solid ${C.line}`,
        borderRadius: 18,
        padding: "24px 30px",
      }}
    >
      <span style={{ fontFamily: mono, fontSize: 24, color: C.dim }}>{rank}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 28, color: C.ink }}>
          {name} <span style={{ color: C.dim }}>@{handle}</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.dim, fontSize: 19, fontFamily: mono }}>
        <ShieldCheck size={17} color={C.accent} /> {bond} USDC
      </div>
      <div style={{ fontFamily: mono, fontSize: 40, color: C.accent, width: 130, textAlign: "right" }}>
        <CountUp to={acc} delay={delay + 4} suffix="%" />
      </div>
    </div>
  );
};

const Leaderboard: React.FC = () => {
  return (
    <Scene durationInFrames={210} style={{ alignItems: "flex-start" }}>
      <Kicker delay={6}>Verified, not self-reported</Kicker>
      <Rise delay={12} style={{ marginBottom: 44 }}>
        <h2 style={H(58)}>A leaderboard the platform can’t fake</h2>
      </Rise>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
        <LbRow delay={32} rank="01" name="Riva" handle="rivamarkets" acc={80} bond="12,000" />
        <LbRow delay={46} rank="02" name="M. Kondo" handle="kondo" acc={75} bond="5,000" />
        <LbRow delay={60} rank="03" name="Tunde A." handle="tundexg" acc={67} bond="2,500" />
      </div>
    </Scene>
  );
};

// ── Scene 6 — Stats ───────────────────────────────────────────────────────────
const Stat: React.FC<{ value: React.ReactNode; label: string; delay: number }> = ({ value, label, delay }) => {
  const e = useEnter(delay);
  return (
    <div style={{ opacity: e, transform: `translateY(${interpolate(e, [0, 1], [24, 0])}px)`, flex: 1, textAlign: "center" }}>
      <div style={{ fontFamily: mono, fontSize: 92, color: C.accent, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 24, color: C.dim, marginTop: 16 }}>{label}</div>
    </div>
  );
};

const Stats: React.FC = () => {
  return (
    <Scene durationInFrames={180}>
      <div style={{ display: "flex", gap: 40, width: "100%" }}>
        <Stat delay={16} value={<CountUp to={104} delay={16} />} label="World Cup matches on one feed" />
        <Stat delay={30} value={<CountUp to={3} delay={30} />} label="on-chain receipts per pick" />
        <Stat delay={44} value={<CountUp to={0} delay={44} />} label="self-graded records allowed" />
      </div>
    </Scene>
  );
};

// ── Scene 7 — CTA ─────────────────────────────────────────────────────────────
const Cta: React.FC = () => {
  return (
    <Scene durationInFrames={150}>
      <Wordmark delay={8} size={54} />
      <Rise delay={26} style={{ marginTop: 40 }}>
        <h1 style={{ ...H(92), textAlign: "center" }}>
          Grade the <span style={{ fontStyle: "italic", color: C.accent }}>graders.</span>
        </h1>
      </Rise>
      <Rise delay={44} style={{ marginTop: 34 }}>
        <div style={{ fontFamily: mono, fontSize: 26, color: C.dim, textAlign: "center", lineHeight: 1.7 }}>
          proofcast-theta.vercel.app
          <br />
          <span style={{ color: C.accent }}>TxODDS World Cup · Prediction Markets & Settlement</span>
        </div>
      </Rise>
    </Scene>
  );
};

// ── Master timeline ───────────────────────────────────────────────────────────
export const ProofCastVideo: React.FC = () => {
  const frame = useCurrentFrame();
  // Slow ambient drift on the whole backdrop for life.
  const drift = Math.sin(frame / 90) * 6;
  return (
    <Backdrop>
      <AbsoluteFill style={{ transform: `translateY(${drift}px)` }}>
        <Sequence durationInFrames={120} premountFor={30}>
          <Hook />
        </Sequence>
        <Sequence from={120} durationInFrames={180} premountFor={30}>
          <Problem />
        </Sequence>
        <Sequence from={300} durationInFrames={210} premountFor={30}>
          <Mechanism />
        </Sequence>
        <Sequence from={510} durationInFrames={270} premountFor={30}>
          <Product />
        </Sequence>
        <Sequence from={780} durationInFrames={240} premountFor={30}>
          <CheckGate />
        </Sequence>
        <Sequence from={1020} durationInFrames={210} premountFor={30}>
          <Leaderboard />
        </Sequence>
        <Sequence from={1230} durationInFrames={180} premountFor={30}>
          <Stats />
        </Sequence>
        <Sequence from={1410} durationInFrames={150} premountFor={30}>
          <Cta />
        </Sequence>
      </AbsoluteFill>
    </Backdrop>
  );
};

export const MASTER_DURATION = 1560; // 52s @ 30fps
