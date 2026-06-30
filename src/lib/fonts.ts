/**
 * Unicode "font" style registry.
 *
 * Each entry maps every ASCII letter (a-z, A-Z) and digit (0-9) to a Unicode
 * character that visually mimics a particular font or decoration. Conversion
 * is a simple per-character lookup — no font files, no canvas — so it works
 * instantly client-side and survives copy/paste into any Unicode-aware target
 * (Discord, Instagram bio, Facebook, etc.).
 *
 * Conventions:
 * - All mappers export a `name`, `slug`, `category`, and a `map` function.
 * - `map(input)` returns the converted string. Characters not in the map are
 *   passed through unchanged (spaces, punctuation, emoji).
 * - Styles are grouped into 4 categories used by the filter chips:
 *     `classic`   — Bold, Italic, Sans, Mono (clean typography)
 *     `decorative` — Script, Fraktur, Double-Struck (ornate)
 *     `game`      — Squared, Circled, Minecraft-style (gamer aesthetic)
 *     `accent`    — Strikethrough, Underline, Small caps, etc.
 */

export type FontCategory = "classic" | "decorative" | "game" | "accent";

export type FontStyle = {
  /** URL-safe identifier — used in `/fonts/[slug]` and the registry. */
  slug: string;
  /** Display name shown next to each converted result. */
  name: string;
  /** Short tagline under the style name in the list. */
  description: string;
  /** Category bucket — drives the filter chip UI. */
  category: FontCategory;
  /**
   * Pure function: input string → styled string. Characters not in the
   * mapping pass through unchanged.
   */
  map: (input: string) => string;
  /**
   * A 4-12 char sample of the style applied to "Hello", shown as a visual
   * swatch in the list and on landing pages. If absent, falls back to
   * `map("Hello")`.
   */
  preview?: string;
};

// Lowercase a-z in alphabetic order, used as a single source of truth for
// every mapper that builds a char-by-char lookup.
const A = "abcdefghijklmnopqrstuvwxyz".split("") as string[];

/**
 * Helper: given the lowercase + uppercase + digit mappings, return a
 * `map(input)` function. Anything not present in any of the three lookups
 * is passed through verbatim.
 */
function makeMap(
  lower: string[],
  upper: string[],
  digits: string[],
): (s: string) => string {
  const lookup = new Map<string, string>();
  A.forEach((c, i) => lookup.set(c, lower[i] ?? c));
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((c, i) => {
    lookup.set(c, upper[i] ?? c);
  });
  "0123456789".split("").forEach((c, i) => {
    lookup.set(c, digits[i] ?? c);
  });
  return (s: string) =>
    Array.from(s)
      .map((c) => lookup.get(c) ?? c)
      .join("");
}

// ---------------------------------------------------------------------------
// Group A: Real Unicode mathematical alphanumeric blocks
// ---------------------------------------------------------------------------
// Each block ships a complete a-z + A-Z + 0-9 set. Source of truth:
// https://en.wikipedia.org/wiki/Mathematical_Alphanumeric_Symbols

const boldSans = makeMap(
  // U+1D5D4..U+1D5ED (mathematical bold sans-serif lowercase)
  [
    "𝐚", "𝐛", "𝐜", "𝐝", "𝐞", "𝐟", "𝐠", "𝐡", "𝐢", "𝐣", "𝐤", "𝐥", "𝐦", "𝐧", "𝐨",
    "𝐩", "𝐪", "𝐫", "𝐬", "𝐭", "𝐮", "𝐯", "𝐰", "𝐱", "𝐲", "𝐳",
  ],
  // U+1D5D4..U+1D5ED is lowercase only; uppercase borrowed from U+1D400..U+1D419
  [
    "𝐀", "𝐁", "𝐂", "𝐃", "𝐄", "𝐅", "𝐆", "𝐇", "𝐈", "𝐉", "𝐊", "𝐋", "𝐌", "𝐍", "𝐎",
    "𝐏", "𝐐", "𝐑", "𝐒", "𝐓", "𝐔", "𝐕", "𝐖", "𝐗", "𝐘", "𝐙",
  ],
  // U+1D7CE..U+1D7D7 (mathematical bold digits)
  ["𝟎", "𝟏", "𝟐", "𝟑", "𝟒", "𝟓", "𝟔", "𝟕", "𝟖", "𝟗"],
);

const italic = makeMap(
  // U+1D44E..U+1D467 (mathematical italic lowercase) — note: ℎ is U+210E
  [
    "𝑎", "𝑏", "𝑐", "𝑑", "𝑒", "𝑓", "𝑔", "ℎ", "𝑖", "𝑗", "𝑘", "𝑙", "𝑚", "𝑛", "𝑜",
    "𝑝", "𝑞", "𝑟", "𝑠", "𝑡", "𝑢", "𝑣", "𝑤", "𝑥", "𝑦", "𝑧",
  ],
  // U+1D434..U+1D44D (mathematical italic uppercase) — H is U+210B
  [
    "𝐴", "𝐵", "𝐶", "𝐷", "𝐸", "𝐹", "𝐺", "𝐻", "𝐼", "𝐽", "𝐾", "𝐿", "𝑀", "𝑁", "𝑂",
    "𝑃", "𝑄", "𝑅", "𝑆", "𝑇", "𝑈", "𝑉", "𝑊", "𝑋", "𝑌", "𝑍",
  ],
  // No dedicated italic digits — italic numerals are rarely supported. Fall
  // through to plain digits so users don't get "missing glyph" boxes.
  ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
);

const boldItalic = makeMap(
  // U+1D482..U+1D49B (mathematical bold italic lowercase)
  [
    "𝒂", "𝒃", "𝒄", "𝒅", "𝒆", "𝒇", "𝒈", "𝒉", "𝒊", "𝒋", "𝒌", "𝒍", "𝒎", "𝒏", "𝒐",
    "𝒑", "𝒒", "𝒓", "𝒔", "𝒕", "𝒖", "𝒗", "𝒘", "𝒙", "𝒚", "𝒛",
  ],
  // U+1D468..U+1D481 (mathematical bold italic uppercase)
  [
    "𝑨", "𝑩", "𝑪", "𝑫", "𝑬", "𝑭", "𝑮", "𝑯", "𝑰", "𝑱", "𝑲", "𝑳", "𝑴", "𝑵", "𝑶",
    "𝑷", "𝑸", "𝑹", "𝑺", "𝑻", "𝑼", "𝑽", "𝑾", "𝑿", "𝒀", "𝒁",
  ],
  ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
);

const cursive = makeMap(
  // U+1D4B6..U+1D4CF (mathematical script lowercase) — fallback h from U+210E
  [
    "𝒶", "𝒷", "𝒸", "𝒹", "𝑒", "𝒻", "𝑔", "𝒽", "𝒾", "𝒿", "𝓀", "𝓁", "𝓂", "𝓃", "𝑜",
    "𝓅", "𝓆", "𝓇", "𝓈", "𝓉", "𝓊", "𝓋", "𝓌", "𝓍", "𝓎", "𝓏",
  ],
  // U+1D49C..U+1D4B5 (mathematical script uppercase)
  [
    "𝒜", "𝐵", "𝒞", "𝒟", "𝐸", "𝐹", "𝒢", "𝐻", "𝐼", "𝒥", "𝒦", "𝐿", "𝑀", "𝒩", "𝒪",
    "𝒫", "𝒬", "𝑅", "𝒮", "𝒯", "𝒰", "𝒱", "𝒲", "𝒳", "𝒴", "𝒵",
  ],
  ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
);

const boldCursive = makeMap(
  // U+1D4D0..U+1D4E9 (mathematical bold script lowercase)
  [
    "𝓪", "𝓫", "𝓬", "𝓭", "𝓮", "𝓯", "𝓰", "𝓱", "𝓲", "𝓳", "𝓴", "𝓵", "𝓶", "𝓷", "𝓸",
    "𝓹", "𝓺", "𝓻", "𝓼", "𝓽", "𝓾", "𝓿", "𝔀", "𝔁", "𝔂", "𝔃",
  ],
  // U+1D4EA..U+1D503 (mathematical bold script uppercase)
  [
    "𝓐", "𝓑", "𝓒", "𝓓", "𝓔", "𝓕", "𝓖", "𝓗", "𝓘", "𝓙", "𝓚", "𝓛", "𝓜", "𝓝", "𝓞",
    "𝓟", "𝓠", "𝓡", "𝓢", "𝓣", "𝓤", "𝓥", "𝓦", "𝓧", "𝓨", "𝓩",
  ],
  ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
);

const fraktur = makeMap(
  // U+1D51E..U+1D537 (mathematical fraktur lowercase)
  [
    "𝔞", "𝔟", "𝔠", "𝔡", "𝔢", "𝔣", "𝔤", "𝔥", "𝔦", "𝔧", "𝔨", "𝔩", "𝔪", "𝔫", "𝔬",
    "𝔭", "𝔮", "𝔯", "𝔰", "𝔱", "𝔲", "𝔳", "𝔴", "𝔵", "𝔶", "𝔷",
  ],
  // U+1D504..U+1D51D (mathematical fraktur uppercase)
  [
    "𝔄", "𝔅", "ℭ", "𝔇", "𝔈", "𝔉", "𝔊", "ℌ", "ℑ", "𝔍", "𝔎", "𝔏", "𝔐", "𝔑", "𝔒",
    "𝔓", "𝔔", "ℜ", "𝔖", "𝔗", "𝔘", "𝔙", "𝔚", "𝔛", "𝔜", "ℨ",
  ],
  ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
);

const boldFraktur = makeMap(
  // U+1D586..U+1D59F (mathematical bold fraktur lowercase)
  [
    "𝖆", "𝖇", "𝖈", "𝖉", "𝖊", "𝖋", "𝖌", "𝖍", "𝖎", "𝖏", "𝖐", "𝖑", "𝖒", "𝖓", "𝖔",
    "𝖕", "𝖖", "𝖗", "𝖘", "𝖙", "𝖚", "𝖛", "𝖜", "𝖝", "𝖞", "𝖟",
  ],
  // U+1D56C..U+1D585 (mathematical bold fraktur uppercase)
  [
    "𝕬", "𝕭", "𝕮", "𝕯", "𝕰", "𝕱", "𝕲", "𝕳", "𝕴", "𝕵", "𝕶", "𝕷", "𝕸", "𝕹", "𝕺",
    "𝕻", "𝕼", "𝕽", "𝕾", "𝕿", "𝖀", "𝖁", "𝖂", "𝖃", "𝖄", "𝖅",
  ],
  ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
);

const doubleStruck = makeMap(
  // U+1D552..U+1D56B (mathematical double-struck lowercase) — h is U+210E fallback
  [
    "𝕒", "𝕓", "𝕔", "𝕕", "𝕖", "𝕗", "𝕘", "𝕙", "𝕚", "𝕛", "𝕜", "𝕝", "𝕞", "𝕟", "𝕠",
    "𝕡", "𝕢", "𝕣", "𝕤", "𝕥", "𝕦", "𝕧", "𝕨", "𝕩", "𝕪", "𝕫",
  ],
  // U+1D538..U+1D551 (mathematical double-struck uppercase)
  [
    "𝔸", "𝔹", "ℂ", "𝔻", "𝔼", "𝔽", "𝔾", "ℍ", "𝕀", "𝕁", "𝕂", "𝕃", "𝕄", "ℕ", "𝕆",
    "ℙ", "ℚ", "ℝ", "𝕊", "𝕋", "𝕌", "𝕍", "𝕎", "𝕏", "𝕐", "ℤ",
  ],
  // U+1D7D8..U+1D7E1 (mathematical double-struck digits)
  ["𝟘", "𝟙", "𝟚", "𝟛", "𝟜", "𝟝", "𝟞", "𝟟", "𝟠", "𝟡"],
);

const monospace = makeMap(
  // U+1D68A..U+1D6A3 (mathematical monospace lowercase)
  [
    "𝚊", "𝚋", "𝚌", "𝚍", "𝚎", "𝚏", "𝚐", "𝚑", "𝚒", "𝚓", "𝚔", "𝚕", "𝚖", "𝚗", "𝚘",
    "𝚙", "𝚚", "𝚛", "𝚜", "𝚝", "𝚞", "𝚟", "𝚠", "𝚡", "𝚢", "𝚣",
  ],
  // U+1D670..U+1D689 (mathematical monospace uppercase)
  [
    "𝙰", "𝙱", "𝙲", "𝙳", "𝙴", "𝙵", "𝙶", "𝙷", "𝙸", "𝙹", "𝙺", "𝙻", "𝙼", "𝙽", "𝙾",
    "𝙿", "𝚀", "𝚁", "𝚂", "𝚃", "𝚄", "𝚅", "𝚆", "𝚇", "𝚈", "𝚉",
  ],
  // U+1D7F6..U+1D7FF (mathematical monospace digits)
  ["𝟶", "𝟷", "𝟸", "𝟹", "𝟺", "𝟻", "𝟼", "𝟽", "𝟾", "𝟿"],
);

