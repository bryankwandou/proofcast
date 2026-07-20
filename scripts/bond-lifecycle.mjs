// ProofCast Bond Vault — live devnet lifecycle.
// Runs the real settlement engine on-chain and prints Explorer receipts:
//   open_bond  → agent locks collateral into a PDA escrow
//   subscribe  → a subscriber funds the same escrow
//   settle     → CPIs into TxLINE validate_stat (the proof gate)
//   claim_*    → pays out once the bond is settled
//
// The settle/claim leg needs a passing validate_stat proof, which only exists
// while a match carries live stats. When no proof is available the script still
// proves the gate: a settle with no valid proof is rejected and no funds move.
import anchor from "@coral-xyz/anchor";
const { AnchorProvider, BN, Program, web3 } = anchor;
import { Connection, Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { readFileSync } from "node:fs";
import idl from "../lib/bond-vault-idl.json" with { type: "json" };

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const HELIUS = env.match(/^HELIUS_RPC_URL=(.+)$/m)?.[1]?.trim() || "https://api.devnet.solana.com";
const PROGRAM_ID = new PublicKey(idl.address);
const TXLINE = new PublicKey("6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J");
const ex = (sig) => `https://explorer.solana.com/tx/${sig}?cluster=devnet`;

const agent = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(new URL("../.proofcast-signer.json", import.meta.url), "utf8"))));
const conn = new Connection(HELIUS, "confirmed");
const wallet = {
  publicKey: agent.publicKey,
  signTransaction: async (tx) => { tx.partialSign(agent); return tx; },
  signAllTransactions: async (txs) => txs.map((t) => { t.partialSign(agent); return t; }),
};
const provider = new AnchorProvider(conn, wallet, { commitment: "confirmed" });
const program = new Program(idl, provider);

// Unique 16-byte season id per run so the bond PDA is fresh and re-runnable.
const seasonId = Buffer.alloc(16);
Buffer.from(`wc26-${Date.now().toString(36)}`, "utf8").copy(seasonId, 0, 0, 16);

const [bondPda] = PublicKey.findProgramAddressSync([Buffer.from("bond"), agent.publicKey.toBuffer(), seasonId], PROGRAM_ID);

console.log("Bond Vault:", PROGRAM_ID.toBase58());
console.log("Agent:", agent.publicKey.toBase58());
console.log("Bond PDA:", bondPda.toBase58());
console.log("Season id (hex):", seasonId.toString("hex"), "\n");

// A subscriber wallet, funded from the agent so it can sign its own subscribe.
const subscriber = Keypair.generate();
const fund = await conn.sendTransaction(
  new web3.Transaction().add(SystemProgram.transfer({ fromPubkey: agent.publicKey, toPubkey: subscriber.publicKey, lamports: 0.03 * LAMPORTS_PER_SOL })),
  [agent],
);
await conn.confirmTransaction(fund, "confirmed");
console.log("Funded subscriber", subscriber.publicKey.toBase58(), "\n  ", ex(fund), "\n");

const [subPda] = PublicKey.findProgramAddressSync([Buffer.from("sub"), bondPda.toBuffer(), subscriber.publicKey.toBuffer()], PROGRAM_ID);

// 1) open_bond — floor 90.00%, collateral 0.02 SOL.
const FLOOR = 9000;
const openSig = await program.methods
  .openBond([...seasonId], FLOOR, new BN(0.02 * LAMPORTS_PER_SOL))
  .accounts({ agent: agent.publicKey, bond: bondPda, systemProgram: SystemProgram.programId })
  .rpc();
console.log("1) open_bond  floor=90.00% collateral=0.02 SOL");
console.log("   ", ex(openSig), "\n");

// 2) subscribe — fee 0.01 SOL, signed by the subscriber.
const subSig = await program.methods
  .subscribe(new BN(0.01 * LAMPORTS_PER_SOL))
  .accounts({ subscriber: subscriber.publicKey, bond: bondPda, subscription: subPda, systemProgram: SystemProgram.programId })
  .signers([subscriber])
  .rpc();
console.log("2) subscribe  fee=0.01 SOL");
console.log("   ", ex(subSig), "\n");

const bond = await program.account.bond.fetch(bondPda);
console.log("Bond state after subscribe:");
console.log("   collateral:", Number(bond.collateralLamports) / LAMPORTS_PER_SOL, "SOL");
console.log("   fees:", Number(bond.feesLamports) / LAMPORTS_PER_SOL, "SOL");
console.log("   subscribers:", Number(bond.subscriberCount));
console.log("   floor:", bond.accuracyFloorBps / 100 + "%", "status:", bond.status, "(0=open)\n");

// 3) settle — the proof gate. With no live match proof available we submit an
// empty proof to demonstrate the gate rejects it (funds stay put). When a match
// carries stats, pass the real validate_stat data + remaining_accounts here and
// the bond settles Held/Breached.
console.log("3) settle — proof gate");
try {
  const settleSig = await program.methods
    .settle(5000, Buffer.from([]))
    .accounts({ keeper: agent.publicKey, bond: bondPda, txlineProgram: TXLINE })
    .rpc();
  console.log("   settled:", ex(settleSig));
} catch (e) {
  const msg = String(e?.message || e);
  const rejected = /ProofRejected|custom program error|0x/i.test(msg);
  console.log("   gate", rejected ? "REJECTED the unproven settle (expected) — no funds moved" : "error", "\n   ", msg.slice(0, 200));
}

const after = await program.account.bond.fetch(bondPda);
console.log("\nBond status after settle attempt:", after.status, "(still 0=open means the gate held)\n");
console.log("RECEIPTS");
console.log("  open_bond:", ex(openSig));
console.log("  subscribe:", ex(subSig));
console.log("  bond PDA :", `https://explorer.solana.com/address/${bondPda.toBase58()}?cluster=devnet`);
