// Country name -> flag emoji. Football nations plus a fallback. Flags are a
// single unicode codepoint pair, so they cost nothing to render and stay crisp
// at any size — no image assets, no layout shift.
const FLAGS: Record<string, string> = {
  Argentina: "🇦🇷", France: "🇫🇷", Brazil: "🇧🇷", Spain: "🇪🇸", England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Germany: "🇩🇪", Portugal: "🇵🇹", Netherlands: "🇳🇱", Belgium: "🇧🇪", Italy: "🇮🇹",
  Croatia: "🇭🇷", Uruguay: "🇺🇾", Colombia: "🇨🇴", Denmark: "🇩🇰", Serbia: "🇷🇸",
  Switzerland: "🇨🇭", Mexico: "🇲🇽", "United States": "🇺🇸", USA: "🇺🇸", Poland: "🇵🇱",
  Morocco: "🇲🇦", Senegal: "🇸🇳", Japan: "🇯🇵", "South Korea": "🇰🇷", Australia: "🇦🇺",
  Canada: "🇨🇦", Ecuador: "🇪🇨", Ghana: "🇬🇭", Cameroon: "🇨🇲", Nigeria: "🇳🇬",
  Vietnam: "🇻🇳", Myanmar: "🇲🇲", India: "🇮🇳", "New Zealand": "🇳🇿", Liechtenstein: "🇱🇮",
  Gibraltar: "🇬🇮", Wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", Qatar: "🇶🇦", "Saudi Arabia": "🇸🇦",
  Iran: "🇮🇷", Tunisia: "🇹🇳", "Costa Rica": "🇨🇷", Peru: "🇵🇪", Chile: "🇨🇱",
  Sweden: "🇸🇪", Norway: "🇳🇴", Austria: "🇦🇹", Turkey: "🇹🇷", Ukraine: "🇺🇦",
};

export function flagFor(name: string): string {
  return FLAGS[name] ?? "⚽";
}
