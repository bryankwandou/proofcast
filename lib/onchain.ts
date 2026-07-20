import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { ComputeBudgetProgram, Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import fs from "fs";
import bs58 from "bs58";
import idlJson from "./txline-idl.json";
import { TXLINE_PROGRAM_DEVNET } from "./solana";

// On-chain settlement check: we execute the TxLINE `validate_stat` instruction
// on devnet (as a view call) with the Merkle proof material returned by
// /scores/stat-validation. The program walks the proof up to the daily root
// stored on-chain and evaluates our predicate — if it returns true, the stat
// is cryptographically bound to the root Solana already holds. Neither
// ProofCast nor TxODDS' API can forge a passing result.

const RPC = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
const PROGRAM_ID = new PublicKey(TXLINE_PROGRAM_DEVNET);

type ProofNode = { hash: number[]; isRightSibling: boolean };

export type StatValidation = {
  ts: number;
  statToProve: { key: number; value: number; period: number };
  eventStatRoot: number[];
  summary: {
    fixtureId: number;
    updateStats: { updateCount: number; minTimestamp: number; maxTimestamp: number };
    eventStatsSubTreeRoot: number[];
  };
  statProof: ProofNode[];
  subTreeProof: ProofNode[];
  mainTreeProof: ProofNode[];
};

// Fetch proof material for one stat of one score update from TxLINE.
export async function fetchValidation(
  fixtureId: string | number,
  seq: number,
  statKey: number
): Promise<StatValidation | null> {
  try {
    const base = process.env.TXLINE_BASE_URL ?? "https://txline-dev.txodds.com/api";
    const host = base.replace(/\/api\/?$/, "");
    const jwtRes = await fetch(`${host}/auth/guest/start`, { method: "POST" });
    const jwt = (await jwtRes.json())?.token ?? "";
    const res = await fetch(
      `${base}/scores/stat-validation?fixtureId=${fixtureId}&seq=${seq}&statKey=${statKey}`,
      {
        headers: {
          ...(jwt && { Authorization: `Bearer ${jwt}` }),
          "X-Api-Token": process.env.TXLINE_API_KEY ?? "",
        },
      }
    );
    if (!res.ok) return null;
    return (await res.json()) as StatValidation;
  } catch {
    return null;
  }
}

// Per the TxLINE docs, the daily roots PDA is seeded with
// "daily_scores_roots" + the epoch day as a little-endian u16.
async function findRootsPda(conn: Connection, tsMs: number): Promise<PublicKey | null> {
  const day = Math.floor(tsMs / (24 * 60 * 60 * 1000));
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("daily_scores_roots"), new BN(day).toArrayLike(Buffer, "le", 2)],
    PROGRAM_ID
  );
  const info = await conn.getAccountInfo(pda);
  return info ? pda : null;
}

export type OnChainCheck = {
  valid: boolean;          // full pass: stat proven against the on-chain root
  fixtureValid: boolean;   // fixture subtree proven against the on-chain daily root
  program: string;
  rootsPda: string | null;
  statKey: number;
  statValue: number;
  ts: number;
  logs?: string[];         // raw program logs — the receipt judges can read
  error?: string;
};

// Fee payer for simulations: reuse the protocol signer (simulation still
// requires an existing account). Falls back to an ephemeral key.
function feePayer(): Keypair {
  const raw = process.env.PROOFCAST_KEYPAIR;
  if (raw) {
    try {
      return Keypair.fromSecretKey(bs58.decode(raw));
    } catch {
      /* fall through */
    }
  }
  const file = process.env.PROOFCAST_KEYPAIR_FILE;
  if (file && fs.existsSync(file)) {
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(file, "utf8"))));
  }
  return Keypair.generate();
}

