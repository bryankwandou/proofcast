// One-time: generate the protocol keypair and request a devnet airdrop.
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import bs58 from "bs58";

const kp = Keypair.generate();
console.log("PUBKEY=" + kp.publicKey.toBase58());
console.log("SECRET=" + bs58.encode(kp.secretKey));

const conn = new Connection("https://api.devnet.solana.com", "confirmed");
try {
  const sig = await conn.requestAirdrop(kp.publicKey, 2 * LAMPORTS_PER_SOL);
  await conn.confirmTransaction(sig, "confirmed");
  console.log("AIRDROP=ok " + sig);
} catch (e) {
  console.log("AIRDROP=failed " + e.message.slice(0, 120));
}
console.log("BALANCE=" + (await conn.getBalance(kp.publicKey)));
