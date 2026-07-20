"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Wallet, X } from "lucide-react";
import { getWallets } from "@wallet-standard/app";

// Solana wallet integration built on the Wallet Standard registry (not the
// wallet-adapter tree, which conflicts with our web3.js version under
// Turbopack). getWallets() surfaces EVERY wallet the browser has registered —
// Phantom, Solflare, Backpack, Glow, and any of the ~20 a user may have — so
// the user picks their own. We connect and read nothing until they choose.
// A legacy injected fallback covers Phantom if it hasn't registered via the
// standard yet. The chosen wallet is remembered in localStorage and silently
// reconnected on reload so navigation never drops the session.

const STORAGE_KEY = "pc:wallet";

// A single, normalized wallet the UI can drive regardless of its source.
type Unified = {
  id: string;
  name: string;
  icon?: string;
  connect: (silent?: boolean) => Promise<string | null>;
  disconnect: () => Promise<void>;
  signMessage: (msg: Uint8Array) => Promise<Uint8Array | null>;
};

// Adapter: Wallet Standard wallet → Unified. Returns null if it can't sign
// Solana messages (so we never list a wallet we can't actually use).
function fromStandard(wallet: {
  name: string;
  icon?: string;
  chains?: readonly string[];
  accounts?: readonly { address: string }[];
  features: Record<string, unknown>;
}): Unified | null {
  const chains = wallet.chains ?? [];
  const isSolana = chains.some((c) => c.startsWith("solana:"));
  const connectF = wallet.features["standard:connect"] as
    | { connect: (input?: { silent?: boolean }) => Promise<{ accounts?: readonly { address: string }[] }> }
    | undefined;
  const signF = wallet.features["solana:signMessage"] as
    | { signMessage: (input: { account: unknown; message: Uint8Array }) => Promise<readonly { signature: Uint8Array }[]> }
    | undefined;
  const disconnectF = wallet.features["standard:disconnect"] as { disconnect: () => Promise<void> } | undefined;
  if (!isSolana || !connectF || !signF) return null;

  let account: { address: string } | undefined = wallet.accounts?.[0];
  return {
    id: "std:" + wallet.name,
    name: wallet.name,
    icon: wallet.icon,
    connect: async (silent?: boolean) => {
      const res = await connectF.connect(silent ? { silent: true } : undefined).catch(() => null);
      if (!res) return null;
      account = res.accounts?.[0] ?? wallet.accounts?.[0];
      return account?.address ?? null;
    },
    disconnect: async () => {
      await disconnectF?.disconnect().catch(() => {});
    },
    signMessage: async (msg: Uint8Array) => {
      if (!account) account = wallet.accounts?.[0];
      if (!account) return null;
      const out = await signF.signMessage({ account, message: msg }).catch(() => null);
      return out?.[0]?.signature ?? null;
    },
  };
}

// Adapter: legacy injected Phantom (window.solana) → Unified. Fallback only.
type LegacyProvider = {
  isPhantom?: boolean;
  connect: (o?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>;
  disconnect?: () => Promise<void>;
  signMessage: (m: Uint8Array, e?: string) => Promise<{ signature: Uint8Array }>;
};

function legacyPhantom(): Unified | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    solana?: LegacyProvider;
    phantom?: { solana?: LegacyProvider };
  };
  const p: LegacyProvider | undefined = w.phantom?.solana ?? (w.solana?.isPhantom ? w.solana : undefined);
  if (!p) return null;
  return {
    id: "legacy:phantom",
    name: "Phantom",
    connect: async (silent?: boolean) => {
      const r = await p.connect(silent ? { onlyIfTrusted: true } : undefined).catch(() => null);
      return r?.publicKey.toString() ?? null;
    },
    disconnect: async () => {
      await p.disconnect?.().catch(() => {});
    },
    signMessage: async (msg: Uint8Array) => {
      const r = await p.signMessage(msg, "utf8").catch(() => null);
      return r?.signature ?? null;
    },
  };
}

function gather(): Unified[] {
  if (typeof window === "undefined") return [];
  const std = getWallets()
    .get()
    .map((wpkg) => fromStandard(wpkg as never))
    .filter((x): x is Unified => x !== null);
  const names = new Set(std.map((s) => s.name.toLowerCase()));
  const list = [...std];
  const legacy = legacyPhantom();
  if (legacy && !names.has("phantom")) list.push(legacy);
  return list;
}

