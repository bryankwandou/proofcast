"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Wallet } from "lucide-react";

// Lightweight Solana wallet integration via the injected provider (Phantom /
// Solflare) — no wallet-adapter dependency tree, which conflicts with our
// web3.js version under Turbopack. It gives us exactly what the identity proof
// needs: a public key and a message signature.

type Provider = {
  publicKey?: { toString(): string } | null;
  isConnected?: boolean;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>;
  disconnect: () => Promise<void>;
  signMessage: (msg: Uint8Array, enc?: string) => Promise<{ signature: Uint8Array }>;
};

function getProvider(): Provider | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { solana?: Provider & { isPhantom?: boolean }; solflare?: Provider };
  return w.solana ?? w.solflare ?? null;
}

type Ctx = {
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signCommit: (commitHash: string) => Promise<string | null>;
};

const WalletCtx = createContext<Ctx>({
  address: null,
  connect: async () => {},
  disconnect: async () => {},
  signCommit: async () => null,
});

export function useProofWallet() {
  return useContext(WalletCtx);
}

export function WalletRoot({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const p = getProvider();
    if (!p) return;
    // Reconnect silently if the wallet already trusts this site.
    p.connect({ onlyIfTrusted: true })
      .then((r) => setAddress(r.publicKey.toString()))
      .catch(() => {});
  }, []);

  const connect = useCallback(async () => {
    const p = getProvider();
    if (!p) {
      window.open("https://phantom.app/", "_blank");
      return;
    }
    const r = await p.connect();
    setAddress(r.publicKey.toString());
  }, []);

  const disconnect = useCallback(async () => {
    const p = getProvider();
    try {
      await p?.disconnect();
    } finally {
      setAddress(null);
    }
  }, []);

  const signCommit = useCallback(async (commitHash: string) => {
    const p = getProvider();
    if (!p || !p.signMessage) return null;
    const enc = new TextEncoder().encode(`ProofCast commit:${commitHash}`);
    const { signature } = await p.signMessage(enc, "utf8");
    // base58 without pulling bs58: encode inline
    return toBase58(signature);
  }, []);

  return (
    <WalletCtx.Provider value={{ address, connect, disconnect, signCommit }}>
      {children}
    </WalletCtx.Provider>
  );
}

export function ConnectButton() {
  const { address, connect, disconnect } = useProofWallet();
  const short = address ? `${address.slice(0, 4)}…${address.slice(-4)}` : null;
  return (
    <button
      onClick={address ? disconnect : connect}
      className="inline-flex items-center gap-1.5 rounded-full border hairline bg-raise px-3.5 py-2 font-mono text-xs text-dim transition-colors hover:text-ink"
      title={address ? `Connected: ${address}` : "Connect a Solana wallet"}
    >
      <Wallet size={13} className={address ? "text-accent" : ""} />
      {short ?? "Connect wallet"}
    </button>
  );
}

// Minimal base58 (Bitcoin alphabet) encoder for the signature bytes.
const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function toBase58(bytes: Uint8Array): string {
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++;
  const digits: number[] = [];
  for (let i = zeros; i < bytes.length; i++) {
    let carry = bytes[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let out = "1".repeat(zeros);
  for (let i = digits.length - 1; i >= 0; i--) out += B58[digits[i]];
  return out;
}
