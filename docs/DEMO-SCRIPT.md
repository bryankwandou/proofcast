# ProofCast — Demo Video Script (5:00)

A shot-by-shot script. Left column is exactly what you say; right column is exactly what is on screen. Read the narration verbatim so the video and script match. Target 150 words per minute, ~740 words total. Record at 1920×1080, 60fps, no compression on export. No music louder than the voice; no on-screen emoji.

Setup before recording: dev server running, wallet (Phantom) installed on devnet, `/verify` open in a second tab, one fixture picked in advance so the seal step is quick.

---

**0:00 – 0:35 · The problem**

> Narration: "Paid football tips are a multi-billion-dollar market that runs on trust it hasn't earned. Sellers delete their losing calls, screenshot the winners after kickoff, and the rating sites grade the very tipsters who pay them. The referee works for one of the teams. So an honest analyst and a fraud look identical to a buyer. ProofCast fixes that by making the track record impossible to fake — and it settles the whole thing on Solana."

On screen: land on the homepage. Slow scroll past the hero — the sealed-pick receipt tilts under the cursor and the seal stamps. Pause on the headline "Anyone can claim a record. Few can prove one."

---

**0:35 – 1:25 · Seal a pick**

> Narration: "Here's the feed — live fixtures and odds straight from TxLINE, the data layer for this track. I connect my Solana wallet, pick a match, and seal my call. Watch what leaves my machine: the selection is hashed in my own browser, so the server only ever receives a sha256 commitment — never the pick itself. My wallet signs that commitment, binding it to my key, and the hash is anchored on Solana devnet. This is the receipt, on Solana Explorer. Provably sealed before kickoff, provably mine, and impossible to edit after the fact."

On screen: click into Matchday, show the live TxLINE feed. Click Connect wallet (Phantom, devnet). Pick a fixture, choose a selection, seal it. Show the sha256 forming, the wallet signature prompt, then the commit transaction opening on Solana Explorer.

---

**1:25 – 2:35 · Grade by proof, then verify it yourself**

> Narration: "After the match, the pick is revealed and checked against its sealed hash, then graded on TxLINE's score data. But we don't ask you to trust our grade. This is the verify console. Pick any fixture and it runs TxLINE's own validate_stat program on Solana devnet, passing the fixture's real Merkle proof material against the daily root that already lives on-chain. The program — not ProofCast — decides whether the proof holds, and its raw logs are the receipt. Anyone can run this. That's the whole point: the settlement is verifiable, not trusted."

On screen: open the pick, run reveal and grade — show the hash-match tick and the final score from the feed. Switch to the /verify tab. Select a fixture, run the check, scroll the unedited program logs, highlight "Pass fixture-level validation" and the eventStatRoot.

---

**2:35 – 3:10 · The arena**

> Narration: "Every graded pick feeds a season table. Analysts — and autonomous agents, like this xG bot — earn their place only from proof-graded results. There's a promotion line at the top and a relegation line at the bottom, drawn by verified accuracy, not by volume and not by anything money can buy. It reads like a league table because it is one, settled entirely by proofs."

On screen: open Seasons. Scroll the standings table; the form chips flip in, the green promotion rail and red relegation rail are visible. Hover the autonomous agent's row to show the "agent" tag and its strategy line.

---

**3:10 – 4:10 · The Bond Vault**

> Narration: "Now the settlement engine the track asks for. Each agent stakes a USDC bond behind a public accuracy floor. That bond lives in a program-owned escrow on Solana. When the deciding fixture resolves, a keeper calls settle — and settle performs a cross-program invocation into TxLINE's validate_stat. Funds only move because that program verified the proof on-chain. Floor held: the agent claims the subscription fees. Floor broken: subscribers claim refunds from the bond, automatically, with no support ticket and no discretion. That's the promise made literal — enforced by code, not by us."

On screen: open the Bond Vault page. Show a bond's escrow, floor, and status. Run the keeper settle; show the CPI into validate_stat and the resulting transaction. Trigger a refund on a breached bond and show the lamports landing back in the subscriber wallet on Explorer.

---

**4:10 – 4:40 · Why it's a startup**

> Narration: "This isn't a tournament toy. The wedge is a free, verified track-record page any tipster can drop in their bio — prove it, or don't. The paid-picks market is already huge and completely unverified. ProofCast turns the track record itself into the product, and it works for any sport TxLINE covers, long after this World Cup."

On screen: open an agent's public profile — accuracy, ROI, bond health, on-chain history with Explorer links. Copy the share link.

---

**4:40 – 5:00 · Close**

> Narration: "Sealed before kickoff, graded by proof, settled on-chain. Everything you saw is live on devnet and open source — the links are below. This is ProofCast. Grade the graders."

On screen: return to the homepage; the seal mark stamps once more. End card with the three links: live app, /verify, and the GitHub repo.

---

### Recording checklist
- 1920×1080, 60fps, export at high bitrate — text must stay crisp, never blurry.
- Real cursor movement over the 3D receipt and the form chips so the interactions read as live.
- Every Explorer link opened must be a real devnet transaction (no mockups).
- Keep total runtime under 5:00 — it is a hard cap for the screening.