// Run validate_stat as a devnet simulation: the predicate asserts the proven
// value equals the value the API reported, so a passing check means "this
// exact number is in the Merkle tree whose root lives on Solana". We use
// simulateTransaction rather than .view() so the program logs come back —
// they show each validation stage and are surfaced in the UI as the receipt.
export async function verifyStatOnChain(
  fixtureId: string | number,
  seq: number,
  statKey: number
): Promise<OnChainCheck> {
  const base: OnChainCheck = {
    valid: false,
    fixtureValid: false,
    program: PROGRAM_ID.toBase58(),
    rootsPda: null,
    statKey,
    statValue: 0,
    ts: 0,
  };

  const v = await fetchValidation(fixtureId, seq, statKey);
  if (!v) return { ...base, error: "no proof material from the feed for this update" };
  base.statValue = v.statToProve.value;
  base.ts = v.ts;

  try {
    const conn = new Connection(RPC, "confirmed");
    // The proof binds to its 5-minute batch: the program derives the root slot
    // from the batch's minTimestamp, not from the update's own ts.
    const proofTs = v.summary.updateStats.minTimestamp;
    const pda = await findRootsPda(conn, proofTs);
    if (!pda) return { ...base, error: "daily roots account not found on devnet for this date" };
    base.rootsPda = pda.toBase58();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const idl: any = JSON.parse(JSON.stringify(idlJson));
    idl.address = PROGRAM_ID.toBase58();
    const kp = feePayer();
    const wallet = {
      publicKey: kp.publicKey,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      signTransaction: async (tx: any) => tx,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      signAllTransactions: async (txs: any[]) => txs,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const provider = new AnchorProvider(conn, wallet as any, { commitment: "confirmed" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const program = new Program(idl as any, provider);

    const summary = {
      fixtureId: new BN(v.summary.fixtureId),
      updateStats: {
        updateCount: v.summary.updateStats.updateCount,
        minTimestamp: new BN(v.summary.updateStats.minTimestamp),
        maxTimestamp: new BN(v.summary.updateStats.maxTimestamp),
      },
      eventsSubTreeRoot: v.summary.eventStatsSubTreeRoot,
    };
    const statA = {
      statToProve: v.statToProve,
      eventStatRoot: v.eventStatRoot,
      statProof: v.statProof,
    };
    const predicate = { threshold: v.statToProve.value, comparison: { equalTo: {} } };

    const ix = await program.methods
      .validateStat(
        new BN(proofTs),
        summary,
        v.subTreeProof,
        v.mainTreeProof,
        predicate,
        statA,
        null,
        null
      )
      .accounts({ dailyScoresMerkleRoots: pda })
      .instruction();

    // The full Merkle walk needs ~211k compute units — just past the 200k default.
    const tx = new Transaction()
      .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }))
      .add(ix);
    tx.feePayer = kp.publicKey;
    tx.recentBlockhash = (await conn.getLatestBlockhash("confirmed")).blockhash;
    const sim = await conn.simulateTransaction(tx);

    const logs = sim.value.logs ?? [];
    const fixtureValid = logs.some((l) => l.includes("Pass fixture-level validation"));
    const failed = sim.value.err !== null;

    // Map custom error codes to the program's own error messages.
    let error: string | undefined;
    if (failed) {
      const codeMatch = JSON.stringify(sim.value.err).match(/"Custom":(\d+)/);
      if (codeMatch) {
        const code = Number(codeMatch[1]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const known = (idl.errors as any[])?.find((e) => e.code === code);
        const zeroRoot = v.eventStatRoot.every((b) => b === 0);
        error =
          code === 6074 && zeroRoot
            ? "update has no stats yet (pre-match snapshot) — rerun after kickoff"
            : known
              ? `${known.name}: ${known.msg}`
              : `program error ${code}`;
      } else {
        error = JSON.stringify(sim.value.err).slice(0, 160);
      }
    }

    return {
      ...base,
      valid: !failed,
      fixtureValid,
      logs: logs.filter((l) => l.startsWith("Program log:")).map((l) => l.replace("Program log: ", "")),
      ...(error ? { error } : {}),
    };
  } catch (e) {
    return { ...base, error: e instanceof Error ? e.message.slice(0, 200) : "simulation failed" };
  }
}
