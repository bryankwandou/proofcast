# ProofCast — solana.new Video Script (100% matches proofcast-v2.mp4)

This is the exact script for the rendered video `video/out/proofcast-v2.mp4` — a Remotion
production built with the solana.new marketing-video pipeline. Total runtime 0:59 (1770
frames @ 30fps). Every timestamp below maps to what is literally on screen in that scene, so
the video and this script are identical. The video already carries all on-screen text (it
reads fine muted); the "Voiceover" lines are optional narration to record over it, each
timed to fit its scene.

Render command: `cd video && npx remotion render Master out/proofcast-v2.mp4 --crf 18 --color-space bt709`

---

**0:00–0:04 · Hook**
- On screen: kicker "ProofCast"; headline "Anyone can claim a record." then italic green "Few can prove one."
- Voiceover: "Anyone can claim a record. Almost no one can prove one."

**0:04–0:10 · The problem**
- On screen: "Paid football picks run on unverifiable claims." Three red cards: Deleted losses · Backdated wins · Captured referees.
- Voiceover: "Paid tips run on deleted losses, backdated screenshots, and rating sites that grade their own sellers."

**0:10–0:17 · The mechanism**
- On screen: "Seal it. Prove it. Bond it." Three icons: Seal, Grade, Bond.
- Voiceover: "ProofCast fixes it in three moves. Seal the pick. Prove the result on-chain. Back it with a bond."

**0:17–0:26 · One pick, start to finish**
- On screen: "Spain vs Belgium — sealed before kickoff." Timeline: Commitment sealed (sha256) · Selection revealed · Graded against TxLINE — each with a devnet receipt.
- Voiceover: "A pick is hashed and sealed before kickoff, revealed after, and graded on TxLINE data. Every step leaves a devnet receipt."

**0:26–0:34 · Don't trust us — run the program**
- On screen: "Settlement is gated by TxLINE's validate_stat on devnet." Live program logs type out, ending "Pass fixture-level validation" and a green badge "PASSED · anyone can rerun this at /verify".
- Voiceover: "Settlement runs TxLINE's own validate_stat program on Solana. The chain confirms the proof — and anyone can rerun the exact check."

**0:34–0:41 · The Bond Vault**
- On screen: "The bond pays out by proof, never by us." Three cards: Escrow · Floor held · Floor broken. Badge: "bond_vault · 6XGwWj…yjJs5jSNi · devnet · funds move only on a passing proof".
- Voiceover: "Our own on-chain engine holds the bond in escrow. Floor held, the agent earns. Floor broken, subscribers are refunded. Code, not a support ticket."

**0:41–0:48 · A leaderboard the platform can't fake**
- On screen: "A leaderboard the platform can't fake." Rows: Riva 80% · M. Kondo 75% · Tunde A. 67%, each with a USDC bond.
- Voiceover: "Every place on the table is earned only from proof-graded results — verified accuracy, backed by a real bond."

**0:48–0:54 · The numbers**
- On screen: 104 World Cup matches on one feed · 3 on-chain receipts per pick · 0 self-graded records allowed.
- Voiceover: "One feed for the whole tournament. Three receipts per pick. Zero records the platform can edit."

**0:54–0:59 · Close**
- On screen: wordmark; "Grade the graders." URL "proofcast-app.vercel.app"; "TxODDS World Cup · Prediction Markets & Settlement".
- Voiceover: "ProofCast. Grade the graders."

---

## How to use this as your submission demo video
1. The video already works silent — on-screen text carries the story (85% of judges watch muted).
2. To add narration: record the Voiceover lines above (ElevenLabs or your own voice), each within its timestamp, and mux over the MP4.
3. Optional stronger version: record a short live-app segment (open `proofcast-app.vercel.app`, connect wallet, seal a pick, open `/verify`) using `docs/DEMO-SCRIPT.md`, and cut it in after 0:26 so judges see the real product between the motion-graphics beats.
