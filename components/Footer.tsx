import Logo from "./Logo";

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
        </div>
        <div className="flex flex-col gap-1 text-sm text-dim">
          <a className="hover:text-ink" href="https://github.com/VincentiusBryanKwandou/proofcast" target="_blank" rel="noreferrer">GitHub</a>
          <a className="hover:text-ink" href="https://txline.txodds.com/documentation/quickstart" target="_blank" rel="noreferrer">TxLINE docs</a>
          <a className="hover:text-ink" href="https://explorer.solana.com/?cluster=devnet" target="_blank" rel="noreferrer">Solana Explorer</a>
        </div>
      </div>
    </footer>
  );
}
