import { StyleSheet, Text, View } from 'react-native'
import type { DayType } from '../content'
import { color, dayColor, font, radius, space } from '../theme/tokens'

/**
 * Colour-coded day-type indicator. The same pill and the same colour show for
 * both roles — the day type is shared understanding, which is the whole point.
 */
export function DayPill({ dayType, label }: { dayType: DayType; label: string }) {
  const tint = dayColor[dayType]

  return (
    <View style={[styles.pill, { borderColor: tint }]}>
      <View style={[styles.dot, { backgroundColor: tint }]} />
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: 6,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    backgroundColor: color.surface,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: font.size.caption,
    fontWeight: font.weight.bold,
    letterSpacing: 0.3,
    color: color.ink,
  },
})
