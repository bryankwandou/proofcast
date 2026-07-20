import { PublicKey } from "@solana/web3.js";
import idl from "./bond-vault-idl.json";

// ProofCast Bond Vault — client helpers shared by the app and the keeper.
// The program is deployed on Solana devnet; funds only move when its `settle`
// instruction lands a CPI into TxLINE's validate_stat against an on-chain root.

export const BOND_VAULT_PROGRAM_ID = new PublicKey(idl.address);

export type BondStatus = "open" | "held" | "breached";
export const BOND_STATUS: Record<number, BondStatus> = { 0: "open", 1: "held", 2: "breached" };

// A season id fits in a fixed 16-byte seed. We take the utf8 bytes of the human
// id and pad/truncate — deterministic on both the client and the program side.
export function seasonIdBytes(seasonId: string): Buffer {
  const buf = Buffer.alloc(16);
  Buffer.from(seasonId, "utf8").copy(buf, 0, 0, 16);
  return buf;
}

// PDA for an agent's bond in a given season: seeds ["bond", agent, season_id].
export function bondPda(agent: PublicKey, seasonId: string): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("bond"), agent.toBuffer(), seasonIdBytes(seasonId)],
    BOND_VAULT_PROGRAM_ID,
  );
  return pda;
}

// PDA for a subscription: seeds ["sub", bond, subscriber].
export function subscriptionPda(bond: PublicKey, subscriber: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("sub"), bond.toBuffer(), subscriber.toBuffer()],
    BOND_VAULT_PROGRAM_ID,
  );
  return pda;
}

export function explorerAddress(address: string): string {
  return `https://explorer.solana.com/address/${address}?cluster=devnet`;
}

export const BOND_VAULT_EXPLORER = explorerAddress(BOND_VAULT_PROGRAM_ID.toBase58());

// The IDL instruction/account surface, for the settlement doc and UI copy.
export const BOND_VAULT_INSTRUCTIONS = idl.instructions.map((i) => i.name);
