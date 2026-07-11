import type { Metadata } from "next";
import { Inter, Newsreader, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import ScoreBug from "@/components/ScoreBug";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: ["normal", "italic"],
});
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "ProofCast — forecasts with collateral behind them",
  description:
    "Football analysts seal predictions before kickoff, stake USDC bonds behind a public accuracy floor, and get graded by TxLINE Merkle proofs on Solana. No self-reported track records, ever.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "ProofCast",
    description: "The forecast marketplace where track records are graded by cryptographic proofs, not by the platform.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Nav />
        <ScoreBug />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