const sansSerif = makeMap(
  // U+1D5BA..U+1D5D3 (mathematical sans-serif lowercase)
  [
    "𝖺", "𝖻", "𝖼", "𝖽", "𝖾", "𝖿", "𝗀", "𝗁", "𝗂", "𝗃", "𝗄", "𝗅", "𝗆", "𝗇", "𝗈",
    "𝗉", "𝗊", "𝗋", "𝗌", "𝗍", "𝗎", "𝗏", "𝗐", "𝗑", "𝗒", "𝗓",
  ],
  // U+1D5A0..U+1D5B9 (mathematical sans-serif uppercase)
  [
    "𝖠", "𝖡", "𝖢", "𝖣", "𝖤", "𝖥", "𝖦", "𝖧", "𝖨", "𝖩", "𝖪", "𝖫", "𝖬", "𝖭", "𝖮",
    "𝖯", "𝖰", "𝖱", "𝖲", "𝖳", "𝖴", "𝖵", "𝖶", "𝖷", "𝖸", "𝖹",
  ],
  // U+1D7E2..U+1D7EB (mathematical sans-serif digits)
  ["𝟢", "𝟣", "𝟤", "𝟥", "𝟦", "𝟧", "𝟨", "𝟩", "𝟪", "𝟫"],
);

// ---------------------------------------------------------------------------
// Group B: Decorations (combining diacritics + symbol overlays)
// ---------------------------------------------------------------------------

/**
 * Apply a Unicode combining character after every character in `s`. Skips
 * whitespace, line breaks, and emoji-like code points so the result still
 * reads cleanly.
 */
function decorate(input: string, combining: string): string {
  return Array.from(input)
    .map((c) => {
      const code = c.codePointAt(0) ?? 0;
      // Skip whitespace, control chars, surrogate halves — combining marks
      // attached to these render as broken tofu or vanish entirely.
      if (
        code <= 0x20 ||
        (code >= 0xd800 && code <= 0xdfff) ||
        c === "\n" ||
        c === "\r"
      ) {
        return c;
      }
      return c + combining;
    })
    .join("");
}

const strikethrough = (s: string) => decorate(s, "\u0336"); // COMBINING LONG STROKE OVERLAY
const underline = (s: string) => decorate(s, "\u0332"); // COMBINING LOW LINE
const doubleUnderline = (s: string) => decorate(s, "\u0333"); // COMBINING DOUBLE LOW LINE
const overline = (s: string) => decorate(s, "\u0305"); // COMBINING OVERLINE

// Small caps: lowercase → uppercase small-caps (U+1D04..U+1D0A + U+0299 etc.),
// uppercase stays uppercase (small caps only has a partial alphabet; we
// expand it with a few fallbacks).
const smallCaps = (s: string) =>
  Array.from(s)
    .map((c) => {
      const map: Record<string, string> = {
        a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ", h: "ʜ",
        i: "ɪ", j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ",
        q: "ǫ", r: "ʀ", s: "ꜱ", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x",
        y: "ʏ", z: "ᴢ",
      };
      const lower = map[c.toLowerCase()];
      if (!lower) return c;
      // If original was uppercase, render the small-cap as uppercase.
      return c === c.toUpperCase() ? lower.toUpperCase() : lower;
    })
    .join("");

// Subscript / superscript: full a-z + 0-9 maps exist for these. We pad any
// missing chars with their plain equivalents so the result stays readable.
const SUBSCRIPT_MAP: Record<string, string> = {
  "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅",
  "6": "₆", "7": "₇", "8": "₈", "9": "₉",
  a: "ₐ", e: "ₑ", h: "ₕ", i: "ᵢ", j: "ⱼ", k: "ₖ", l: "ₗ", m: "ₘ",
  n: "ₙ", o: "ₒ", p: "ₚ", r: "ᵣ", s: "ₛ", t: "ₜ", u: "ᵤ", v: "ᵥ", x: "ₓ",
};
const SUPERSCRIPT_MAP: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵",
  "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  a: "ᵃ", b: "ᵇ", c: "ᶜ", d: "ᵈ", e: "ᵉ", f: "ᶠ", g: "ᵍ", h: "ʰ",
  i: "ⁱ", j: "ʲ", k: "ᵏ", l: "ˡ", m: "ᵐ", n: "ⁿ", o: "ᵒ", p: "ᵖ",
  r: "ʳ", s: "ˢ", t: "ᵗ", u: "ᵘ", v: "ᵛ", w: "ʷ", x: "ˣ", y: "ʸ", z: "ᶻ",
};

const subscript = (s: string) =>
  Array.from(s)
    .map((c) => SUBSCRIPT_MAP[c.toLowerCase()] ?? c)
    .join("");
const superscript = (s: string) =>
  Array.from(s)
    .map((c) => SUPERSCRIPT_MAP[c.toLowerCase()] ?? c)
    .join("");

// ---------------------------------------------------------------------------
// Group C: Symbology (circled, squared, inverted)
// ---------------------------------------------------------------------------

/**
 * Map for U+24B6..U+24CF (circled Latin uppercase) + U+2460..U+2468 (circled
 * digits). Lowercase letters don't have a dedicated circled block, so we
 * fall back to uppercase → circled-uppercase.
 */
const CIRCLED_MAP: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((c, i) => {
    out[c.toLowerCase()] = String.fromCodePoint(0x24b6 + i);
    out[c] = String.fromCodePoint(0x24b6 + i);
  });
  "0123456789".split("").forEach((d, i) => {
    out[d] = String.fromCodePoint(0x2460 + i);
  });
  return out;
})();
const bubble = (s: string) =>
  Array.from(s)
    .map((c) => CIRCLED_MAP[c] ?? c)
    .join("");

/**
 * Negative-circled (squared-style, black square behind white letter) — used
 * by the "squared" / Minecraft-style aesthetic. Uses U+1F150..U+1F169 + the
 * supplemental negative-circled alphabet U+1F130..U+1F149 for letters.
 */
const SQUARED_MAP: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  // Negative-circled uppercase A-Z — U+1F150..U+1F169 covers A..Z (with a few
  // gaps); we use the regional-indicator symbols U+1F1E6..U+1F1FF as a
  // visually-equivalent fallback for the rest.
  const REGIONAL_A = 0x1f1e6;
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((c, i) => {
    out[c] = String.fromCodePoint(REGIONAL_A + i);
    out[c.toLowerCase()] = String.fromCodePoint(REGIONAL_A + i);
  });
  // Digits: U+1F150..U+1F159 isn't digits — fall back to plain.
  "0123456789".split("").forEach((d) => {
    out[d] = d;
  });
  return out;
})();
const squared = (s: string) =>
  Array.from(s)
    .map((c) => SQUARED_MAP[c] ?? c)
    .join("");

/**
 * Upside-down / inverted Latin letters — U+0250..U+02DF has the characters
 * for a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/q/r/s/t/u/v/w/x/y/z flipped.
 *
 * Source: combined ranges from the IPA / Latin Extended blocks. Anything
 * not mappable stays as-is.
 */
const INVERTED_MAP: Record<string, string> = {
  a: "ɐ", b: "q", c: "ɔ", d: "p", e: "ǝ", f: "ɟ", g: "ƃ", h: "ɥ",
  i: "ᴉ", j: "ɾ", k: "ʞ", l: "ן", m: "ɯ", n: "u", o: "o", p: "d",
  q: "b", r: "ɹ", s: "s", t: "ʇ", u: "n", v: "ʌ", w: "ʍ", x: "x",
  y: "ʎ", z: "z",
  // Uppercase invertibles (limited set)
  A: "∀", B: "𐐒", C: "Ɔ", D: "p", E: "Ǝ", F: "Ⅎ", G: "פ", H: "H",
  I: "I", J: "ſ", K: "ʞ", L: "˥", M: "W", N: "N", O: "O", P: "Ԁ",
  Q: "Ό", R: "ɹ", S: "S", T: "┴", U: "∩", V: "Λ", W: "M", X: "X",
  Y: "⅄", Z: "Z",
  "0": "0", "1": "Ɩ", "2": "ᄅ", "3": "Ɛ", "4": "ㄣ", "5": "ϛ",
  "6": "9", "7": "ㄥ", "8": "8", "9": "6",
  ".": "˙", ",": "'", "?": "¿", "!": "¡",
};
const upsideDown = (s: string) =>
  Array.from(s)
    .reverse()
    .map((c) => INVERTED_MAP[c] ?? c)
    .join("");

// ---------------------------------------------------------------------------
// Group D: More real Unicode blocks (math sans-italic, fullwidth, etc.)
// ---------------------------------------------------------------------------

/**
 * Mathematical Sans-Serif Italic. Lowercase U+1D622..U+1D63B. Uppercase
 * U+1D608..U+1D621. No dedicated italic digits — fall through to plain.
 */
const sansItalic = makeMap(
  [
    "𝘢", "𝘣", "𝘤", "𝘥", "𝘦", "𝘧", "𝘨", "𝘩", "𝘪", "𝘫", "𝘬", "𝘭", "𝘮", "𝘯", "𝘰",
    "𝘱", "𝘲", "𝘳", "𝘴", "𝘵", "𝘶", "𝘷", "𝘸", "𝘹", "𝘺", "𝘻",
  ],
  [
    "𝘈", "𝘉", "𝘊", "𝘋", "𝘌", "𝘍", "𝘎", "𝘏", "𝘐", "𝘑", "𝘒", "𝘓", "𝘔", "𝘕", "𝘖",
    "𝘗", "𝘘", "𝘙", "𝘚", "𝘛", "𝘜", "𝘝", "𝘞", "𝘟", "𝘠", "𝘡",
  ],
  // No dedicated italic digits — fall through to plain so the result
  // doesn't get "missing glyph" boxes on platforms that lack them.
  ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
);

/**
 * Mathematical Sans-Serif Bold Italic. Lowercase U+1D656..U+1D66F.
 * Uppercase U+1D63C..U+1D655.
 */
const sansBoldItalic = makeMap(
  [
    "𝙖", "𝙗", "𝙘", "𝙙", "𝙚", "𝙛", "𝙜", "𝙝", "𝙞", "𝙟", "𝙺", "𝙻", "𝙼", "𝙽", "𝙾",
    "𝙿", "𝚀", "𝚁", "𝚂", "𝚃", "𝚄", "𝚅", "𝚆", "𝚇", "𝚈", "𝚉",
  ],
  [
    "𝙰", "𝙱", "𝙲", "𝙳", "𝙴", "𝙵", "𝙶", "𝙷", "𝙸", "𝙹", "𝙺", "𝙻", "𝙼", "𝙽", "𝙾",
    "𝙿", "𝚀", "𝚁", "𝚂", "𝚃", "𝚄", "𝚅", "𝚆", "𝚇", "𝚈", "𝚉",
  ],
  ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
);

/**
 * Fullwidth Forms. Uppercase U+FF21..U+FF3A, lowercase U+FF41..U+FF5A,
 * digits U+FF10..U+FF19. Renders as wide Latin letters (commonly used to
 * imitate Chinese / Japanese text width on Western keyboards).
 */
const fullwidth = makeMap(
  [
    "ａ", "ｂ", "ｃ", "ｄ", "ｅ", "ｆ", "ｇ", "ｈ", "ｉ", "ｊ", "ｋ", "ｌ", "ｍ", "ｎ", "ｏ",
    "ｐ", "ｑ", "ｒ", "ｓ", "ｔ", "ｕ", "ｖ", "ｗ", "ｘ", "ｙ", "ｚ",
  ],
  [
    "Ａ", "Ｂ", "Ｃ", "Ｄ", "Ｅ", "Ｆ", "Ｇ", "Ｈ", "Ｉ", "Ｊ", "Ｋ", "Ｌ", "Ｍ", "Ｎ", "Ｏ",
    "Ｐ", "Ｑ", "Ｒ", "Ｓ", "Ｔ", "Ｕ", "Ｖ", "Ｗ", "Ｘ", "Ｙ", "Ｚ",
  ],
  ["０", "１", "２", "３", "４", "５", "６", "７", "８", "９"],
);

/**
 * Parenthesized Latin. Uppercase U+1F110..U+1F129, lowercase U+1F130..U+1F149
 * (a couple of which are emoji-skinned — fall through gracefully for any
 * letters the standard didn't allocate).
 */
const parenthesized = makeMap(
  [
    "⒜", "⒝", "⒞", "⒟", "⒠", "⒡", "⒢", "⒣", "⒤", "⒥", "⒦", "⒧", "⒨", "⒩", "⒪",
    "⒫", "⒬", "⒭", "⒮", "⒯", "⒰", "⒱", "⒲", "⒳", "⒴", "⒵",
  ],
  [
    "🄐", "🄑", "🄒", "🄓", "🄔", "🄕", "🄖", "🄗", "🄘", "🄙", "🄚", "🄛", "🄜", "🄝", "🄞",
    "🄟", "🄠", "🄡", "🄢", "🄣", "🄤", "🄥", "🄦", "🄧", "🄨", "🄩",
  ],
  ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
);

/**
 * Circled Latin. Distinct from "bubble" in the registry:
 *   - `bubble`   maps lowercase letters to UPPERCASE-circled (ⒶⒷⒸ) since
 *                the Unicode lowercase-circled block has gaps.
 *   - `circled`  here maps lowercase to the dedicated lowercase-circled
 *                block U+24D0..U+24E9 (ⓐⓑⓒ), preserving case.
 *
 * Visually similar in headlining text, but case-preserving ⓐⓑⓒ is the
 * preferred form on modern platforms like Discord and Twitter.
 */
