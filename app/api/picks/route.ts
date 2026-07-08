import { NextResponse } from "next/server";
import { addPick, allPicks } from "@/lib/store";
import { canonicalPayload, commitHashFor, newSalt, Pick, PickSelection } from "@/lib/protocol";
import { writeReceipt } from "@/lib/solana";

export async function GET() {
  return NextResponse.json({ picks: allPicks() });
}

// Seal a new pick: hash the payload, anchor the commitment on devnet, store it.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.fixtureId || !body?.selection || !body?.analystId) {
    return NextResponse.json({ error: "fixtureId, selection and analystId are required" }, { status: 400 });
  }
  const selection = body.selection as PickSelection;
  if (!["home", "draw", "away"].includes(selection)) {
    return NextResponse.json({ error: "selection must be home, draw or away" }, { status: 400 });
  }

  const odds = Number(body.oddsAtCommit ?? 2.0);
  const salt = newSalt();
  const payload = canonicalPayload({
    analystId: body.analystId,
    fixtureId: String(body.fixtureId),
    selection,
    oddsAtCommit: odds,
  });
  const commitHash = commitHashFor(payload, salt);

  // Devnet anchor: only the hash leaves the server before kickoff.
  const receipt = await writeReceipt("commit", { h: commitHash });

  const pick: Pick = {
    id: `p-${Date.now().toString(36)}`,
    analystId: body.analystId,
    fixtureId: String(body.fixtureId),
    fixtureLabel: body.fixtureLabel ?? String(body.fixtureId),
    selection,
    oddsAtCommit: odds,
    reasoning: String(body.reasoning ?? "").slice(0, 500),
    committedAt: new Date().toISOString(),
    kickoff: body.kickoff ?? new Date().toISOString(),
    salt,
    commitHash,
    commitTx: receipt?.signature ?? null,
    status: "sealed",
    finalScore: null,
  };
  addPick(pick);
  return NextResponse.json({ pick, explorer: receipt?.explorer ?? null });
}
