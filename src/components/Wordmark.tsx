/**
 * The brand wordmark — "FontGen.art" rendered in Bold Script Unicode
 * (𝓕𝓸𝓷𝓽𝓖𝓮𝓷.𝓪𝓻𝓽, U+1D4D5..U+1D4FD) so the site name itself visually
 * echoes the product: this site is a fancy-font generator, and the
 * wordmark IS one of its fancy fonts.
 *
 * Visual treatment:
 *   - "FontGen" uses a violet → fuchsia → pink gradient with a subtle
 *     drop shadow for lift off the surface background.
 *   - ".art" is rendered in the same Bold Script but at a lighter weight
 *     color so it reads as a secondary tag, matching the original gray
 *     treatment of the suffix.
 *
 * Both parts are split so the consumer can hide ".art" on small
 * viewports independently from the main wordmark — same behavior as
 * the previous plain-text version.
 */
const WORDMARK_FONTGEN = "\u{1D4D5}\u{1D4F8}\u{1D4F7}\u{1D4FD}\u{1D4D6}\u{1D4EE}\u{1D4F7}";
// 𝓕𝓸𝓷𝓽𝓖𝓮𝓷

const WORDMARK_ART = "\u{1D4EA}\u{1D4FB}\u{1D4FD}";
// 𝓪𝓻𝓽

export function Wordmark({
  className = "",
  showSuffix = true,
  suffixClassName = "",
}: {
  /** Extra classes merged into the outer wrapper. */
  className?: string;
  /** Whether to render the ".art" suffix. Defaults to true. */
  showSuffix?: boolean;
  /** Extra classes applied to the ".art" span only. */
  suffixClassName?: string;
}) {
  return (
    <span
      className={`inline-flex items-baseline bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text font-extrabold tracking-tight text-transparent drop-shadow-[0_1px_2px_rgba(124,58,237,0.18)] ${className}`}
    >
      <span>{WORDMARK_FONTGEN}</span>
      {showSuffix && (
        <span
          className={`ml-1 bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent ${suffixClassName}`}
        >
          .{WORDMARK_ART}
        </span>
      )}
    </span>
  );
}

/**
 * Plain-text "FontGen" — used in legal copy, alt text, and other places
 * that should NOT carry the fancy styling (screen readers, OG cards,
 * legal mentions). Same character sequence as the styled version but
 * without the gradient treatment.
 */
export const PLAIN_WORDMARK = "FontGen";
export const PLAIN_WORDMARK_FULL = "FontGen.art";