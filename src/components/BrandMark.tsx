import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { color, font, space } from '../theme/tokens';

/**
 * The two profiles in the Cyncd mark, traced from the approved logo into a
 * 100×100 box. Kept as separate paths so screens can move them independently —
 * the Hold to Cync moment brings the two halves together.
 */
export const MARK_PATHS = {
  left: 'M38.2 12.0 L34.8 12.5 L31.6 13.4 L28.3 15.0 L26.5 16.2 L23.8 18.4 L21.7 20.7 L19.7 23.5 L18.1 26.6 L17.3 28.8 L16.6 31.2 L16.2 34.6 L16.2 61.5 L16.3 61.6 L16.4 64.4 L16.8 67.0 L17.3 69.1 L18.0 71.5 L18.7 73.3 L20.1 76.0 L21.3 77.9 L23.3 80.3 L24.9 81.9 L26.5 83.2 L28.5 84.6 L31.1 86.0 L33.7 87.0 L35.8 87.5 L37.5 87.8 L40.6 87.9 L43.3 87.5 L45.2 86.9 L47.1 85.8 L48.7 84.3 L49.4 83.3 L50.4 81.2 L50.6 79.4 L50.5 77.1 L49.9 75.5 L49.3 74.3 L48.6 73.3 L47.0 71.8 L45.3 70.5 L38.3 66.1 L36.7 64.9 L35.7 63.9 L35.1 63.0 L34.2 61.0 L34.1 60.4 L34.2 58.3 L34.8 57.1 L35.6 56.3 L36.7 55.8 L38.4 55.9 L41.6 56.7 L43.3 57.0 L44.3 57.0 L45.0 56.8 L45.8 56.4 L46.1 55.9 L46.5 55.1 L46.8 53.3 L47.1 52.6 L47.6 52.1 L48.3 51.8 L48.8 51.4 L48.9 51.1 L48.8 50.5 L48.2 49.8 L49.6 49.4 L50.1 48.7 L50.1 48.3 L49.6 47.3 L49.7 46.1 L50.4 45.5 L52.0 44.8 L52.6 44.3 L53.0 43.3 L52.8 42.3 L51.5 39.9 L51.1 38.8 L50.8 37.5 L50.7 35.8 L51.1 33.8 L52.6 30.4 L53.4 27.7 L53.7 25.9 L53.7 23.3 L53.2 20.9 L52.2 18.4 L51.1 16.7 L49.6 15.2 L48.9 14.7 L46.5 13.4 L44.7 12.7 L41.3 12.1 Z',
  right:
    'M71.6 30.2 L69.8 30.2 L68.4 30.4 L67.0 30.7 L65.5 31.3 L63.2 32.6 L61.9 33.6 L60.7 34.9 L59.5 36.9 L58.9 38.8 L58.9 41.0 L59.5 44.0 L59.5 45.2 L59.3 45.8 L57.7 48.3 L55.0 51.4 L54.4 52.3 L54.4 53.0 L54.7 53.6 L55.4 54.2 L56.7 54.5 L57.2 55.0 L57.3 55.3 L57.3 56.2 L56.8 57.0 L56.8 57.4 L57.1 57.8 L58.1 58.3 L57.7 58.8 L57.5 59.1 L57.5 59.6 L58.2 60.3 L58.6 61.1 L58.6 61.9 L58.2 63.4 L58.2 64.5 L58.6 65.3 L59.2 66.0 L60.2 66.3 L62.1 66.3 L64.9 65.9 L66.3 65.9 L66.8 66.0 L67.4 66.7 L67.9 68.1 L67.8 69.9 L67.4 71.1 L66.9 72.2 L65.1 74.5 L62.1 77.5 L61.5 78.2 L60.9 79.4 L60.4 81.0 L60.3 81.7 L60.4 83.2 L60.8 84.4 L61.3 85.3 L62.2 86.2 L62.7 86.5 L64.1 87.1 L65.0 87.3 L66.0 87.3 L66.0 87.4 L68.4 87.3 L69.9 87.0 L71.5 86.5 L74.5 85.1 L75.9 84.2 L77.5 82.9 L79.1 81.3 L80.0 80.1 L81.1 78.3 L81.9 76.7 L82.9 73.9 L83.7 70.4 L83.8 69.6 L83.8 43.5 L83.6 42.0 L83.1 40.0 L82.3 37.9 L81.5 36.5 L80.5 35.1 L78.8 33.2 L76.8 31.8 L75.5 31.2 L73.4 30.4 Z',
} as const;

/** One half of the mark on its own — for screens that animate the halves. */
export function MarkHalf({ side, size }: { side: 'left' | 'right'; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path d={MARK_PATHS[side]} fill={color.forest} />
    </Svg>
  );
}

/**
 * The brand mark: the two profiles in forest green on a white tile.
 *
 * Vector rather than an asset so it stays crisp at any size and needs no image
 * decode on the splash — which is the first frame of the app and the one that
 * should never pop in late.
 */
export function BrandMark({ size = 48 }: { size?: number }) {
  // Proportions from the app-icon artwork: the tile is ~22% rounded, and the
  // paths already leave the glyph's margin inside their 100×100 box.
  return (
    <View
      accessibilityLabel="Cyncd"
      accessibilityRole="image"
      style={[
        styles.tile,
        { width: size, height: size, borderRadius: size * 0.22 },
        size >= 64 && styles.tileLifted,
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Path d={MARK_PATHS.left} fill={color.forest} />
        <Path d={MARK_PATHS.right} fill={color.forest} />
      </Svg>
    </View>
  );
}

/** The CYNCD wordmark on its own. */
export function Wordmark({ size = font.size.heading }: { size?: number }) {
  return (
    <Text
      style={[
        styles.word,
        { fontSize: size, letterSpacing: size * 0.12 },
      ]}
    >
      CYNCD
    </Text>
  );
}

/** Header lockup — mark plus wordmark. */
export function BrandLockup() {
  return (
    <View style={styles.brand}>
      <BrandMark size={28} />
      <Wordmark />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.line,
  },
  tileLifted: {
    shadowColor: '#33322e',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  word: {
    fontFamily: font.wordmark,
    color: color.forest,
  },
});