const circled = makeMap(
  // U+24D0..U+24E9 — circled Latin SMALL letters
  [
    "ⓐ", "ⓑ", "ⓒ", "ⓓ", "ⓔ", "ⓕ", "ⓖ", "ⓗ", "ⓘ", "ⓙ", "ⓚ", "ⓛ", "ⓜ", "ⓝ", "ⓞ",
    "ⓟ", "ⓠ", "ⓡ", "ⓢ", "ⓣ", "ⓤ", "ⓥ", "ⓦ", "ⓧ", "ⓨ", "ⓩ",
  ],
  // U+24B6..U+24CF — circled Latin CAPITAL letters
  [
    "Ⓐ", "Ⓑ", "Ⓒ", "Ⓓ", "Ⓔ", "Ⓕ", "Ⓖ", "Ⓗ", "Ⓘ", "Ⓙ", "Ⓚ", "Ⓛ", "Ⓜ", "Ⓝ", "Ⓞ",
    "Ⓟ", "Ⓠ", "Ⓡ", "Ⓢ", "Ⓣ", "Ⓤ", "Ⓥ", "Ⓦ", "Ⓧ", "Ⓨ", "Ⓩ",
  ],
  ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
);

// ---------------------------------------------------------------------------
// Group E: Decorative wraps (heart / star / diamond / slash)
// ---------------------------------------------------------------------------

/**
 * Wrap each character between two decorative symbols (heart / star /
 * diamond / slash). Spaces pass through unwrapped so the original phrase
 * structure stays readable.
 */
function wrap(input: string, left: string, right: string): string {
  return Array.from(input)
    .map((c) => {
      if (c === " ") return c;
      return left + c + right;
    })
    .join("");
}

const heart = (s: string) => wrap(s, "❤", "");
const star = (s: string) => wrap(s, "★", "");
const diamond = (s: string) => wrap(s, "◆", "");
const slashFrame = (s: string) => wrap(s, "／", "＼");

// ---------------------------------------------------------------------------
// Group F: Homoglyphs — letters from other scripts that look like Latin
// ---------------------------------------------------------------------------

/**
 * Cyrillic letters that visually resemble Latin counterparts. Used by
 * spammers and font-generator communities for years to bypass naive
 * filters. The mapping is intentionally limited to the visual homoglyphs
 * (only letters that actually look like Latin A-Z / a-z).
 */
const CYRILLIC_MAP: Record<string, string> = {
  a: "а", // Cyrillic a (U+0430)
  e: "е", // Cyrillic ie (U+0435)
  o: "о", // Cyrillic o (U+043E)
  p: "р", // Cyrillic er (U+0440)
  c: "с", // Cyrillic es (U+0441)
  x: "х", // Cyrillic kha (U+0445)
  y: "у", // Cyrillic u (U+0443)
  i: "і", // Cyrillic i (U+0456) — actually Ukrainian
  j: "ј", // Cyrillic je (U+0458)
  s: "ѕ", // Cyrillic dze (U+0455)
  b: "Ь", // Cyrillic soft sign (uppercase B-like)
  h: "һ", // Cyrillic shha (U+04BB)
  m: "м", // Cyrillic em (U+043C)
  // uppercase
  A: "А", B: "В", C: "С", E: "Е", H: "Н", K: "К", M: "М",
  O: "О", P: "Р", T: "Т", X: "Х", Y: "У",
};
const cyrillic = (s: string) =>
  Array.from(s)
    .map((c) => CYRILLIC_MAP[c] ?? c)
    .join("");

/**
 * Currency-look-alike letter substitutes. ¢ for c, £ for L, ¥ for Y, etc.
 * Limited to characters that are visually passable as Latin.
 */
const CURRENCY_MAP: Record<string, string> = {
  c: "¢",
  C: "¢",
  L: "£",
  l: "£",
  Y: "¥",
  y: "¥",
  E: "€", // visually similar
  e: "€",
  O: "°", // degree sign
  o: "°",
  x: "×", // multiplication sign
  X: "×",
};
const currency = (s: string) =>
  Array.from(s)
    .map((c) => CURRENCY_MAP[c] ?? c)
    .join("");

// ---------------------------------------------------------------------------
// Group G: Combining-character decorations
// ---------------------------------------------------------------------------

/**
 * Apply a combining diacritical mark after every base character in `s`.
 * The full set here covers:
 *   - wave     — combining tilde (~̃)
 *   - dot      — combining dot above (˙)
 *   - breve    — combining breve (˘)
 *   - macron   — combining macron (¯)
 *   - ring     — combining ring above (°)
 *
 * All marks attach after the base character and render in the same color
 * as the underlying letter, so the original phrase stays legible even
 * though each character now wears a small decoration.
 */
function combiningOverlay(input: string, combining: string): string {
  return Array.from(input)
    .map((c) => {
      const code = c.codePointAt(0) ?? 0;
      if (
        code <= 0x20 ||
        (code >= 0xd800 && code <= 0xdfff) ||
        c === "\n" ||
        c === "\r"
      ) {
        return c;
      }
      return c + combining;
    })
    .join("");
}

const wave = (s: string) => combiningOverlay(s, "\u0303"); // COMBINING TILDE
const dot = (s: string) => combiningOverlay(s, "\u0307"); // COMBINING DOT ABOVE
const breve = (s: string) => combiningOverlay(s, "\u0306"); // COMBINING BREVE
const macron = (s: string) => combiningOverlay(s, "\u0304"); // COMBINING MACRON
const ring = (s: string) => combiningOverlay(s, "\u030A"); // COMBINING RING ABOVE

// ---------------------------------------------------------------------------
// Group H: Mathematical Bold Serif — distinct from bold-sans (Group A)
// ---------------------------------------------------------------------------

/**
 * Mathematical Bold Serif (NOT sans-serif bold). Lowercase U+1D41A..U+1D433,
 * uppercase U+1D400..U+1D419. Visually distinguished from `bold` by the
 * small serif terminals on each letter.
 */
const boldSerif = makeMap(
  [
    "𝐚", "𝐛", "𝐜", "𝐝", "𝐞", "𝐟", "𝐠", "𝐡", "𝐢", "𝐣", "𝐤", "𝐥", "𝐦", "𝐧", "𝐨",
    "𝐩", "𝐪", "𝐫", "𝐬", "𝐭", "𝐮", "𝐯", "𝐰", "𝐱", "𝐲", "𝐳",
  ],
  [
    "𝐀", "𝐁", "𝐂", "𝐃", "𝐄", "𝐅", "𝐆", "𝐇", "𝐈", "𝐉", "𝐊", "𝐋", "𝐌", "𝐍", "𝐎",
    "𝐏", "𝐐", "𝐑", "𝐒", "𝐓", "𝐔", "𝐕", "𝐖", "𝐗", "𝐘", "𝐙",
  ],
  // U+1D7CE..U+1D7D7 (mathematical bold digits)
  ["𝟎", "𝟏", "𝟐", "𝟑", "𝟒", "𝟓", "𝟔", "𝟕", "𝟖", "𝟗"],
);

// ---------------------------------------------------------------------------
// Group I: Greek lookalikes — Greek letters visually identical to Latin
// ---------------------------------------------------------------------------

/**
 * Greek letters that match Latin a-z / A-Z glyph-for-glyph. Same
 * trick used by the existing Cyrillic style — the output reads as
 * Latin to a casual viewer but is technically a different script,
 * which can bypass naive search/replace filters.
 */
const GREEK_MAP: Record<string, string> = {
  a: "α", A: "Α",
  b: "β", B: "Β",
  c: "ϲ", C: "Ϲ",
  e: "ε", E: "Ε",
  h: "η", H: "Η",
  i: "ι", I: "Ι",
  k: "κ", K: "Κ",
  m: "μ", M: "Μ",
  n: "ν", N: "Ν",
  o: "ο", O: "Ο",
  p: "ρ", P: "Ρ",
  t: "τ", T: "Τ",
  x: "χ", X: "Χ",
  y: "υ", Y: "Υ",
  z: "ζ", Z: "Ζ",
};
const greek = (s: string) =>
  Array.from(s).map((c) => GREEK_MAP[c] ?? c).join("");

// Two curated variants — only uppercase, or only lowercase. Both reduce
// the chance of double-letter collisions when the user pastes alongside
// plain Latin text.
const greekUpper = (s: string) =>
  Array.from(s).map((c) => GREEK_MAP[c.toUpperCase()] ?? c).join("");
const greekLower = (s: string) =>
  Array.from(s).map((c) => GREEK_MAP[c.toLowerCase()] ?? c).join("");

// ---------------------------------------------------------------------------
// Group H: Negative Squared & Negative Circled — black-bg fills
// ---------------------------------------------------------------------------

/**
 * Negative Squared Latin Capital — U+1F170..U+1F189. Black square with
 * white letter inside. The existing `squared` style uses regional
 * indicators (U+1F1E6..) which look like white square + black letter;
 * this one is the inverted color scheme.
 */
const NEG_SQUARED_MAP: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  // U+1F170..U+1F189 covers A..Z (26 letters in 26 code points).
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((c, i) => {
    out[c] = String.fromCodePoint(0x1f170 + i);
    out[c.toLowerCase()] = String.fromCodePoint(0x1f170 + i);
  });
  return out;
})();
const negativeSquared = (s: string) =>
  Array.from(s).map((c) => NEG_SQUARED_MAP[c] ?? c).join("");

/**
 * Negative Circled Latin Capital — U+1F150..U+1F169. Black circle with
 * white letter inside. Same color-swap relationship to `circled`/`bubble`
 * as negative-squared has to squared.
 */
const NEG_CIRCLED_MAP: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((c, i) => {
    out[c] = String.fromCodePoint(0x1f150 + i);
    out[c.toLowerCase()] = String.fromCodePoint(0x1f150 + i);
  });
  return out;
})();
const negativeCircled = (s: string) =>
  Array.from(s).map((c) => NEG_CIRCLED_MAP[c] ?? c).join("");

// ---------------------------------------------------------------------------
// Group J: Armenian lookalikes — letters from U+0530..U+058F
// ---------------------------------------------------------------------------

/**
 * Armenian letters that visually match Latin A-Z / a-z. Smaller crossover
 * than Cyrillic/Greek (~16 letters) but the resulting letterforms are
 * notably different from Greek and Cyrillic, giving the text a distinct
 * decorative flavor that bypasses naive script-detection.
 */
const ARMENIAN_MAP: Record<string, string> = {
  a: "ա", A: "Ա",
  b: "բ", B: "Բ",
  g: "գ", G: "Գ",
  d: "դ", D: "Դ",
  e: "ե", E: "Ե",
  z: "զ", Z: "Զ",
  i: "ի", I: "Ի",
  l: "լ", L: "Լ",
  m: "մ", M: "Մ",
  n: "ն", N: "Ն",
  o: "ո", O: "Ո",
  p: "պ", P: "Պ",
  s: "ս", S: "Ս",
  v: "վ", V: "Վ",
  t: "տ", T: "Տ",
  r: "ր", R: "Ր",
  f: "ֆ", F: "Ֆ",
  u: "ու", U: "Ու", // rough visual approximation
};
const armenian = (s: string) =>
  Array.from(s).map((c) => ARMENIAN_MAP[c] ?? c).join("");
const armenianUpper = (s: string) =>
  Array.from(s).map((c) => ARMENIAN_MAP[c.toUpperCase()] ?? c).join("");
const armenianLower = (s: string) =>
  Array.from(s).map((c) => ARMENIAN_MAP[c.toLowerCase()] ?? c).join("");

// ---------------------------------------------------------------------------
// Group K: IPA Latin — phonetic letters matching Latin (U+0250..U+02AF)
// ---------------------------------------------------------------------------

/**
 * Letters from the IPA Extensions block that look like Latin counterparts.
 * The full block has 96 phonetic chars; we cherry-pick the ones that
 * actually look like a-z / A-Z. Examples: æ (ash), ɔ (open o), ɐ (turned
 * a), ə (schwa), ɝ (reversed e), ɢ (small G), ɪ (small i), ɴ (small n),
 * ɸ (phi), ʃ (esh), ʈ (T with retroflex), ʊ (small u), ʌ (turned v),
 * ʒ (ezh), θ (theta).
 */
const IPA_MAP: Record<string, string> = {
  a: "æ", A: "Æ",
  b: "ʙ", B: "Ɓ",
  c: "ç", C: "Ç",
  d: "ɖ", D: "Ɗ",
  e: "ə", E: "Ə",
  f: "ɸ", F: "Ƒ",
  g: "ɢ", G: "Ƣ",
  h: "ɦ", H: "Ƕ",
  i: "ɪ", I: "Ɨ",
  j: "ɟ", J: "Ɉ",
  k: "ƙ", K: "Ƙ",
  l: "ʟ", L: "Ƚ",
  m: "ɱ", M: "Ṁ",
  n: "ɴ", N: "Ɲ",
  o: "ɔ", O: "Ɔ",
  p: "ƥ", P: "Ƥ",
  r: "ɹ", R: "Ʀ",
  s: "ʃ", S: "Ʃ",
  t: "ʈ", T: "Ƭ",
  u: "ʊ", U: "Ʊ",
  v: "ʌ", V: "Ʋ",
  w: "ʍ", W: "Ɯ",
  x: "χ", X: "Χ",
  y: "ʎ", Y: "Ƴ",
  z: "ʒ", Z: "Ʒ",
};
const ipa = (s: string) =>
  Array.from(s).map((c) => IPA_MAP[c] ?? c).join("");

// ---------------------------------------------------------------------------
// Group L: Turned Latin — flipped letter variants (U+0250..U+02AF subset)
// ---------------------------------------------------------------------------

