import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import bs58 from "bs58";
import fs from "fs";

// Devnet receipt layer: every protocol action (commit, reveal, grade) lands as
// a Memo transaction signed by the protocol keypair, so anyone can audit the
// timeline on Solana Explorer. The TxLINE validation program lives at:
export const TXLINE_PROGRAM_DEVNET = "6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J";

// Memo v1 — the memo build deployed on devnet (v2 id is absent there).
const MEMO_PROGRAM = new PublicKey("Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo");
const RPC = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

let _keypair: Keypair | null = null;

function protocolKeypair(): Keypair {
  if (_keypair) return _keypair;
  const raw = process.env.PROOFCAST_KEYPAIR;
  const file = process.env.PROOFCAST_KEYPAIR_FILE;
  if (raw) {
    _keypair = Keypair.fromSecretKey(bs58.decode(raw));
  } else if (file && fs.existsSync(file)) {
    _keypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(file, "utf8"))));
  } else {
    _keypair = Keypair.generate();
  }
  return _keypair;
}

export function protocolAddress(): string {
  return protocolKeypair().publicKey.toBase58();
}

async function ensureFunded(conn: Connection, kp: Keypair): Promise<boolean> {
  try {
    const bal = await conn.getBalance(kp.publicKey);
    if (bal > 10_000_000) return true;
    const sig = await conn.requestAirdrop(kp.publicKey, 1_000_000_000);
    await conn.confirmTransaction(sig, "confirmed");
    return true;
  } catch {
    return false;
  }
}

export type Receipt = { signature: string; explorer: string };

// Write a protocol event on devnet. Returns null when devnet is unreachable
// (rate limits, offline dev) — callers keep working and mark the receipt absent.
export async function writeReceipt(kind: string, body: Record<string, unknown>): Promise<Receipt | null> {
  try {
    const conn = new Connection(RPC, "confirmed");
    const kp = protocolKeypair();
    const funded = await ensureFunded(conn, kp);
    if (!funded) return null;

    const memo = JSON.stringify({ p: "proofcast/v1", k: kind, ...body });
    const ix = new TransactionInstruction({
      programId: MEMO_PROGRAM,
      keys: [{ pubkey: kp.publicKey, isSigner: true, isWritable: false }],
      data: Buffer.from(memo, "utf8"),
    });
    const tx = new Transaction().add(ix);
    tx.feePayer = kp.publicKey;
    const { blockhash } = await conn.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;
    tx.sign(kp);
    const signature = await conn.sendRawTransaction(tx.serialize());
    await conn.confirmTransaction(signature, "confirmed");
    return {
      signature,
      explorer: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
    };
  } catch {
    return null;
  }
}

export const explorerTx = (sig: string) =>
  `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
