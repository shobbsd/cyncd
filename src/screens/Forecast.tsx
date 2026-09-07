import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Btn,
  Card,
  Eyebrow,
  Faint,
  Guidance,
  Muted,
  ScreenTitle,
} from '../components/ui';
import { useCyncd } from '../state';
import { color, dayColor, font, radius, space, tap } from '../theme/tokens';
import { Track } from './Track';

const DAY_FORMATTER = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  day: 'numeric',
});

const PHASE_LABELS = {
  period: 'Period',
  follicular: 'Follicular phase',
  ovulatory: 'Ovulatory phase',
  luteal: 'Luteal phase',
} as const;

function formatDate(date: string): string {
  return DAY_FORMATTER.format(new Date(`${date}T12:00:00.000Z`));
}

function phaseColor(phase: keyof typeof PHASE_LABELS): string {
  if (phase === 'period') return dayColor.lowEnergy;
  if (phase === 'ovulatory') return dayColor.social;
  if (phase === 'luteal') return dayColor.calm;
  return dayColor.focused;
}

/** Shanice-only forecast and private tracking entry point. */
export function Forecast() {
  const { derived, actions } = useCyncd();
  const [trackingDate, setTrackingDate] = useState<string | null>(null);
  const [sharedInsight, setSharedInsight] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    derived.privateCycle.kind === 'predicted'
      ? (derived.privateCycle.outlook[0]?.date ?? null)
      : null,
  );

  if (trackingDate !== null) {
    return (
      <Track
        key={trackingDate}
        date={trackingDate}
        onDone={() => setTrackingDate(null)}
      />
    );
  }

  const selected =
    derived.privateCycle.kind === 'predicted'
      ? (derived.privateCycle.outlook.find((day) => day.date === selectedDate) ??
        derived.privateCycle.outlook[0])
      : undefined;

  return (
    <View style={styles.screen}>
      <ScreenTitle>Your forecast</ScreenTitle>
      {derived.privateCycle.kind === 'predicted' ? (
        <Card variant="warm">
          <Eyebrow>Today</Eyebrow>
          <Guidance>
            {PHASE_LABELS[derived.privateCycle.phase]} · Cycle day{' '}
            {derived.privateCycle.cycleDay}
          </Guidance>
          <Muted>{derived.forecast.detail}</Muted>
        </Card>
      ) : null}

      <Card>
        <Eyebrow>
          {derived.privateCycle.kind === 'predicted'
            ? 'Looking ahead'
            : 'Getting started'}
        </Eyebrow>
        <Text style={styles.forecastTitle}>{derived.forecast.title}</Text>
        <Muted>{derived.forecast.mood}</Muted>
        <Muted>{derived.forecast.energy}</Muted>
      </Card>

      {derived.privateCycle.kind === 'predicted' ? (
        <Card>
          <Eyebrow>Next seven days</Eyebrow>
          <View style={styles.outlook}>
            {derived.forecast.outlook.map((day) => (
              <Pressable
                key={day.date}
                accessibilityRole="button"
                accessibilityLabel={`Forecast for ${formatDate(day.date)}`}
                accessibilityState={{ selected: day.date === selected?.date }}
                onPress={() => setSelectedDate(day.date)}
                style={({ pressed }) => [
                  styles.day,
                  { borderColor: phaseColor(day.phase) },
                  day.date === selected?.date && styles.daySelected,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.dayDate}>{formatDate(day.date)}</Text>
                <Text style={styles.dayPhase}>{PHASE_LABELS[day.phase]}</Text>
              </Pressable>
            ))}
          </View>
          {selected === undefined ? null : (
            <View style={styles.selectedDay}>
              <Text style={styles.selectedTitle}>
                {formatDate(selected.date)} · cycle day {selected.cycleDay}
              </Text>
              <Faint>
                {PHASE_LABELS[selected.phase]}. This is a private, estimated
                outlook—not a diagnosis.
              </Faint>
              <Btn
                label="Track this day"
                variant="secondary"
                onPress={() => setTrackingDate(selected.date)}
              />
              {sharedInsight ? (
                <Faint>Shared as a general preference—not a cycle detail.</Faint>
              ) : (
                <Btn
                  label="Share ‘I’d like a quieter evening’"
                  variant="ghost"
                  onPress={() => {
                    actions.createSharedItem({
                      kind: 'insight',
                      body: 'I’d like a quieter evening.',
                      date: derived.simulatedDate,
                    });
                    setSharedInsight(true);
                  }}
                />
              )}
            </View>
          )}
        </Card>
      ) : null}

      <Btn
        label={derived.forecast.action}
        block
        onPress={() => setTrackingDate(selectedDate ?? derived.simulatedDate)}
      />
      <Faint>Only you can see cycle details and private logs.</Faint>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { gap: space.lg },
  forecastTitle: {
    fontSize: font.size.heading,
    lineHeight: 26,
    fontWeight: font.weight.bold,
    color: color.ink,
  },
  outlook: { gap: space.sm },
  day: {
    minHeight: tap + 20,
    padding: space.md,
    borderWidth: 1,
    borderRadius: radius.soft,
    backgroundColor: color.surfaceWarm,
    gap: 2,
  },
  daySelected: { backgroundColor: color.surface, borderWidth: 2 },
  dayDate: { fontSize: font.size.small, fontWeight: font.weight.bold, color: color.ink },
  dayPhase: { fontSize: font.size.caption, color: color.inkSoft },
  selectedDay: { gap: space.sm, paddingTop: space.md },
  selectedTitle: { fontSize: font.size.small, fontWeight: font.weight.bold, color: color.ink },
  pressed: { opacity: 0.7 },
});
