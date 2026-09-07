import { Pressable, StyleSheet, Text, View } from 'react-native';
import { calendarDaysForMonth, type CalendarEntry } from '../content';
import { color, font, radius, space } from '../theme/tokens';

export function CalendarGrid({
  month,
  entries,
  selectedDate,
  onSelect,
}: {
  month: string;
  entries: CalendarEntry[];
  selectedDate: string;
  onSelect: (date: string) => void;
}) {
  return (
    <View style={styles.grid}>
      {calendarDaysForMonth(month).map((date) => {
        const dayEntries = entries.filter((entry) => entry.date === date);
        return (
          <Pressable
            key={date}
            accessibilityRole="button"
            accessibilityLabel={`Calendar day ${date}`}
            accessibilityState={{ selected: selectedDate === date }}
            onPress={() => onSelect(date)}
            style={[styles.day, selectedDate === date && styles.selected]}
          >
            <Text style={styles.dayNumber}>{date.slice(-2)}</Text>
            {dayEntries.slice(0, 1).map((entry) => (
              <Text key={entry.id} numberOfLines={1} style={styles.entry}>
                {entry.title}
              </Text>
            ))}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  day: { width: '13.6%', minHeight: 62, padding: 4, borderRadius: radius.soft, backgroundColor: color.surfaceWarm, gap: 2 },
  selected: { backgroundColor: color.sand, borderWidth: 1, borderColor: color.gold },
  dayNumber: { fontSize: font.size.caption, fontWeight: font.weight.bold, color: color.ink },
  entry: { fontSize: 9, color: color.inkSoft },
});
