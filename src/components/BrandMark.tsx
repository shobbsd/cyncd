import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
import { color, font, space } from '../theme/tokens';

/**
 * The brand mark: two thin warm-gold overlapping circles on sage.
 *
 * Vector rather than an asset so it stays crisp at any size and needs no image
 * decode on the splash — which is the first frame of the app and the one that
 * should never pop in late.
 */
export function BrandMark({ size = 48 }: { size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      accessibilityLabel="cyncd"
    >
      <Rect width={48} height={48} rx={14} fill={color.sage} />
      <Circle
        cx={19.5}
        cy={24}
        r={9.5}
        stroke={color.gold}
        strokeWidth={1.6}
        fill="none"
      />
      <Circle
        cx={28.5}
        cy={24}
        r={9.5}
        stroke={color.gold}
        strokeWidth={1.6}
        fill="none"
      />
    </Svg>
  );
}

/** Header lockup — mark plus wordmark. */
export function BrandLockup() {
  return (
    <View style={styles.brand}>
      <BrandMark size={28} />
      <Text style={styles.word}>cyncd</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  word: {
    fontSize: font.size.heading,
    fontWeight: font.weight.bold,
    letterSpacing: -0.2,
    color: color.ink,
  },
});
