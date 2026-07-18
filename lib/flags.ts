// Country name -> ISO 3166-1 alpha-2 code, used to render real SVG flags via
// the flag-icons stylesheet (<span className="fi fi-xx" />). Unlike emoji flags
// — which Windows refuses to render and falls back to two-letter text — these
// are actual SVG images and show identically on every platform.
const ISO: Record<string, string> = {
  Argentina: "ar", France: "fr", Brazil: "br", Spain: "es", England: "gb-eng",
  Germany: "de", Portugal: "pt", Netherlands: "nl", Belgium: "be", Italy: "it",
  Croatia: "hr", Uruguay: "uy", Colombia: "co", Denmark: "dk", Serbia: "rs",
  Switzerland: "ch", Mexico: "mx", "United States": "us", USA: "us", Poland: "pl",
  Morocco: "ma", Senegal: "sn", Japan: "jp", "South Korea": "kr", Australia: "au",
  Canada: "ca", Ecuador: "ec", Ghana: "gh", Cameroon: "cm", Nigeria: "ng",
  Vietnam: "vn", Myanmar: "mm", India: "in", "New Zealand": "nz", Liechtenstein: "li",
  Gibraltar: "gi", Wales: "gb-wls", Scotland: "gb-sct", Qatar: "qa", "Saudi Arabia": "sa",
  Iran: "ir", Tunisia: "tn", "Costa Rica": "cr", Peru: "pe", Chile: "cl",
  Sweden: "se", Norway: "no", Austria: "at", Turkey: "tr", Ukraine: "ua",
};

export function isoFor(name: string): string | null {
  return ISO[name] ?? null;
}

// SVG flag chip. Falls back to a neutral pitch-green dot when a country isn't
// mapped, so the layout never breaks.
export function flagClass(name: string): string {
  const iso = ISO[name];
  return iso ? `fi fi-${iso}` : "";
}
