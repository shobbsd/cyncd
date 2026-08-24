import { Pressable, StyleSheet, View } from 'react-native'
import { DAY_TYPE_LABELS, type DayType } from '../content'
import { color, dayColor, radius, space, tap } from '../theme/tokens'
import { Eyebrow } from './ui'

/**
 * Soft-gradient 7-day overview. Colours only — no numbers, no scale, nothing
 * that reads as a chart. Tapping a segment moves to that day, so the strip
 * doubles as navigation without ever showing data.
 *
 * The hit area is a full 44px tall while the visible bar is 10px: the segment
 * is small by design and the target around it should not be.
 */
export function WeekStrip({
  week,
  currentDay,
  onSelect,
}: {
  week: DayType[]
  currentDay: number
  onSelect: (day: number) => void
}) {
  return (
    <View style={styles.week}>
      <Eyebrow>This week</Eyebrow>
      <View style={styles.track}>
        {week.map((dayType, index) => {
          const day = index + 1
          const current = day === currentDay
          return (
            <Pressable
              key={day}
              accessibilityRole="button"
              accessibilityLabel={`Day ${day}, ${DAY_TYPE_LABELS[dayType]}`}
              accessibilityState={{ selected: current }}
              onPress={() => onSelect(day)}
              style={styles.hit}
            >
              <View
                style={[
                  styles.seg,
                  { backgroundColor: dayColor[dayType] },
                  current && styles.segCurrent,
                ]}
              />
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  week: {
    gap: space.md,
  },
  track: {
    flexDirection: 'row',
    gap: space.xs,
  },
  hit: {
    flex: 1,
    height: tap,
    justifyContent: 'center',
  },
  seg: {
    height: 10,
    borderRadius: radius.pill,
    opacity: 0.55,
  },
  segCurrent: {
    height: 16,
    opacity: 1,
    borderWidth: 1.5,
    borderColor: color.surface,
  },
})