/**
 * Distinct from `upsideDown` (which both mirrors AND reverses): these are
 * just individually flipped letters, NOT reversed in order. Useful for
 * stylized word-marks where you want a few mirrored letters mixed with
 * normal ones.
 */
const TURNED_MAP: Record<string, string> = {
  a: "ɐ", A: "∀",
  b: "q",  B: "ꓭ",
  c: "ɔ",  C: "Ɔ",
  d: "p",  D: "p",
  e: "ǝ",  E: "Ǝ",
  f: "ɟ",  F: "Ⅎ",
  g: "ƃ",  G: "⅁",
  h: "ɥ",  H: "H",
  i: "ᴉ",  I: "I",
  j: "ɾ",  J: "ſ",
  k: "ʞ",  K: "ʞ",
  l: "ן",  L: "˥",
  m: "ɯ",  M: "W",
  n: "u",  N: "N",
  o: "o",  O: "O",
  p: "d",  P: "Ԁ",
  q: "b",  Q: "Ό",
  r: "ɹ",  R: "ɹ",
  s: "s",  S: "S",
  t: "ʇ",  T: "┴",
  u: "n",  U: "∩",
  v: "ʌ",  V: "Λ",
  w: "ʍ",  W: "M",
  x: "x",  X: "X",
  y: "ʎ",  Y: "⅄",
  z: "z",  Z: "Z",
};
const turned = (s: string) =>
  Array.from(s).map((c) => TURNED_MAP[c] ?? c).join("");

// ---------------------------------------------------------------------------
// Group M: Latin Extended-B — exotic letterforms (U+0180..U+024F)
// ---------------------------------------------------------------------------

/**
 * Letterforms from Latin Extended-B that look like Latin counterparts but
 * with subtle strokes or curls. Often used in older print typography.
 */
const LATIN_EXB_MAP: Record<string, string> = {
  a: "ą", A: "Ą",
  b: "ƀ", B: "Ɓ",
  c: "ƈ", C: "Ƈ",
  d: "đ", D: "Đ",
  e: "ę", E: "Ę",
  f: "ƒ", F: "Ƒ",
  g: "ğ", G: "Ğ",
  h: "ħ", H: "Ħ",
  i: "į", I: "Į",
  j: "ǰ", J: "ǰ",
  k: "ķ", K: "Ķ",
  l: "ŀ", L: "Ł",
  n: "ń", N: "Ń",
  o: "ő", O: "Ő",
  r: "ř", R: "Ř",
  s: "š", S: "Š",
  t: "ť", T: "Ť",
  u: "ų", U: "Ų",
  y: "ý", Y: "Ý",
  z: "ž", Z: "Ž",
};
const latinExB = (s: string) =>
  Array.from(s).map((c) => LATIN_EXB_MAP[c] ?? c).join("");

// ---------------------------------------------------------------------------
// Group N: Latin Extended-D small caps (U+A730..U+A78F)
// ---------------------------------------------------------------------------

/**
 * Latin Extended-D contains special small-caps variants that differ from
 * the standard Latin small-caps block. Notably:
 *   ꜰ (U+A730) — small caps F variant
 *   ꜱ (U+A731) — small caps S variant
 *   Ꜳ ꜳ (U+A732..A733) — AA ligatures
 * Mapped for visual variety.
 */
const LATIN_EXD_MAP: Record<string, string> = {
  a: "ᴀ", A: "ᴀ",
  b: "ʙ", B: "ʙ",
  c: "ᴄ", C: "ᴄ",
  d: "ᴅ", D: "ᴅ",
  e: "ᴇ", E: "ᴇ",
  f: "ꜰ", F: "ꜰ",
  g: "ɢ", G: "ɢ",
  h: "ʜ", H: "ʜ",
  i: "ɪ", I: "ɪ",
  j: "ᴊ", J: "ᴊ",
  k: "ᴋ", K: "ᴋ",
  l: "ʟ", L: "ʟ",
  m: "ᴍ", M: "ᴍ",
  n: "ɴ", N: "ɴ",
  o: "ᴏ", O: "ᴏ",
  p: "ᴘ", P: "ᴘ",
  r: "ʀ", R: "ʀ",
  s: "ꜱ", S: "ꜱ",
  t: "ᴛ", T: "ᴛ",
  u: "ᴜ", U: "ᴜ",
  v: "ᴠ", V: "ᴠ",
  w: "ᴡ", W: "ᴡ",
  y: "ʏ", Y: "ʏ",
  z: "ᴢ", Z: "ᴢ",
};
const latinExD = (s: string) =>
  Array.from(s).map((c) => LATIN_EXD_MAP[c] ?? c).join("");

// ---------------------------------------------------------------------------
// Group O: Roman Numerals as letters (U+2160..U+2180)
// ---------------------------------------------------------------------------

/**
 * Roman numerals that overlap with Latin letter forms. Most letters map
 * to nothing; only the seven Roman numerals (I, V, X, L, C, D, M) get
 * numeric substitutes, with the rest falling back to the original char.
 * Visually striking for short uppercase phrases.
 */
const ROMAN_MAP: Record<string, string> = {
  I: "Ⅰ",
  V: "Ⅴ",
  X: "Ⅹ",
  L: "Ⅼ",
  C: "Ⅽ",
  D: "Ⅾ",
  M: "Ⅿ",
  i: "ⅰ",
  v: "ⅴ",
  x: "ⅹ",
  l: "ⅼ",
  c: "ⅽ",
  d: "ⅾ",
  m: "ⅿ",
};
const roman = (s: string) =>
  Array.from(s).map((c) => ROMAN_MAP[c] ?? c).join("");

// ---------------------------------------------------------------------------
// Group P: Special Letterlike Symbols (U+2100..U+214F)
// ---------------------------------------------------------------------------

/**
 * The Unicode Letterlike Symbols block holds partial alphabets used
 * predominantly in math (ℝ = real, ℕ = natural, ℚ = rational, etc.).
 * A few lowercase script chars (ℓ ℯ) round it out. Limited coverage —
 * most letters fall through to the original.
 */
const SPECIAL_MAP: Record<string, string> = {
  C: "ℂ", N: "ℕ", P: "ℙ", Q: "ℚ", R: "ℝ", Z: "ℤ", H: "ℍ",
  B: "ℬ", E: "ℰ", F: "ℱ", M: "ℳ", L: "ℒ", I: "ℐ",
  l: "ℓ", e: "ℯ", o: "ℴ", m: "ℳ",
};
const special = (s: string) =>
  Array.from(s).map((c) => SPECIAL_MAP[c] ?? c).join("");

// ---------------------------------------------------------------------------
// Group Q: Leet / number-speak
// ---------------------------------------------------------------------------

/**
 * 1337-style letter-to-number substitutions. Only maps letters that
 * have a visually unambiguous numeric equivalent.
 */
const LEET_MAP: Record<string, string> = {
  a: "4", A: "4",
  b: "8", B: "8",
  e: "3", E: "3",
  g: "9", G: "9",
  i: "1", I: "1",
  l: "1", L: "1",
  o: "0", O: "0",
  s: "5", S: "5",
  t: "7", T: "7",
  z: "2", Z: "2",
};
const leet = (s: string) =>
  Array.from(s).map((c) => LEET_MAP[c] ?? c).join("");

// ---------------------------------------------------------------------------
// Group K: More combining-mark decorations (15 total new)
// ---------------------------------------------------------------------------

const acute = (s: string) => decorate(s, "\u0301");           // COMBINING ACUTE ACCENT
const grave = (s: string) => decorate(s, "\u0300");           // COMBINING GRAVE ACCENT
const circumflex = (s: string) => decorate(s, "\u0302");       // COMBINING CIRCUMFLEX ACCENT
const diaeresis = (s: string) => decorate(s, "\u0308");       // COMBINING DIAERESIS (umlaut)
const caron = (s: string) => decorate(s, "\u030C");           // COMBINING CARON (háček)
const cedilla = (s: string) => decorate(s, "\u0327");         // COMBINING CEDILLA
const doubleAcute = (s: string) => decorate(s, "\u030B");     // COMBINING DOUBLE ACUTE ACCENT
const hookAbove = (s: string) => decorate(s, "\u0309");       // COMBINING HOOK ABOVE
const horn = (s: string) => decorate(s, "\u031B");            // COMBINING HORN
const dotBelow = (s: string) => decorate(s, "\u0323");         // COMBINING DOT BELOW
const tildeBelow = (s: string) => decorate(s, "\u0330");      // COMBINING TILDE BELOW
const verticalLineAbove = (s: string) => decorate(s, "\u030D"); // COMBINING VERTICAL LINE ABOVE
const macronBelow = (s: string) => decorate(s, "\u0331");     // COMBINING MACRON BELOW
const circumflexBelow = (s: string) => decorate(s, "\u032D"); // COMBINING CIRCUMFLEX ACCENT BELOW
const breveBelow = (s: string) => decorate(s, "\u032E");      // COMBINING BREVE BELOW

// ---------------------------------------------------------------------------
// Group L: Decorative wraps (15 new)
// ---------------------------------------------------------------------------

const bulletWrap = (s: string) => wrap(s, "•", "•");
const slashWrap = (s: string) => wrap(s, "/", "/");
const pipeWrap = (s: string) => wrap(s, "|", "|");
const tildeWrap = (s: string) => wrap(s, "~", "~");
const dotWrap = (s: string) => wrap(s, ".", ".");
const cornerBracketsWrap = (s: string) => wrap(s, "⌜", "⌝");
const squareBracketsWrap = (s: string) => wrap(s, "[", "]");
const curlyBracketsWrap = (s: string) => wrap(s, "{", "}");
const angleBracketsWrap = (s: string) => wrap(s, "⟨", "⟩");
const hashtagWrap = (s: string) => wrap(s, "#", "#");
const atSignWrap = (s: string) => wrap(s, "@", "@");
const ampersandWrap = (s: string) => wrap(s, "&", "&");
const singleQuoteWrap = (s: string) => wrap(s, "'", "'");
const doubleQuoteWrap = (s: string) => wrap(s, '"', '"');
const squareQuoteWrap = (s: string) => wrap(s, "「", "」");

// ---------------------------------------------------------------------------
// Group M: Special (10 new) — spacing, arrows, symbol wraps
// ---------------------------------------------------------------------------

const arrowWrap = (s: string) => wrap(s, "←", "→");
const doubleArrowWrap = (s: string) => wrap(s, "⇒", "⇐");
const caretWrap = (s: string) => wrap(s, "^", "^");
const plusWrap = (s: string) => wrap(s, "+", "+");
const minusWrap = (s: string) => wrap(s, "−", "−");
const equalsWrap = (s: string) => wrap(s, "=", "=");
const percentWrap = (s: string) => wrap(s, "%", "%");
const backtickWrap = (s: string) => wrap(s, "`", "`");

/**
 * Vaporwave / spaced — adds a full-width space (U+2003) between every
 * letter for that 'a e s t h e t i c' look.
 */
const stretched = (s: string) =>
  Array.from(s)
    .map((c) => (c === " " ? c : c + "\u2003"))
    .join("")
    .replace(/\u2003+$/, "");

/**
 * Compressed — strips all spaces and uses a hair space (U+200A) for
 * very tight letter-spacing. Useful when the styled text needs to fit
 * in a short platform field (e.g. Twitter bio 160 chars).
 */
const compressed = (s: string) =>
  Array.from(s)
    .filter((c) => c !== " ")
    .map((c) => c + "\u200A")
    .join("")
    .replace(/\u200A+$/, "");

// ---------------------------------------------------------------------------
// Group N: 花字 (Flower / ornamental emoji wraps) — 20 new styles
// ---------------------------------------------------------------------------
// Each entry wraps every non-space character between two emoji. Used heavily
// in Chinese / Japanese / Korean social-media names and bios as decorative
// "花字" (huā zì) — flower text. Pairs cleanly with the existing heart /
// star / diamond wraps; this batch extends the floral / ornament vocabulary.

const cherryBlossom = (s: string) => wrap(s, "🌸", "🌸"); // U+1F338
const rose = (s: string) => wrap(s, "🌹", "🌹");           // U+1F339
const sunflower = (s: string) => wrap(s, "🌻", "🌻");      // U+1F33B
const tulip = (s: string) => wrap(s, "🌷", "🌷");         // U+1F337
const hibiscus = (s: string) => wrap(s, "🌺", "🌺");       // U+1F33A
const bouquet = (s: string) => wrap(s, "💐", "💐");       // U+1F490
const whiteFlower = (s: string) => wrap(s, "💮", "💮");   // U+1F4AE (Japanese stamp)
const wiltedRose = (s: string) => wrap(s, "🥀", "🥀");    // U+1F940
const lotus = (s: string) => wrap(s, "🪷", "🪷");         // U+1FAB7
const crown = (s: string) => wrap(s, "👑", "👑");         // U+1F451
const butterfly = (s: string) => wrap(s, "🦋", "🦋");      // U+1F98B
const sparkles = (s: string) => wrap(s, "✨", "✨");      // U+2728
const ribbonBow = (s: string) => wrap(s, "🎀", "🎀");     // U+1F380
const glowingStar = (s: string) => wrap(s, "🌟", "🌟");   // U+1F31F
const heartRibbon = (s: string) => wrap(s, "💝", "💝");   // U+1F49D
const pinkHeart = (s: string) => wrap(s, "💗", "💗");     // U+1F497
const sparklingHeart = (s: string) => wrap(s, "💖", "💖"); // U+1F496
const crescentMoon = (s: string) => wrap(s, "🌙", "🌙");  // U+1F319
const sun = (s: string) => wrap(s, "☀️", "☀️");           // U+2600 + U+FE0F
const rainbow = (s: string) => wrap(s, "🌈", "🌈");       // U+1F308

