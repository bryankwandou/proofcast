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
  // Live-feed additions: the TxLINE fixture list covers far more national
  // teams than the original demo set, so map the rest of FIFA's membership.
  Azerbaijan: "az", Tajikistan: "tj", Uzbekistan: "uz", Kazakhstan: "kz",
  Kyrgyzstan: "kg", Turkmenistan: "tm", Armenia: "am", Georgia: "ge",
  Albania: "al", Andorra: "ad", Belarus: "by", "Bosnia and Herzegovina": "ba",
  Bulgaria: "bg", Cyprus: "cy", "Czech Republic": "cz", Czechia: "cz",
  Estonia: "ee", "Faroe Islands": "fo", Finland: "fi", Greece: "gr",
  Hungary: "hu", Iceland: "is", Ireland: "ie", "Republic of Ireland": "ie",
  "Northern Ireland": "gb-nir", Israel: "il", Kosovo: "xk", Latvia: "lv",
  Lithuania: "lt", Luxembourg: "lu", Malta: "mt", Moldova: "md", Monaco: "mc",
  Montenegro: "me", "North Macedonia": "mk", Romania: "ro", Russia: "ru",
  "San Marino": "sm", Slovakia: "sk", Slovenia: "si",
  Algeria: "dz", Angola: "ao", Benin: "bj", Botswana: "bw", "Burkina Faso": "bf",
  Burundi: "bi", "Cape Verde": "cv", "Central African Republic": "cf", Chad: "td",
  Comoros: "km", Congo: "cg", "DR Congo": "cd", Djibouti: "dj", Egypt: "eg",
  "Equatorial Guinea": "gq", Eritrea: "er", Eswatini: "sz", Ethiopia: "et",
  Gabon: "ga", Gambia: "gm", Guinea: "gn", "Guinea-Bissau": "gw",
  "Ivory Coast": "ci", "Cote d'Ivoire": "ci", Kenya: "ke", Lesotho: "ls",
  Liberia: "lr", Libya: "ly", Madagascar: "mg", Malawi: "mw", Mali: "ml",
  Mauritania: "mr", Mauritius: "mu", Mozambique: "mz", Namibia: "na",
  Niger: "ne", Rwanda: "rw", "Sierra Leone": "sl", Somalia: "so",
  "South Africa": "za", "South Sudan": "ss", Sudan: "sd", Tanzania: "tz",
  Togo: "tg", Uganda: "ug", Zambia: "zm", Zimbabwe: "zw",
  Afghanistan: "af", Bahrain: "bh", Bangladesh: "bd", Bhutan: "bt",
  Brunei: "bn", Cambodia: "kh", China: "cn", "Chinese Taipei": "tw",
  "Hong Kong": "hk", Indonesia: "id", Iraq: "iq", Jordan: "jo", Kuwait: "kw",
  Laos: "la", Lebanon: "lb", Macau: "mo", Malaysia: "my", Maldives: "mv",
  Mongolia: "mn", Nepal: "np", "North Korea": "kp", Oman: "om",
  Pakistan: "pk", Palestine: "ps", Philippines: "ph", Singapore: "sg",
  "Sri Lanka": "lk", Syria: "sy", Thailand: "th", "Timor-Leste": "tl",
  "United Arab Emirates": "ae", UAE: "ae", Yemen: "ye",
  "Antigua and Barbuda": "ag", Aruba: "aw", Bahamas: "bs", Barbados: "bb",
  Belize: "bz", Bermuda: "bm", Bolivia: "bo", Cuba: "cu", Curacao: "cw",
  Dominica: "dm", "Dominican Republic": "do", "El Salvador": "sv",
  Grenada: "gd", Guatemala: "gt", Guyana: "gy", Haiti: "ht", Honduras: "hn",
  Jamaica: "jm", Nicaragua: "ni", Panama: "pa", Paraguay: "py",
  "Puerto Rico": "pr", "Saint Kitts and Nevis": "kn", "Saint Lucia": "lc",
  "Saint Vincent and the Grenadines": "vc", Suriname: "sr",
  "Trinidad and Tobago": "tt", Venezuela: "ve",
  Fiji: "fj", "Papua New Guinea": "pg", Samoa: "ws", "Solomon Islands": "sb",
  Tahiti: "pf", Tonga: "to", Vanuatu: "vu",
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
