interface MicrositeEyebrowProps {
  eyebrow: string;
  className: string;
}

interface SplitDecorativeEmojiResult {
  decorative: string;
  label: string;
}

/** Matches a leading emoji grapheme (e.g. "🐑", "🏞️"). */
const EMOJI_GRAPHEME_RE = /^\p{Extended_Pictographic}/u;

/** Splits the leading decorative emoji from an eyebrow (e.g. "📉 the jobless rate"). */
function splitDecorativeEmoji(eyebrow: string): SplitDecorativeEmojiResult {
  const segments = Array.from(
    new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(eyebrow),
    (segment) => segment.segment,
  );
  const [first, ...rest] = segments;
  if (first !== undefined && EMOJI_GRAPHEME_RE.test(first)) {
    return { decorative: first, label: rest.join('').trim() };
  }
  return { decorative: '', label: eyebrow };
}

/** A microsite eyebrow: decorative emoji hidden from screen readers, plus the label. */
export function MicrositeEyebrow({
  eyebrow,
  className,
}: MicrositeEyebrowProps): React.ReactElement {
  const { decorative, label } = splitDecorativeEmoji(eyebrow);
  return (
    <p className={className}>
      {decorative !== '' && <span aria-hidden="true">{decorative} </span>}
      {label}
    </p>
  );
}