// ---------------------------------------------------------------------------
// Group O: Composition styles — combine two existing styles into a new one.
// These produce genuinely distinct visual results: e.g. cursive-strikethrough
// is a flowing script with a line through each letter, visually different
// from either cursive or strikethrough alone.
// ---------------------------------------------------------------------------

/**
 * Compose: run `style` over the input first, then apply `decorator` to
 * each character. The decorator is a combining character string.
 */
function compose(style: (s: string) => string, decorator: string): (s: string) => string {
  return (s: string) => Array.from(style(s))
    .map((c) => {
      const code = c.codePointAt(0) ?? 0;
      // Skip whitespace, control chars, surrogate halves — combining marks
      // attached to these render as broken tofu or vanish entirely.
      if (
        code <= 0x20 ||
        (code >= 0xd800 && code <= 0xdfff) ||
        c === "\n" ||
        c === "\r"
      ) {
        return c;
      }
      return c + decorator;
    })
    .join("");
}

const cursiveStrikethrough = compose(cursive, "\u0336");
const boldStrikethrough = compose(boldSans, "\u0336");
const frakturStrikethrough = compose(fraktur, "\u0336");
const cursiveUnderline = compose(cursive, "\u0332");
const boldUnderline = compose(boldSans, "\u0332");
const italicUnderline = compose(italic, "\u0332");
const cursiveDoubleUnderline = compose(cursive, "\u0333");
const boldDoubleUnderline = compose(boldSans, "\u0333");
const italicDoubleUnderline = compose(italic, "\u0333");
const frakturUnderline = compose(fraktur, "\u0332");

// ---- v6 additions: 20 more letterform-style compositions (sans / mono / double-struck / serif / cursive bases) ----
// Each base letter is a real Unicode block; the decoration (strikethrough /
// underline / double-underline) is the same overlay used by existing
// compositions but applied to a fresh base — visually distinct from any
// existing style because the underlying glyphs differ.

// Sans-Serif family (3)
const sansSerifStrikethrough = compose(sansSerif, "\u0336");
const sansSerifUnderline = compose(sansSerif, "\u0332");
const sansSerifDoubleUnderline = compose(sansSerif, "\u0333");

// Sans Italic family (3)
const sansItalicStrikethrough = compose(sansItalic, "\u0336");
const sansItalicUnderline = compose(sansItalic, "\u0332");
const sansItalicDoubleUnderline = compose(sansItalic, "\u0333");

// Sans Bold Italic family (3)
const sansBoldItalicStrikethrough = compose(sansBoldItalic, "\u0336");
const sansBoldItalicUnderline = compose(sansBoldItalic, "\u0332");
const sansBoldItalicDoubleUnderline = compose(sansBoldItalic, "\u0333");

// Monospace family (3)
const monospaceStrikethrough = compose(monospace, "\u0336");
const monospaceUnderline = compose(monospace, "\u0332");
const monospaceDoubleUnderline = compose(monospace, "\u0333");

// Double-Struck family (3)
const doubleStruckStrikethrough = compose(doubleStruck, "\u0336");
const doubleStruckUnderline = compose(doubleStruck, "\u0332");
const doubleStruckDoubleUnderline = compose(doubleStruck, "\u0333");

// Bold Serif family (3)
const boldSerifStrikethrough = compose(boldSerif, "\u0336");
const boldSerifUnderline = compose(boldSerif, "\u0332");
const boldSerifDoubleUnderline = compose(boldSerif, "\u0333");

// Bold Cursive family (2)
const boldCursiveStrikethrough = compose(boldCursive, "\u0336");
const boldCursiveUnderline = compose(boldCursive, "\u0332");

// ---------------------------------------------------------------------------
// Group P: New Unicode letterform blocks — real alphabets from outside the
// Latin / Greek / Cyrillic family. Each block ships a-z (with gaps where the
// script lacks a visual Latin counterpart) plus a few strikethrough /
// underline / dot-above composition variants.
// ---------------------------------------------------------------------------

/**
 * Gothic Unicode block (U+10330..U+1034F). The Gothic alphabet proper — a
 * distinct script from Fraktur (which is the German blackletter *style*).
 * Looks like actual 4th-century runic-influenced Gothic letterforms.
 */
const GOTHIC_MAP: Record<string, string> = {
  a: "𐌰", b: "𐌱", d: "𐌳", e: "𐌴", f: "𐍅", g: "𐌲",
  h: "𐌷", i: "𐌹", j: "𐌾", k: "𐌺", l: "𐌻", m: "𐌼",
  n: "𐌽", o: "𐍈", p: "𐍀", q: "𐌵", r: "𐍁", s: "𐍂",
  t: "𐍃", u: "𐌿", w: "𐍄", x: "𐍆", z: "𐌶",
};
const gothic = (s: string) =>
  Array.from(s)
    .map((c) => GOTHIC_MAP[c.toLowerCase()] ?? c)
    .join("");
const gothicStrikethrough = compose(gothic, "̶");
const gothicUnderline = compose(gothic, "̲");
const gothicDoubleUnderline = compose(gothic, "̳");
const gothicDotAbove = compose(gothic, "̇");

/**
 * Runic Unicode block (U+16A0..U+16F0). Viking / Old Norse rune alphabet.
 * Maps by sound equivalence (ᚠ → f, ᚱ → r, etc.).
 */
const RUNIC_MAP: Record<string, string> = {
  a: "ᚨ", b: "ᛒ", d: "ᛞ", e: "ᛖ", f: "ᚠ", g: "ᚷ",
  h: "ᚺ", i: "ᛁ", j: "ᛃ", k: "ᚲ", l: "ᛚ", m: "ᛗ",
  n: "ᚾ", o: "ᛟ", p: "ᛈ", r: "ᚱ", s: "ᛊ", t: "ᛏ",
  u: "ᚢ", v: "ᚡ", w: "ᚥ", y: "ᚣ", z: "ᛉ",
};
const runic = (s: string) =>
  Array.from(s)
    .map((c) => RUNIC_MAP[c.toLowerCase()] ?? c)
    .join("");
const runicStrikethrough = compose(runic, "̶");
const runicUnderline = compose(runic, "̲");
const runicDoubleUnderline = compose(runic, "̳");
const runicDotAbove = compose(runic, "̇");

/**
 * Cherokee syllabary (U+13A0..U+13FF). Latin letters are mapped to
 * visually-interesting Cherokee syllables — output reads as exotic script.
 */
const CHEROKEE_MAP: Record<string, string> = {
  a: "Ꭰ", b: "Ꮖ", c: "Ꮯ", d: "Ꮧ", e: "Ꮔ", f: "Ꮈ",
  g: "Ꮆ", h: "Ꭿ", i: "Ꭲ", j: "Ꮸ", k: "Ꭷ", l: "Ꮈ",
  m: "Ꮇ", n: "Ꮑ", o: "Ꭳ", p: "Ꮉ", r: "Ꮢ", s: "Ꮝ",
  t: "Ꮤ", u: "Ꮜ", v: "Ꮼ", w: "Ꮹ", x: "Ꮂ", y: "Ꭹ",
  z: "Ꮠ",
};
const cherokee = (s: string) =>
  Array.from(s)
    .map((c) => CHEROKEE_MAP[c.toLowerCase()] ?? c)
    .join("");
const cherokeeStrikethrough = compose(cherokee, "̶");
const cherokeeUnderline = compose(cherokee, "̲");

/**
 * Vai syllabary (U+A500..U+A63F). West African syllabary historically used
 * for the Vai language. Output reads as geometric Vai script.
 */
const VAI_MAP: Record<string, string> = {
  a: "ꔀ", b: "ꖌ", c: "ꖏ", d: "ꖕ", e: "ꖆ", f: "ꖈ",
  g: "ꔱ", h: "ꔃ", i: "ꔂ", j: "ꕋ", k: "ꕷ", l: "ꖂ",
  m: "ꖆ", n: "ꖇ", o: "ꖊ", p: "ꖐ", r: "ꖑ", s: "ꖤ",
  t: "ꖍ", u: "ꖎ", v: "ꖏ", w: "ꖀ", x: "ꖁ", y: "ꖂ",
  z: "ꖃ",
};
const vai = (s: string) =>
  Array.from(s)
    .map((c) => VAI_MAP[c.toLowerCase()] ?? c)
    .join("");
const vaiStrikethrough = compose(vai, "̶");
const vaiUnderline = compose(vai, "̲");

/**
 * Tifinagh (U+2D30..U+2D7F). Berber / Amazigh alphabet — geometric
 * letterforms (circles, lines, dots) widely used in North Africa.
 */
const TIFINAGH_MAP: Record<string, string> = {
  a: "ⴰ", b: "ⴱ", d: "ⴷ", e: "ⴻ", f: "ⴼ", g: "ⴳ",
  h: "ⵀ", i: "ⵉ", j: "ⵊ", k: "ⴽ", l: "ⵍ", m: "ⵎ",
  n: "ⵏ", o: "ⵓ", p: "ⵒ", r: "ⵔ", s: "ⵙ", t: "ⵜ",
  u: "ⵓ", v: "ⴼ", w: "ⵡ", x: "ⵅ", y: "ⵖ", z: "ⵣ",
};
const tifinagh = (s: string) =>
  Array.from(s)
    .map((c) => TIFINAGH_MAP[c.toLowerCase()] ?? c)
    .join("");
const tifinaghStrikethrough = compose(tifinagh, "̶");

// ---------------------------------------------------------------------------
// Group Q: Zalgo / Freaky — stacks many combining diacritics on each
// character for the classic "corrupted text" look popular on imageboards,
// meme culture, and creepy-horror typography.
// ---------------------------------------------------------------------------

/**
 * Zalgo combining marks drawn from the Combining Diacritical Marks block
 * (U+0300..U+036F). We mix above, through, and below marks for the
 * characteristic "bleeding" effect that grows outward from each character.
 */
const ZALGO_MARKS: string[] = [
  "\u0300", "\u0301", "\u0302", "\u0303", "\u0304", "\u0305", "\u0306", "\u0307",
  "\u0308", "\u0309", "\u030A", "\u030B", "\u030C", "\u030D", "\u030E", "\u030F",
  "\u0310", "\u0311", "\u0312", "\u0313", "\u0314", "\u0315", "\u0316", "\u0317",
  "\u0318", "\u0319", "\u031A", "\u031B", "\u031C", "\u031D", "\u031E", "\u031F",
  "\u0320", "\u0321", "\u0322", "\u0323", "\u0324", "\u0325", "\u0326", "\u0327",
  "\u0328", "\u0329", "\u032A", "\u032B", "\u032C", "\u032D", "\u032E", "\u032F",
  "\u0330", "\u0331", "\u0332", "\u0333", "\u0334", "\u0335", "\u0336", "\u0337",
  "\u0338", "\u0339", "\u033A", "\u033B", "\u033C", "\u033D", "\u033E", "\u033F",
  "\u0340", "\u0341", "\u0342", "\u0343", "\u0344", "\u0345", "\u0346", "\u0347",
  "\u0348", "\u0349", "\u034A", "\u034B", "\u034C", "\u034D", "\u034E", "\u034F",
  "\u0350", "\u0351", "\u0352", "\u0353", "\u0354", "\u0355", "\u0356", "\u0357",
  "\u0358", "\u0359", "\u035A", "\u035B", "\u035C", "\u035D", "\u035E", "\u035F",
  "\u0360", "\u0361", "\u0362", "\u0363", "\u0364", "\u0365", "\u0366", "\u0367",
  "\u0368", "\u0369", "\u036A", "\u036B", "\u036C", "\u036D", "\u036E", "\u036F",
];

/**
 * Deterministic Zalgo mapper. Stacks `marksPerChar` combining marks per
 * character, picking each mark from a hash of the character's code point
 * — this keeps output stable across SSR and CSR renders (otherwise
 * `Math.random()` would produce different Zalgo on server vs client and
 * trigger React hydration mismatches).
 */
function zalgoMap(input: string, marksPerChar: number): string {
  return Array.from(input)
    .map((c) => {
      const code = c.codePointAt(0) ?? 0;
      if (
        code <= 0x20 ||
        (code >= 0xd800 && code <= 0xdfff) ||
        c === "\n" ||
        c === "\r"
      ) {
        return c;
      }
      let out = c;
      // Knuth's multiplicative hash — gives a stable pseudo-random per char.
      let h = code * 2654435761;
      for (let i = 0; i < marksPerChar; i++) {
        h = (h * 2654435761 + i) >>> 0;
        out += ZALGO_MARKS[h % ZALGO_MARKS.length];
      }
      return out;
    })
    .join("");
}

const freaky = (s: string) => zalgoMap(s, 8);

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

/**
 * Master font registry. The home page exposes every style; the
 * `/fonts/[slug]` landing page renders this single entry as the featured
 * preview.
 *
 * Order is intentional — the first 8 styles are the highest-traffic picks
 * (cursive, bold, gothic, etc.) and render in the default "All" view
 * without scrolling on mobile. Anything after position 8 is grouped under
 * "More" in the category filter.
 */
