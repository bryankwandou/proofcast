// Check devnet balances of existing local wallets (public keys only).
import { Connection, Keypair } from "@solana/web3.js";
import fs from "fs";

const candidates = [
  "E:/000VSCODE PROJECT MULAI DARI DESEMBER 2025/matchmind/scripts/.txline-wallet.json",
  "E:/000VSCODE PROJECT MULAI DARI DESEMBER 2025/matchmind/scripts/.txline-ata-payer.json",
  process.env.USERPROFILE + "/.config/solana/id.json",
];

const conn = new Connection("https://api.devnet.solana.com", "confirmed");
for (const f of candidates) {
  try {
    const raw = JSON.parse(fs.readFileSync(f, "utf8"));
    const kp = Keypair.fromSecretKey(Uint8Array.from(raw));
    const bal = await conn.getBalance(kp.publicKey);
    console.log(`${f} -> ${kp.publicKey.toBase58()} balance=${bal / 1e9} SOL`);
  } catch (e) {
    console.log(`${f} -> error: ${String(e.message).slice(0, 80)}`);
  }
}
