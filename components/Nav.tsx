"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Logo from "./Logo";
import { ConnectButton } from "./WalletBar";

// Score-bug style live indicator: lights up when the TxLINE feed has a match
// underway. Quiet the rest of the time — a LIVE badge that always shows is lying.
function LiveBadge() {
  const [live, setLive] = useState(0);
  useEffect(() => {
    let stop = false;
    const load = () =>
      fetch("/api/fixtures")
        .then((r) => r.json())
        .then((d) => {
          if (stop) return;
          const n = (d.matches ?? []).filter(
            (m: { status: string }) => m.status === "live" || m.status === "ht"
          ).length;
          setLive(n);
        })
        .catch(() => {});
    load();
    const t = setInterval(load, 60_000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, []);
  if (!live) return null;
  return (
    <Link
      href="/matches"
      className="hidden items-center gap-2 rounded-full border border-danger/40 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-danger sm:inline-flex"
    >
      <span className="live-dot inline-block h-2 w-2 rounded-full bg-danger" />
      live · {live}
    </Link>
  );
}

const links = [
  { href: "/matches", label: "Matchday" },
  { href: "/analysts", label: "Table" },
  { href: "/seasons", label: "Seasons" },
  { href: "/picks", label: "Picks" },
  { href: "/how-it-works", label: "Protocol" },
  { href: "/verify", label: "Verify" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b hairline bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" aria-label="ProofCast home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((l) => {
            const active = path?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative rounded-full px-4 py-1.5 text-sm transition-colors ${
                  active ? "text-ink" : "text-dim hover:text-ink"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-raise"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <LiveBadge />
          <ConnectButton />
          <Link
            href="/matches"
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-[#04140d] transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            Seal a pick
          </Link>
        </div>
      </div>
    </header>
  );
}