export const FONT_STYLES: readonly FontStyle[] = [
  {
    slug: "bold",
    name: "Bold",
    description: "Heavy sans-serif letters that read loud and clear.",
    category: "classic",
    map: boldSans,
    preview: boldSans("Hello"),
  },
  {
    slug: "italic",
    name: "Italic",
    description: "Slanted serif letters with a refined, editorial feel.",
    category: "classic",
    map: italic,
    preview: italic("Hello"),
  },
  {
    slug: "cursive",
    name: "Cursive",
    description: "Flowing script letters that look hand-written.",
    category: "decorative",
    map: cursive,
    preview: cursive("Hello"),
  },
  {
    slug: "bold-cursive",
    name: "Bold Cursive",
    description: "Heavier script letters with extra emphasis.",
    category: "decorative",
    map: boldCursive,
    preview: boldCursive("Hello"),
  },
  {
    slug: "fraktur",
    name: "Fraktur",
    description: "Old-style Gothic blackletter used in classic documents.",
    category: "decorative",
    map: fraktur,
    preview: fraktur("Hello"),
  },
  {
    slug: "bold-fraktur",
    name: "Bold Fraktur",
    description: "Heavier Gothic blackletter for poster-style text.",
    category: "decorative",
    map: boldFraktur,
    preview: boldFraktur("Hello"),
  },
  {
    slug: "double-struck",
    name: "Double-Struck",
    description: "Outlined letters inspired by chalkboard typography.",
    category: "decorative",
    map: doubleStruck,
    preview: doubleStruck("Hello"),
  },
  {
    slug: "monospace",
    name: "Monospace",
    description: "Fixed-width letters with a terminal / coding feel.",
    category: "classic",
    map: monospace,
    preview: monospace("Hello"),
  },
  {
    slug: "sans-serif",
    name: "Sans Serif",
    description: "Clean, geometric sans-serif letters for modern posts.",
    category: "classic",
    map: sansSerif,
    preview: sansSerif("Hello"),
  },
  {
    slug: "bold-italic",
    name: "Bold Italic",
    description: "Heavy slanted letters with extra visual weight.",
    category: "classic",
    map: boldItalic,
    preview: boldItalic("Hello"),
  },
  {
    slug: "small-caps",
    name: "Small Caps",
    description: "Tiny uppercase letters that look elegantly understated.",
    category: "accent",
    map: smallCaps,
    preview: smallCaps("Hello"),
  },
  {
    slug: "strikethrough",
    name: "Strikethrough",
    description: "Letters crossed out for edits, retweets, or humor.",
    category: "accent",
    map: strikethrough,
    preview: strikethrough("Hello"),
  },
  {
    slug: "underline",
    name: "Underline",
    description: "Letters underlined for emphasis and clarity.",
    category: "accent",
    map: underline,
    preview: underline("Hello"),
  },
  {
    slug: "double-underline",
    name: "Double Underline",
    description: "Letters with a strong double underline beneath.",
    category: "accent",
    map: doubleUnderline,
    preview: doubleUnderline("Hello"),
  },
  {
    slug: "overline",
    name: "Overline",
    description: "Letters with a line drawn across the top.",
    category: "accent",
    map: overline,
    preview: overline("Hello"),
  },
  {
    slug: "subscript",
    name: "Subscript",
    description: "Tiny letters set below the baseline like H₂O.",
    category: "accent",
    map: subscript,
    preview: subscript("Hello"),
  },
  {
    slug: "superscript",
    name: "Superscript",
    description: "Tiny raised letters like footnote markers or x².",
    category: "accent",
    map: superscript,
    preview: superscript("Hello"),
  },
  {
    slug: "bubble",
    name: "Bubble",
    description: "Letters wrapped in circles, popular for fun bios.",
    category: "game",
    map: bubble,
    preview: bubble("Hello"),
  },
  {
    slug: "squared",
    name: "Squared",
    description: "Negative-circled letters with a Minecraft-style vibe.",
    category: "game",
    map: squared,
    preview: squared("Hello"),
  },
  {
    slug: "upside-down",
    name: "Upside Down",
    description: "Flipped letters that read backwards and inverted.",
    category: "game",
    map: upsideDown,
    preview: upsideDown("Hello"),
  },

  // ---- New additions: real Unicode blocks ----
  {
    slug: "sans-italic",
    name: "Sans Italic",
    description: "Clean italic sans-serif letters with a modern look.",
    category: "classic",
    map: sansItalic,
    preview: sansItalic("Hello"),
  },
  {
    slug: "sans-bold-italic",
    name: "Sans Bold Italic",
    description: "Heavy italic sans-serif letters for emphasized text.",
    category: "classic",
    map: sansBoldItalic,
    preview: sansBoldItalic("Hello"),
  },
  {
    slug: "fullwidth",
    name: "Fullwidth",
    description: "Wide Latin letters that mimic East-Asian character width.",
    category: "game",
    map: fullwidth,
    preview: fullwidth("Hello"),
  },
  {
    slug: "parenthesized",
    name: "Parenthesized",
    description: "Each letter wrapped in its own parentheses.",
    category: "accent",
    map: parenthesized,
    preview: parenthesized("Hello"),
  },
  {
    slug: "circled",
    name: "Circled",
    description: "Letters wrapped in circles, similar to bubble style.",
    category: "game",
    map: circled,
    preview: circled("Hello"),
  },

  // ---- Decorative wraps ----
  {
    slug: "heart",
    name: "Heart",
    description: "Each letter wrapped in hearts for a romantic feel.",
    category: "accent",
    map: heart,
    preview: heart("Hello"),
  },
  {
    slug: "star",
    name: "Star",
    description: "Each letter wrapped in stars for a celebratory vibe.",
    category: "accent",
    map: star,
    preview: star("Hello"),
  },
  {
    slug: "diamond",
    name: "Diamond",
    description: "Each letter wrapped in diamond shapes for an elegant look.",
    category: "accent",
    map: diamond,
    preview: diamond("Hello"),
  },
  {
    slug: "slash-frame",
    name: "Slash Frame",
    description: "Each letter wrapped in slashes for a code-like aesthetic.",
    category: "game",
    map: slashFrame,
    preview: slashFrame("Hello"),
  },

  // ---- Homoglyphs ----
  {
    slug: "cyrillic",
    name: "Cyrillic",
    description: "Latin letters swapped for visually similar Cyrillic ones.",
    category: "decorative",
    map: cyrillic,
    preview: cyrillic("Hello"),
  },
  {
    slug: "currency",
    name: "Currency",
    description: "Letters swapped for visually similar currency symbols.",
    category: "accent",
    map: currency,
    preview: currency("Hello"),
  },

  // ---- Combining decorations ----
  {
    slug: "wave",
    name: "Wave",
    description: "Each letter topped with a tilde for a wavy accent.",
    category: "accent",
    map: wave,
    preview: wave("Hello"),
  },
  {
    slug: "dot-above",
    name: "Dot Above",
    description: "Each letter topped with a dot for a typographic accent.",
    category: "accent",
    map: dot,
    preview: dot("Hello"),
  },
  {
    slug: "breve",
    name: "Breve",
    description: "Each letter topped with a curved breve accent.",
    category: "accent",
    map: breve,
    preview: breve("Hello"),
  },
  {
    slug: "macron",
    name: "Macron",
    description: "Each letter topped with a straight macron accent.",
    category: "accent",
    map: macron,
    preview: macron("Hello"),
  },
  {
    slug: "ring",
    name: "Ring",
    description: "Each letter topped with a ring above for an umlaut feel.",
    category: "accent",
    map: ring,
    preview: ring("Hello"),
  },

  // ---- v3 additions: real Unicode blocks (5 styles) ----
  {
    slug: "bold-serif",
    name: "Bold Serif",
    description: "Heavy serif letters with classic terminal contrast.",
    category: "classic",
    map: boldSerif,
    preview: boldSerif("Hello"),
  },
  {
    slug: "greek",
    name: "Greek",
    description: "Latin letters swapped for visually identical Greek ones.",
    category: "decorative",
    map: greek,
    preview: greek("Hello"),
  },
  {
    slug: "greek-uppercase",
    name: "Greek Uppercase",
    description: "Lowercase letters swapped for uppercase Greek lookalikes.",
    category: "decorative",
    map: greekUpper,
    preview: greekUpper("Hello"),
  },
  {
    slug: "greek-lowercase",
    name: "Greek Lowercase",
    description: "Uppercase letters swapped for lowercase Greek lookalikes.",
    category: "decorative",
    map: greekLower,
    preview: greekLower("Hello"),
  },
  {
    slug: "leet",
    name: "Leet",
    description: "1337-style number substitutions (a→4, e→3, s→5, etc.).",
    category: "decorative",
    map: leet,
    preview: leet("Hello"),
  },

  // ---- v4 additions: 20 more decorative styles ----
  // Real Unicode blocks (11)
  {
    slug: "negative-squared",
    name: "Negative Squared",
    description: "Each letter inside a black square with white text.",
    category: "decorative",
    map: negativeSquared,
    preview: negativeSquared("Hello"),
  },
  {
    slug: "negative-circled",
    name: "Negative Circled",
    description: "Each letter inside a black circle with white text.",
    category: "decorative",
    map: negativeCircled,
    preview: negativeCircled("Hello"),
  },
  {
    slug: "armenian",
    name: "Armenian",
    description: "Latin letters swapped for visually identical Armenian ones.",
    category: "decorative",
    map: armenian,
    preview: armenian("Hello"),
  },
  {
    slug: "armenian-uppercase",
    name: "Armenian Uppercase",
    description: "All letters mapped to uppercase Armenian lookalikes.",
    category: "decorative",
    map: armenianUpper,
    preview: armenianUpper("Hello"),
  },
  {
    slug: "armenian-lowercase",
    name: "Armenian Lowercase",
    description: "All letters mapped to lowercase Armenian lookalikes.",
    category: "decorative",
    map: armenianLower,
    preview: armenianLower("Hello"),
  },
  {
    slug: "ipa",
    name: "IPA",
    description: "Latin letters swapped for phonetic-letter equivalents (æ, ɔ, ɐ, ə, ɪ).",
    category: "decorative",
    map: ipa,
    preview: ipa("Hello"),
  },
  {
    slug: "turned",
    name: "Turned",
    description: "Each letter flipped horizontally — mirror only, no order reversal.",
    category: "decorative",
    map: turned,
    preview: turned("Hello"),
  },
  {
    slug: "latin-exb",
    name: "Latin Ex-B",
    description: "Latin letters with diacritics from Latin Extended-B (ł, ę, đ, ħ, etc.).",
    category: "decorative",
    map: latinExB,
    preview: latinExB("Hello"),
  },
  {
    slug: "latin-exd",
    name: "Latin Ex-D",
    description: "Special small caps from Latin Extended-D (ꜰ, ꜱ, ɢ, ʟ, ɴ).",
    category: "decorative",
    map: latinExD,
    preview: latinExD("Hello"),
  },
  {
    slug: "roman",
    name: "Roman",
    description: "Latin I, V, X, L, C, D, M rendered as Roman numerals (Ⅰ, Ⅴ, Ⅹ, …).",
    category: "decorative",
    map: roman,
    preview: roman("Hello"),
  },
  {
    slug: "special-letters",
    name: "Special Letters",
    description: "Mathematical letterlike symbols (ℂ, ℍ, ℕ, ℙ, ℚ, ℝ, ℤ).",
    category: "decorative",
    map: special,
    preview: special("Hello"),
  },

  // Composition styles (9) — decoration layered on top of an existing style.
  {
    slug: "cursive-strikethrough",
    name: "Cursive Strikethrough",
    description: "Flowing script with a line struck through each letter.",
    category: "decorative",
    map: cursiveStrikethrough,
    preview: cursiveStrikethrough("Hello"),
  },
  {
    slug: "bold-strikethrough",
    name: "Bold Strikethrough",
    description: "Heavy bold letters with a line struck through each.",
    category: "decorative",
    map: boldStrikethrough,
    preview: boldStrikethrough("Hello"),
  },
  {
    slug: "fraktur-strikethrough",
    name: "Fraktur Strikethrough",
    description: "Gothic blackletter with a line struck through each letter.",
    category: "decorative",
    map: frakturStrikethrough,
    preview: frakturStrikethrough("Hello"),
  },
  {
    slug: "cursive-underline",
    name: "Cursive Underline",
    description: "Flowing script with each letter underlined.",
    category: "decorative",
    map: cursiveUnderline,
    preview: cursiveUnderline("Hello"),
  },
  {
    slug: "bold-underline",
    name: "Bold Underline",
    description: "Heavy bold letters with each letter underlined.",
    category: "decorative",
    map: boldUnderline,
    preview: boldUnderline("Hello"),
  },
  {
    slug: "italic-underline",
    name: "Italic Underline",
    description: "Slanted italic letters with each letter underlined.",
    category: "decorative",
    map: italicUnderline,
    preview: italicUnderline("Hello"),
  },
  {
    slug: "cursive-double-underline",
    name: "Cursive Double Underline",
    description: "Flowing script with each letter double-underlined.",
    category: "decorative",
    map: cursiveDoubleUnderline,
    preview: cursiveDoubleUnderline("Hello"),
  },
  {
    slug: "bold-double-underline",
    name: "Bold Double Underline",
    description: "Heavy bold letters with each letter double-underlined.",
    category: "decorative",
    map: boldDoubleUnderline,
    preview: boldDoubleUnderline("Hello"),
  },
  {
    slug: "fraktur-underline",
    name: "Fraktur Underline",
    description: "Gothic blackletter with each letter underlined.",
    category: "decorative",
    map: frakturUnderline,
    preview: frakturUnderline("Hello"),
  },

  // ---- v3 additions: combining-mark decorations (15 styles) ----
  {
    slug: "acute",
    name: "Acute",
    description: "Each letter topped with an acute accent (´).",
    category: "accent",
    map: acute,
    preview: acute("Hello"),
  },
  {
    slug: "grave",
    name: "Grave",
    description: "Each letter topped with a grave accent (`).",
    category: "accent",
    map: grave,
    preview: grave("Hello"),
  },
  {
    slug: "circumflex",
    name: "Circumflex",
    description: "Each letter topped with a circumflex accent (^).",
    category: "accent",
    map: circumflex,
    preview: circumflex("Hello"),
  },
  {
    slug: "diaeresis",
    name: "Diaeresis",
    description: "Each letter topped with a diaeresis or umlaut (¨).",
    category: "accent",
    map: diaeresis,
    preview: diaeresis("Hello"),
  },
  {
    slug: "caron",
    name: "Caron",
    description: "Each letter topped with a caron or háček (ˇ).",
    category: "accent",
    map: caron,
    preview: caron("Hello"),
  },
  {
    slug: "cedilla",
    name: "Cedilla",
    description: "Each letter given a cedilla hook beneath (¸).",
    category: "accent",
    map: cedilla,
    preview: cedilla("Hello"),
  },
  {
    slug: "double-acute",
    name: "Double Acute",
    description: "Each letter topped with a double acute accent (˝).",
    category: "accent",
    map: doubleAcute,
    preview: doubleAcute("Hello"),
  },
  {
    slug: "hook-above",
    name: "Hook Above",
    description: "Each letter topped with a small hook (̉).",
    category: "accent",
    map: hookAbove,
    preview: hookAbove("Hello"),
  },
  {
    slug: "horn",
    name: "Horn",
    description: "Each letter topped with a horn (̛), like Vietnamese diacritics.",
    category: "accent",
    map: horn,
    preview: horn("Hello"),
  },
  {
    slug: "dot-below",
    name: "Dot Below",
    description: "Each letter given a dot beneath the baseline (̣).",
    category: "accent",
    map: dotBelow,
    preview: dotBelow("Hello"),
  },
  {
    slug: "tilde-below",
    name: "Tilde Below",
    description: "Each letter given a tilde beneath the baseline (̰).",
    category: "accent",
    map: tildeBelow,
    preview: tildeBelow("Hello"),
  },
  {
    slug: "vertical-line-above",
    name: "Vertical Line Above",
    description: "Each letter topped with a vertical line (̍), like A̐.",
    category: "accent",
    map: verticalLineAbove,
    preview: verticalLineAbove("Hello"),
  },
  {
    slug: "macron-below",
    name: "Macron Below",
    description: "Each letter given a macron beneath the baseline (̱).",
    category: "accent",
    map: macronBelow,
    preview: macronBelow("Hello"),
  },
  {
    slug: "circumflex-below",
    name: "Circumflex Below",
    description: "Each letter given a circumflex beneath the baseline (̭).",
    category: "accent",
    map: circumflexBelow,
    preview: circumflexBelow("Hello"),
  },
  {
    slug: "breve-below",
    name: "Breve Below",
    description: "Each letter given a curved breve beneath the baseline (̮).",
    category: "accent",
    map: breveBelow,
    preview: breveBelow("Hello"),
  },

  // ---- v3 additions: decorative wraps (15 styles) ----
  {
    slug: "bullet-wrap",
    name: "Bullet Wrap",
    description: "Each letter wrapped in bullets for an emphasized feel.",
    category: "game",
    map: bulletWrap,
    preview: bulletWrap("Hello"),
  },
  {
    slug: "slash-wrap",
    name: "Slash Wrap",
    description: "Each letter wrapped in slashes for a code-like vibe.",
    category: "game",
    map: slashWrap,
    preview: slashWrap("Hello"),
  },
  {
    slug: "pipe-wrap",
    name: "Pipe Wrap",
    description: "Each letter wrapped in pipes like a table column.",
    category: "game",
    map: pipeWrap,
    preview: pipeWrap("Hello"),
  },
  {
    slug: "tilde-wrap",
    name: "Tilde Wrap",
    description: "Each letter wrapped in tildes for a soft accent.",
    category: "game",
    map: tildeWrap,
    preview: tildeWrap("Hello"),
  },
  {
    slug: "dot-wrap",
    name: "Dot Wrap",
    description: "Each letter wrapped in dots, period-separated style.",
    category: "game",
    map: dotWrap,
    preview: dotWrap("Hello"),
  },
  {
    slug: "corner-brackets",
    name: "Corner Brackets",
    description: "Each letter wrapped in corner brackets ⌜ ⌝.",
    category: "game",
    map: cornerBracketsWrap,
    preview: cornerBracketsWrap("Hello"),
  },
  {
    slug: "square-brackets",
    name: "Square Brackets",
    description: "Each letter wrapped in square brackets [ ].",
    category: "game",
    map: squareBracketsWrap,
    preview: squareBracketsWrap("Hello"),
  },
  {
    slug: "curly-brackets",
    name: "Curly Brackets",
    description: "Each letter wrapped in curly brackets { }.",
    category: "game",
    map: curlyBracketsWrap,
    preview: curlyBracketsWrap("Hello"),
  },
  {
    slug: "angle-brackets",
    name: "Angle Brackets",
    description: "Each letter wrapped in mathematical angle brackets ⟨ ⟩.",
    category: "game",
    map: angleBracketsWrap,
    preview: angleBracketsWrap("Hello"),
  },
  {
    slug: "hashtag-wrap",
    name: "Hashtag Wrap",
    description: "Each letter wrapped in hashtags like a social tag.",
    category: "game",
    map: hashtagWrap,
    preview: hashtagWrap("Hello"),
  },
  {
    slug: "at-sign-wrap",
    name: "At Sign Wrap",
    description: "Each letter wrapped in at-signs like a mention.",
    category: "game",
    map: atSignWrap,
    preview: atSignWrap("Hello"),
  },
  {
    slug: "ampersand-wrap",
    name: "Ampersand Wrap",
    description: "Each letter wrapped in ampersands for an artistic look.",
    category: "game",
    map: ampersandWrap,
    preview: ampersandWrap("Hello"),
  },
  {
    slug: "single-quote-wrap",
    name: "Single Quote Wrap",
    description: "Each letter wrapped in straight single quotes.",
    category: "game",
    map: singleQuoteWrap,
    preview: singleQuoteWrap("Hello"),
  },
  {
    slug: "double-quote-wrap",
    name: "Double Quote Wrap",
    description: "Each letter wrapped in straight double quotes.",
    category: "game",
    map: doubleQuoteWrap,
    preview: doubleQuoteWrap("Hello"),
  },
  {
    slug: "square-quote-wrap",
    name: "Square Quote Wrap",
    description: "Each letter wrapped in CJK corner quotes 「 」.",
    category: "game",
    map: squareQuoteWrap,
    preview: squareQuoteWrap("Hello"),
  },

  // ---- v3 additions: special / spacing / arrow (10 styles) ----
  {
    slug: "arrow-wrap",
    name: "Arrow Wrap",
    description: "Each letter wrapped in left-right arrows (← →).",
    category: "game",
    map: arrowWrap,
    preview: arrowWrap("Hello"),
  },
  {
    slug: "double-arrow-wrap",
    name: "Double Arrow Wrap",
    description: "Each letter wrapped in double arrows (⇒ ⇐).",
    category: "game",
    map: doubleArrowWrap,
    preview: doubleArrowWrap("Hello"),
  },
  {
    slug: "caret-wrap",
    name: "Caret Wrap",
    description: "Each letter wrapped in carets for a code-comments look.",
    category: "game",
    map: caretWrap,
    preview: caretWrap("Hello"),
  },
  {
    slug: "plus-wrap",
    name: "Plus Wrap",
    description: "Each letter wrapped in plus signs for a math feel.",
    category: "game",
    map: plusWrap,
    preview: plusWrap("Hello"),
  },
  {
    slug: "minus-wrap",
    name: "Minus Wrap",
    description: "Each letter wrapped in minus signs (− −).",
    category: "game",
    map: minusWrap,
    preview: minusWrap("Hello"),
  },
  {
    slug: "equals-wrap",
    name: "Equals Wrap",
    description: "Each letter wrapped in equals signs (= =).",
    category: "game",
    map: equalsWrap,
    preview: equalsWrap("Hello"),
  },
  {
    slug: "percent-wrap",
    name: "Percent Wrap",
    description: "Each letter wrapped in percent signs (%).",
    category: "game",
    map: percentWrap,
    preview: percentWrap("Hello"),
  },
  {
    slug: "backtick-wrap",
    name: "Backtick Wrap",
    description: "Each letter wrapped in backticks like inline code.",
    category: "game",
    map: backtickWrap,
    preview: backtickWrap("Hello"),
  },
  {
    slug: "stretched",
    name: "Stretched",
    description: "Letters spaced apart with em spaces for a vaporwave look.",
    category: "accent",
    map: stretched,
    preview: stretched("Hello"),
  },

  // ---- v5 additions: 花字 (flower / ornamental emoji wraps, 20 styles) ----
  // The classic Chinese / Japanese / Korean social-media "花字" look: each
  // letter framed between two decorative emoji. Pairs visually with the
  // existing heart / star / diamond wraps, but with floral + celestial
  // vocabulary that's most commonly seen in QQ, WeChat, and Instagram bios.
  {
    slug: "cherry-blossom",
    name: "Cherry Blossom",
    description: "Each letter framed in pink cherry blossoms (🌸) for a soft floral look.",
    category: "accent",
    map: cherryBlossom,
    preview: cherryBlossom("Hello"),
  },
  {
    slug: "rose",
    name: "Rose",
    description: "Each letter wrapped in red roses (🌹) for a romantic vibe.",
    category: "accent",
    map: rose,
    preview: rose("Hello"),
  },
  {
    slug: "sunflower",
    name: "Sunflower",
    description: "Each letter framed in bright sunflowers (🌻) for a sunny feel.",
    category: "accent",
    map: sunflower,
    preview: sunflower("Hello"),
  },
  {
    slug: "tulip",
    name: "Tulip",
    description: "Each letter wrapped in pink tulips (🌷) for an elegant floral look.",
    category: "accent",
    map: tulip,
    preview: tulip("Hello"),
  },
  {
    slug: "hibiscus",
    name: "Hibiscus",
    description: "Each letter framed in tropical hibiscus blooms (🌺).",
    category: "accent",
    map: hibiscus,
    preview: hibiscus("Hello"),
  },
  {
    slug: "bouquet",
    name: "Bouquet",
    description: "Each letter wrapped in a mixed flower bouquet (💐).",
    category: "accent",
    map: bouquet,
    preview: bouquet("Hello"),
  },
  {
    slug: "white-flower",
    name: "White Flower",
    description: "Each letter framed in a Japanese-style white flower stamp (💮).",
    category: "accent",
    map: whiteFlower,
    preview: whiteFlower("Hello"),
  },
  {
    slug: "wilted-rose",
    name: "Wilted Rose",
    description: "Each letter wrapped in a wilted rose (🥀) for an emo aesthetic.",
    category: "accent",
    map: wiltedRose,
    preview: wiltedRose("Hello"),
  },
  {
    slug: "lotus",
    name: "Lotus",
    description: "Each letter framed in a sacred lotus blossom (🪷).",
    category: "accent",
    map: lotus,
    preview: lotus("Hello"),
  },
  {
    slug: "crown",
    name: "Crown",
    description: "Each letter crowned (👑) for a regal, royal-fan look.",
    category: "accent",
    map: crown,
    preview: crown("Hello"),
  },
  {
    slug: "butterfly",
    name: "Butterfly",
    description: "Each letter framed in colorful butterflies (🦋).",
    category: "accent",
    map: butterfly,
    preview: butterfly("Hello"),
  },
  {
    slug: "sparkles",
    name: "Sparkles",
    description: "Each letter wrapped in sparkly stars (✨) for a magical feel.",
    category: "accent",
    map: sparkles,
    preview: sparkles("Hello"),
  },
  {
    slug: "ribbon-bow",
    name: "Ribbon Bow",
    description: "Each letter wrapped with a pink ribbon bow (🎀).",
    category: "accent",
    map: ribbonBow,
    preview: ribbonBow("Hello"),
  },
  {
    slug: "glowing-star",
    name: "Glowing Star",
    description: "Each letter framed in a glowing yellow star (🌟).",
    category: "accent",
    map: glowingStar,
    preview: glowingStar("Hello"),
  },
  {
    slug: "heart-ribbon",
    name: "Heart Ribbon",
    description: "Each letter wrapped in a heart-and-ribbon gift (💝).",
    category: "accent",
    map: heartRibbon,
    preview: heartRibbon("Hello"),
  },
  {
    slug: "pink-heart",
    name: "Pink Heart",
    description: "Each letter framed in a beating pink heart (💗).",
    category: "accent",
    map: pinkHeart,
    preview: pinkHeart("Hello"),
  },
  {
    slug: "sparkling-heart",
    name: "Sparkling Heart",
    description: "Each letter wrapped in a sparkling pink heart (💖).",
    category: "accent",
    map: sparklingHeart,
    preview: sparklingHeart("Hello"),
  },
  {
    slug: "crescent-moon",
    name: "Crescent Moon",
    description: "Each letter framed in a crescent moon (🌙) for a night-sky feel.",
    category: "accent",
    map: crescentMoon,
    preview: crescentMoon("Hello"),
  },
  {
    slug: "sun",
    name: "Sun",
    description: "Each letter wrapped in bright sunshine (☀️).",
    category: "accent",
    map: sun,
    preview: sun("Hello"),
  },
  {
    slug: "rainbow",
    name: "Rainbow",
    description: "Each letter framed in a rainbow (🌈) for a colorful vibe.",
    category: "accent",
    map: rainbow,
    preview: rainbow("Hello"),
  },

  // ---- v6 additions: letterform-style compositions (20 styles) ----
  // Each entry pairs a real Unicode letterform base with a strikethrough /
  // underline / double-underline overlay. The base letters differ from any
  // existing composition, so the rendered glyphs are visually fresh — closer
  // to "another bold" than to an emoji-wrapped decoration.

  // Sans-Serif family (3)
  {
    slug: "sans-serif-strikethrough",
    name: "Sans-Serif Strikethrough",
    description: "Clean sans-serif letters with a horizontal line struck through each.",
    category: "decorative",
    map: sansSerifStrikethrough,
    preview: sansSerifStrikethrough("Hello"),
  },
  {
    slug: "sans-serif-underline",
    name: "Sans-Serif Underline",
    description: "Clean sans-serif letters with each letter underlined.",
    category: "decorative",
    map: sansSerifUnderline,
    preview: sansSerifUnderline("Hello"),
  },
  {
    slug: "sans-serif-double-underline",
    name: "Sans-Serif Double Underline",
    description: "Clean sans-serif letters with each letter double-underlined.",
    category: "decorative",
    map: sansSerifDoubleUnderline,
    preview: sansSerifDoubleUnderline("Hello"),
  },

  // Sans Italic family (3)
  {
    slug: "sans-italic-strikethrough",
    name: "Sans Italic Strikethrough",
    description: "Slanted sans-italic letters with a line struck through each.",
    category: "decorative",
    map: sansItalicStrikethrough,
    preview: sansItalicStrikethrough("Hello"),
  },
  {
    slug: "sans-italic-underline",
    name: "Sans Italic Underline",
    description: "Slanted sans-italic letters with each letter underlined.",
    category: "decorative",
    map: sansItalicUnderline,
    preview: sansItalicUnderline("Hello"),
  },
  {
    slug: "sans-italic-double-underline",
    name: "Sans Italic Double Underline",
    description: "Slanted sans-italic letters with each letter double-underlined.",
    category: "decorative",
    map: sansItalicDoubleUnderline,
    preview: sansItalicDoubleUnderline("Hello"),
  },

  // Sans Bold Italic family (3)
  {
    slug: "sans-bold-italic-strikethrough",
    name: "Sans Bold Italic Strikethrough",
    description: "Heavy slanted sans-bold-italic letters with a line struck through each.",
    category: "decorative",
    map: sansBoldItalicStrikethrough,
    preview: sansBoldItalicStrikethrough("Hello"),
  },
  {
    slug: "sans-bold-italic-underline",
    name: "Sans Bold Italic Underline",
    description: "Heavy slanted sans-bold-italic letters with each letter underlined.",
    category: "decorative",
    map: sansBoldItalicUnderline,
    preview: sansBoldItalicUnderline("Hello"),
  },
  {
    slug: "sans-bold-italic-double-underline",
    name: "Sans Bold Italic Double Underline",
    description: "Heavy slanted sans-bold-italic letters with each letter double-underlined.",
    category: "decorative",
    map: sansBoldItalicDoubleUnderline,
    preview: sansBoldItalicDoubleUnderline("Hello"),
  },

  // Monospace family (3)
  {
    slug: "monospace-strikethrough",
    name: "Monospace Strikethrough",
    description: "Fixed-width terminal letters with a line struck through each.",
    category: "decorative",
    map: monospaceStrikethrough,
    preview: monospaceStrikethrough("Hello"),
  },
  {
    slug: "monospace-underline",
    name: "Monospace Underline",
    description: "Fixed-width terminal letters with each letter underlined.",
    category: "decorative",
    map: monospaceUnderline,
    preview: monospaceUnderline("Hello"),
  },
  {
    slug: "monospace-double-underline",
    name: "Monospace Double Underline",
    description: "Fixed-width terminal letters with each letter double-underlined.",
    category: "decorative",
    map: monospaceDoubleUnderline,
    preview: monospaceDoubleUnderline("Hello"),
  },

  // Double-Struck family (3)
  {
    slug: "double-struck-strikethrough",
    name: "Double-Struck Strikethrough",
    description: "Outlined chalkboard letters with a line struck through each.",
    category: "decorative",
    map: doubleStruckStrikethrough,
    preview: doubleStruckStrikethrough("Hello"),
  },
  {
    slug: "double-struck-underline",
    name: "Double-Struck Underline",
    description: "Outlined chalkboard letters with each letter underlined.",
    category: "decorative",
    map: doubleStruckUnderline,
    preview: doubleStruckUnderline("Hello"),
  },
  {
    slug: "double-struck-double-underline",
    name: "Double-Struck Double Underline",
    description: "Outlined chalkboard letters with each letter double-underlined.",
    category: "decorative",
    map: doubleStruckDoubleUnderline,
    preview: doubleStruckDoubleUnderline("Hello"),
  },

  // Bold Serif family (3)
  {
    slug: "bold-serif-strikethrough",
    name: "Bold Serif Strikethrough",
    description: "Heavy serif letters with a line struck through each.",
    category: "decorative",
    map: boldSerifStrikethrough,
    preview: boldSerifStrikethrough("Hello"),
  },
  {
    slug: "bold-serif-underline",
    name: "Bold Serif Underline",
    description: "Heavy serif letters with each letter underlined.",
    category: "decorative",
    map: boldSerifUnderline,
    preview: boldSerifUnderline("Hello"),
  },
  {
    slug: "bold-serif-double-underline",
    name: "Bold Serif Double Underline",
    description: "Heavy serif letters with each letter double-underlined.",
    category: "decorative",
    map: boldSerifDoubleUnderline,
    preview: boldSerifDoubleUnderline("Hello"),
  },

  // Bold Cursive family (2)
  {
    slug: "bold-cursive-strikethrough",
    name: "Bold Cursive Strikethrough",
    description: "Heavy script letters with a line struck through each.",
    category: "decorative",
    map: boldCursiveStrikethrough,
    preview: boldCursiveStrikethrough("Hello"),
  },
  {
    slug: "bold-cursive-underline",
    name: "Bold Cursive Underline",
    description: "Heavy script letters with each letter underlined.",
    category: "decorative",
    map: boldCursiveUnderline,
    preview: boldCursiveUnderline("Hello"),
  },

  // ---- v7 additions: 7 new Unicode letterform blocks (22 styles total) ----
  // Each block ships its base mapping plus 1-4 strikethrough / underline /
  // double-underline / dot-above composition variants. Visually distinct
  // from every existing Latin / Greek / Cyrillic / Armenian style — these
  // are real alphabets from outside the Latin-script family.

  // Gothic (5) — U+10330..U+1034F
  {
    slug: "gothic",
    name: "Gothic",
    description: "Real Gothic alphabet letterforms — visually distinct from Fraktur.",
    category: "decorative",
    map: gothic,
    preview: gothic("Hello"),
  },
  {
    slug: "gothic-strikethrough",
    name: "Gothic Strikethrough",
    description: "Gothic alphabet letters with a line struck through each.",
    category: "decorative",
    map: gothicStrikethrough,
    preview: gothicStrikethrough("Hello"),
  },
  {
    slug: "gothic-underline",
    name: "Gothic Underline",
    description: "Gothic alphabet letters with each letter underlined.",
    category: "decorative",
    map: gothicUnderline,
    preview: gothicUnderline("Hello"),
  },
  {
    slug: "gothic-double-underline",
    name: "Gothic Double Underline",
    description: "Gothic alphabet letters with each letter double-underlined.",
    category: "decorative",
    map: gothicDoubleUnderline,
    preview: gothicDoubleUnderline("Hello"),
  },
  {
    slug: "gothic-dot-above",
    name: "Gothic Dot Above",
    description: "Gothic alphabet letters topped with a typographic dot.",
    category: "decorative",
    map: gothicDotAbove,
    preview: gothicDotAbove("Hello"),
  },

  // Runic (5) — U+16A0..U+16F0
  {
    slug: "runic",
    name: "Runic",
    description: "Viking / Old Norse rune alphabet letterforms.",
    category: "decorative",
    map: runic,
    preview: runic("Hello"),
  },
  {
    slug: "runic-strikethrough",
    name: "Runic Strikethrough",
    description: "Rune letters with a line struck through each.",
    category: "decorative",
    map: runicStrikethrough,
    preview: runicStrikethrough("Hello"),
  },
  {
    slug: "runic-underline",
    name: "Runic Underline",
    description: "Rune letters with each letter underlined.",
    category: "decorative",
    map: runicUnderline,
    preview: runicUnderline("Hello"),
  },
  {
    slug: "runic-double-underline",
    name: "Runic Double Underline",
    description: "Rune letters with each letter double-underlined.",
    category: "decorative",
    map: runicDoubleUnderline,
    preview: runicDoubleUnderline("Hello"),
  },
  {
    slug: "runic-dot-above",
    name: "Runic Dot Above",
    description: "Rune letters topped with a typographic dot.",
    category: "decorative",
    map: runicDotAbove,
    preview: runicDotAbove("Hello"),
  },

  // Cherokee (3) — U+13A0..U+13FF
  {
    slug: "cherokee",
    name: "Cherokee",
    description: "Cherokee syllabary letters — geometric, exotic, distinctive.",
    category: "decorative",
    map: cherokee,
    preview: cherokee("Hello"),
  },
  {
    slug: "cherokee-strikethrough",
    name: "Cherokee Strikethrough",
    description: "Cherokee syllabary letters with a line struck through each.",
    category: "decorative",
    map: cherokeeStrikethrough,
    preview: cherokeeStrikethrough("Hello"),
  },
  {
    slug: "cherokee-underline",
    name: "Cherokee Underline",
    description: "Cherokee syllabary letters with each letter underlined.",
    category: "decorative",
    map: cherokeeUnderline,
    preview: cherokeeUnderline("Hello"),
  },

  // Vai (3) — U+A500..U+A63F
  {
    slug: "vai",
    name: "Vai",
    description: "Vai syllabary letters — West African script.",
    category: "decorative",
    map: vai,
    preview: vai("Hello"),
  },
  {
    slug: "vai-strikethrough",
    name: "Vai Strikethrough",
    description: "Vai syllabary letters with a line struck through each.",
    category: "decorative",
    map: vaiStrikethrough,
    preview: vaiStrikethrough("Hello"),
  },
  {
    slug: "vai-underline",
    name: "Vai Underline",
    description: "Vai syllabary letters with each letter underlined.",
    category: "decorative",
    map: vaiUnderline,
    preview: vaiUnderline("Hello"),
  },

  // Tifinagh (2) — U+2D30..U+2D7F
  {
    slug: "tifinagh",
    name: "Tifinagh",
    description: "Berber / Amazigh alphabet — geometric circles and lines.",
    category: "decorative",
    map: tifinagh,
    preview: tifinagh("Hello"),
  },
  {
    slug: "tifinagh-strikethrough",
    name: "Tifinagh Strikethrough",
    description: "Tifinagh letters with a line struck through each.",
    category: "decorative",
    map: tifinaghStrikethrough,
    preview: tifinaghStrikethrough("Hello"),
  },

  // ---- v8 addition: Zalgo / Freaky (stacked combining marks) ----
  // The classic "bleeding text" / corrupted-text effect. Deterministic per
  // character so SSR and CSR produce identical output (no hydration
  // mismatch from Math.random()).
  {
    slug: "freaky",
    name: "Freaky",
    description: "Zalgo / glitched text — each letter covered in stacked combining marks.",
    category: "decorative",
    map: freaky,
    preview: freaky("Hello"),
  },

  // NOTE: Deseret (U+10400..U+1044F) and Osmanya (U+10480..U+1049F) were
  // removed in v7.1 — neither block has reliable cross-platform font
  // coverage (no Google Fonts version, no default system installation on
  // Windows / Linux / most mobile). Tofu boxes were rendering on most
  // non-macOS systems.
];

/**
 * Look up a style by slug. Returns `null` for unknown slugs so route handlers
 * can decide whether to 404 or fall back to the home page.
 */
export function getFontStyle(slug: string): FontStyle | null {
  return FONT_STYLES.find((s) => s.slug === slug) ?? null;
}

/**
 * Group styles by category for the filter chip UI. Order matches the chip
 * bar: classic → decorative → accent → game.
 */
export function getStylesByCategory(): Record<FontCategory, FontStyle[]> {
  const out: Record<FontCategory, FontStyle[]> = {
    classic: [],
    decorative: [],
    accent: [],
    game: [],
  };
  for (const s of FONT_STYLES) out[s.category].push(s);
  return out;
}

/**
 * Convert a string using every style in the registry. Returned in the same
 * order as `FONT_STYLES` so the UI can render results deterministically.
 *
 * The empty-input case returns an array of `null` strings — the UI treats
 * null as "show the placeholder text" so the result cards stay visible even
 * before the user types.
 */
export function convertAll(input: string): (string | null)[] {
  if (!input) return FONT_STYLES.map(() => null);
  return FONT_STYLES.map((s) => s.map(input));
}