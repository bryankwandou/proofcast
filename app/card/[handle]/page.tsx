import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { allAnalysts, picksByAnalyst } from "@/lib/store";
import { accuracyOf } from "@/lib/protocol";
import { Crest } from "@/components/AgentCard";

// A self-contained, screenshot-ready credential card. It is public and reads
// only proof-graded numbers, so it can be dropped into a Twitter bio or a
// Telegram channel — and the QR code sends anyone straight to the analyst's
// verifiable page, where every pick can be re-checked on-chain.

export const dynamic = "force-dynamic";

const SITE = "https://proofcast-app.vercel.app";

export default async function ProofCardPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const analyst = allAnalysts().find((a) => a.handle === handle || a.id === handle);
  if (!analyst) notFound();

  const picks = picksByAnalyst(analyst.id);
  const stats = accuracyOf(picks);
  const acc = Math.round(stats.accuracy * 100);
  const aboveFloor = stats.accuracy >= analyst.accuracyFloor;

  const verifyUrl = `${SITE}/analysts/${analyst.handle}`;
  const qrSvg = await QRCode.toString(verifyUrl, {
    type: "svg",
    margin: 0,
    color: { dark: "#52f2a5", light: "#00000000" },
  });

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 px-5 py-14">
      {/* The card */}
      <div className="relative w-full max-w-[420px] overflow-hidden rounded-3xl border hairline bg-raise p-7 shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 48 48" width="24" height="24" fill="none" aria-hidden>
              <circle cx="24" cy="24" r="18" stroke="#52f2a5" strokeWidth="3.2" strokeDasharray="1.6 3.4" />
              <circle cx="24" cy="24" r="12.5" stroke="#52f2a5" strokeWidth="2" opacity="0.55" />
              <path d="M18 24.5 L22.5 29 L31 19.5" stroke="#52f2a5" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-display text-lg">
              Proof<span className="italic text-accent">Cast</span>
            </span>
          </div>
          <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-accent">
            Verified on-chain
          </span>
        </div>

        {/* identity */}
        <div className="mt-6 flex items-center gap-3">
          <Crest wallet={analyst.wallet} size={44} />
          <div>
            <p className="font-display text-xl leading-tight">{analyst.name}</p>
            <p className="font-mono text-xs text-dim">@{analyst.handle}</p>
          </div>
        </div>

        {/* headline accuracy */}
        <div className="mt-6 flex items-end gap-3">
          <span className="font-display text-6xl leading-none text-accent">{acc}%</span>
          <span className="mb-1 text-sm text-dim">proof-graded<br />accuracy</span>
        </div>

        {/* stats row */}
        <div className="mt-6 grid grid-cols-3 gap-2 border-t hairline pt-5 text-center">
          <div>
            <p className="font-mono text-lg">{stats.won}/{stats.graded}</p>
            <p className="text-[11px] text-dim">graded correct</p>
          </div>
          <div>
            <p className={`font-mono text-lg ${stats.roi >= 0 ? "text-accent" : "text-danger"}`}>
              {stats.roi >= 0 ? "+" : ""}{(stats.roi * 100).toFixed(1)}%
            </p>
            <p className="text-[11px] text-dim">flat-stake ROI</p>
          </div>
          <div>
            <p className="font-mono text-lg">${analyst.bondUsdc.toLocaleString()}</p>
            <p className="text-[11px] text-dim">bond staked</p>
          </div>
        </div>

        {/* floor status */}
        <div className="mt-4 flex items-center justify-between rounded-xl border hairline px-4 py-2.5">
          <span className="font-mono text-[11px] uppercase tracking-wider text-dim">
            Accuracy floor {Math.round(analyst.accuracyFloor * 100)}%
          </span>
          <span className={`font-mono text-[11px] ${aboveFloor ? "text-accent" : "text-danger"}`}>
            {aboveFloor ? "held — bond intact" : "breached — refund zone"}
          </span>
        </div>

        {/* QR + verify */}
        <div className="mt-6 flex items-center gap-4 border-t hairline pt-5">
          <div className="h-[92px] w-[92px] shrink-0" dangerouslySetInnerHTML={{ __html: qrSvg }} />
          <div>
            <p className="text-sm text-ink">Scan to verify every pick.</p>
            <p className="mt-1 font-mono text-[11px] leading-relaxed text-dim">
              proofcast-app.vercel.app/<br />analysts/{analyst.handle}
            </p>
          </div>
        </div>
      </div>

      {/* caption for the sharer (not part of the card image) */}
      <p className="max-w-[420px] text-center text-xs text-dim">
        Screenshot this card for your bio or channel. The QR resolves to a public page where
        anyone can re-run the on-chain grade for each pick — no account, no trust required.
      </p>
    </div>
  );
}
