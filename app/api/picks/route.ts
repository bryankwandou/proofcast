import { NextResponse } from "next/server";
import { addPick, allPicks } from "@/lib/store";
import { canonicalPayload, commitHashFor, newSalt, Pick, PickSelection } from "@/lib/protocol";
import { writeReceipt } from "@/lib/solana";

export async function GET() {
  return NextResponse.json({ picks: allPicks() });
}

// Seal a new pick. Two paths:
//
// 1. Client-sealed (the app default): the browser computes
//    sha256(analyst|fixture|selection|odds | salt) locally and sends ONLY the
//    hash. The server never sees the selection or the salt until reveal —
//    the platform is provably unable to read picks before kickoff.
//
// 2. Server-sealed (raw API fallback): the payload arrives in the clear and
//    the server picks the salt. Weaker trust; kept so curl users can test.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.fixtureId || !body?.analystId) {
    return NextResponse.json({ error: "fixtureId and analystId are required" }, { status: 400 });
  }

  const odds = Number(body.oddsAtCommit ?? 2.0);
  const clientSealed = typeof body.commitHash === "string" && /^[0-9a-f]{64}$/.test(body.commitHash);

  let selection: PickSelection | null = null;
  let salt = "";
  let commitHash: string;

  if (clientSealed) {
    commitHash = body.commitHash;
  } else {
    selection = body.selection as PickSelection;
    if (!["home", "draw", "away"].includes(selection as string)) {
      return NextResponse.json({ error: "selection must be home, draw or away" }, { status: 400 });
    }
    salt = newSalt();
    commitHash = commitHashFor(
      canonicalPayload({ analystId: body.analystId, fixtureId: String(body.fixtureId), selection: selection as PickSelection, oddsAtCommit: odds }),
      salt
    );
  }

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
