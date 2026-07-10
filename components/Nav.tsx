"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

const links = [
  { href: "/matches", label: "Matches" },
  { href: "/analysts", label: "Analysts" },
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
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                path?.startsWith(l.href)
                  ? "bg-raise text-ink"
                  : "text-dim hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/matches"
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-[#04140d] transition-transform hover:scale-[1.03] active:scale-[0.98]"
        >
          Seal a pick
        </Link>
      </div>
    </header>
  );
}
