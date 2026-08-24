/**
 * cyncd design tokens.
 *
 * A direct port of the `:root` custom properties in the web prototype's
 * `index.css`. Values are copied, not reinterpreted — the palette is the
 * product's, and a redesign is a separate decision from a platform move.
 *
 * Two things deliberately did not come across:
 *
 * - The `--frame: 430px` phone-column constraint. That existed to make a
 *   browser look like a phone; on a phone the device is the frame.
 * - `--tap: 44px`. It stays as `tap` below because every interactive element
 *   still has to clear it, but React Native has no `min-height` inheritance to
 *   lean on, so it has to be applied per component rather than once globally.
 */

export const color = {
  // Palette — soft sage, warm sand, muted lavender, warm gold. No bright
  // pinks, no clinical blues.
  sage: '#9caf9f',
  sageDeep: '#778e7c',
  sand: '#e8dcc8',
  lavender: '#b9aec9',
  gold: '#c9a96a',

  bg: '#faf8f4',
  surface: '#ffffff',
  surfaceWarm: '#f4f0e8',

  ink: '#33322e',
  inkSoft: '#6e6b63',
  inkFaint: '#9a968c',
  line: 'rgba(51, 50, 46, 0.1)',
  lineStrong: 'rgba(51, 50, 46, 0.16)',
} as const;

/**
 * Day-type hooks, keyed by the content layer's `DayType`.
 *
 * The web build went through a `DAY_TYPE_TOKEN` map of CSS custom-property
 * names; that indirection existed only because CSS needed a string to look up.
 * Here the record is keyed by `DayType` directly, so the content layer still
 * decides which day is which and this file still decides what each looks like.
 */
export const dayColor = {
  calm: color.sage,
  lowEnergy: color.lavender,
  social: color.gold,
  focused: color.sageDeep,
} as const;

export const radius = {
  card: 20,
  soft: 16,
  pill: 999,
} as const;

/**
 * The web build used two layered box-shadows per elevation. React Native takes
 * a single shadow, so each is flattened to the wider, softer of the pair —
 * that is the one doing the visible work; the tight 2px layer only sharpened
 * an edge that the border already carries here.
 *
 * `elevation` is Android's separate shadow system and has no colour or offset
 * of its own; the numbers are tuned to read at roughly the same depth as iOS.
 */
export const shadow = {
  card: {
    shadowColor: '#33322e',
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  lift: {
    shadowColor: '#33322e',
    shadowOpacity: 0.1,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
} as const;

/** Every interactive element clears this. */
export const tap = 44;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/**
 * Nunito Sans is the prototype's face. Until it is loaded through `expo-font`
 * these fall through to the platform UI font, which is the correct fallback
 * rather than a placeholder — `System` is San Francisco on iOS and Roboto on
 * Android, both of which sit acceptably next to the palette.
 */
export const font = {
  family: 'System',
  size: {
    display: 28,
    title: 22,
    heading: 18,
    body: 16,
    small: 14,
    caption: 12,
  },
  weight: {
    regular: '400',
    semibold: '600',
    bold: '700',
  },
  lineHeight: 1.5,
} as const;
