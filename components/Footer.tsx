import Logo from "./Logo";
import { Link001 } from "./ui/skiper-ui/skiper40";

export default function Footer() {
  return (
    <footer className="border-t hairline">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="max-w-sm text-sm text-dim">
            Sealed forecasts, graded by TxLINE Merkle proofs on Solana devnet.
            Built for the TxODDS World Cup hackathon.
          </p>
          <p className="max-w-sm text-xs leading-relaxed text-dim/70">
            ProofCast is not a betting product. No user wagers on match outcomes;
            the only funds in the protocol are analyst bonds and subscription fees,
            handled as a service-level agreement. This build runs entirely on Solana
            devnet: balances are test tokens with no monetary value. Nothing here is
            financial, legal, or betting advice.
          </p>
        </div>
        <div className="flex flex-col gap-2.5 text-sm text-dim">
          <Link001 href="https://github.com/bryankwandou/proofcast" className="hover:text-ink">GitHub</Link001>
          <Link001 href="https://txline.txodds.com/documentation/quickstart" className="hover:text-ink">TxLINE docs</Link001>
          <Link001 href="https://explorer.solana.com/address/6XGwWjKTTkWD6JcJQXGUeDexJfrY3Nv2gM4yjJs5jSNi?cluster=devnet" className="hover:text-ink">Bond Vault program (devnet)</Link001>
          <Link001 href="https://github.com/bryankwandou/proofcast/blob/main/docs/BOND-VAULT.md" className="hover:text-ink">Settlement receipts</Link001>
        </div>
      </div>
    </footer>
  );
}