type Ctx = {
  address: string | null;
  wallets: Unified[];
  connectWith: (w: Unified) => Promise<void>;
  disconnect: () => Promise<void>;
  signCommit: (commitHash: string) => Promise<string | null>;
};

const WalletCtx = createContext<Ctx>({
  address: null,
  wallets: [],
  connectWith: async () => {},
  disconnect: async () => {},
  signCommit: async () => null,
});

export function useProofWallet() {
  return useContext(WalletCtx);
}

export function WalletRoot({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [wallets, setWallets] = useState<Unified[]>([]);
  const activeRef = useRef<Unified | null>(null);

  useEffect(() => {
    const refresh = () => setWallets(gather());
    refresh();
    // Update the list as wallets register/unregister after load.
    const { on } = getWallets();
    const offReg = on("register", refresh);
    const offUnreg = on("unregister", refresh);

    // Silently reconnect the previously chosen wallet so page changes and
    // reloads don't drop the session.
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved) {
      const w = gather().find((x) => x.name === saved);
      if (w) {
        w.connect(true).then((addr) => {
          if (addr) {
            activeRef.current = w;
            setAddress(addr);
          }
        });
      }
    }
    return () => {
      offReg();
      offUnreg();
    };
  }, []);

  const connectWith = useCallback(async (w: Unified) => {
    const addr = await w.connect(false);
    if (!addr) return;
    activeRef.current = w;
    setAddress(addr);
    try {
      localStorage.setItem(STORAGE_KEY, w.name);
    } catch {
      /* ignore */
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await activeRef.current?.disconnect();
    } finally {
      activeRef.current = null;
      setAddress(null);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const signCommit = useCallback(async (commitHash: string) => {
    const w = activeRef.current;
    if (!w) return null;
    const enc = new TextEncoder().encode(`ProofCast commit:${commitHash}`);
    const sig = await w.signMessage(enc);
    return sig ? toBase58(sig) : null;
  }, []);

  return (
    <WalletCtx.Provider value={{ address, wallets, connectWith, disconnect, signCommit }}>
      {children}
    </WalletCtx.Provider>
  );
}

export function ConnectButton() {
  const { address, wallets, connectWith, disconnect } = useProofWallet();
  const [open, setOpen] = useState(false);
  const short = address ? `${address.slice(0, 4)}…${address.slice(-4)}` : null;

  async function pick(w: Unified) {
    setOpen(false);
    try {
      await connectWith(w);
    } catch {
      /* user rejected — no-op */
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => (address ? disconnect() : setOpen((v) => !v))}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 font-mono text-xs transition-colors ${
          address
            ? "border-accent/40 bg-accent/10 text-accent hover:bg-accent/20"
            : "border-accent/50 bg-raise text-ink hover:border-accent hover:bg-accent/5"
        }`}
        title={address ? `Connected: ${address} — click to disconnect` : "Choose a Solana wallet to sign and seal picks under your key"}
      >
        <Wallet size={13} className={address ? "" : "text-accent"} />
        {address ? (
          <span className="flex items-center gap-1.5">
            <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            {short}
          </span>
        ) : (
          "Connect wallet"
        )}
      </button>

      {open && !address && (
        <div className="absolute right-0 z-50 mt-2 max-h-80 w-64 overflow-auto rounded-xl border border-line bg-raise p-2 shadow-xl">
          <div className="flex items-center justify-between px-2 pb-2 pt-1">
            <span className="text-xs font-medium text-ink">Choose a wallet ({wallets.length})</span>
            <button onClick={() => setOpen(false)} className="text-dim hover:text-ink" aria-label="Close">
              <X size={14} />
            </button>
          </div>
          {wallets.length > 0 ? (
            wallets.map((w) => (
              <button
                key={w.id}
                onClick={() => pick(w)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm text-ink hover:bg-accent/10"
              >
                {w.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={w.icon} alt="" width={18} height={18} className="rounded" />
                ) : (
                  <Wallet size={16} className="text-accent" />
                )}
                {w.name}
              </button>
            ))
          ) : (
            <div className="px-2 py-2 text-xs text-dim">
              No Solana wallet detected. Install{" "}
              <a href="https://phantom.app/" target="_blank" rel="noreferrer" className="text-accent underline">Phantom</a>,{" "}
              <a href="https://solflare.com/" target="_blank" rel="noreferrer" className="text-accent underline">Solflare</a>, or{" "}
              <a href="https://backpack.app/" target="_blank" rel="noreferrer" className="text-accent underline">Backpack</a>.
            </div>
          )}
        </div>
      )}
    </div>
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
