import { useState } from 'react';
import Slider from '@react-native-community/slider';
import { StyleSheet, Text, View } from 'react-native';
import {
  Btn,
  Card,
  Chip,
  Empty,
  Eyebrow,
  Faint,
  ScreenTitle,
} from '../components/ui';
import {
  ACCURACY_LABELS,
  ACCURACY_MAX,
  ACCURACY_MIN,
  DAY_TYPE_LABELS,
  MOOD_CHIPS,
} from '../content';
import { useCyncd } from '../state';
import { color, font, space } from '../theme/tokens';

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });

/**
 * Reflection & Learn. One slider, one optional mood chip, one confirmation.
 *
 * No streaks, no badges, no reminder to come back. Skipping a reflection is a
 * normal outcome and the app never mentions it again.
 */
export function Reflect() {
  const { derived, actions } = useCyncd();
  const [accuracy, setAccuracy] = useState(3);
  const [mood, setMood] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    actions.addReflection(accuracy, mood ?? undefined);
    setSubmitted(true);
    setMood(null);
    setAccuracy(3);
  };

  return (
    <View style={styles.screen}>
      <ScreenTitle>How was today?</ScreenTitle>

      <Card>
        <Eyebrow>How accurate was today?</Eyebrow>
        <View style={styles.slider}>
          <Slider
            minimumValue={ACCURACY_MIN}
            maximumValue={ACCURACY_MAX}
            step={1}
            value={accuracy}
            accessibilityLabel="How accurate was today?"
            minimumTrackTintColor={color.sageDeep}
            maximumTrackTintColor={color.lineStrong}
            thumbTintColor={color.sageDeep}
            onValueChange={(value) => {
              setAccuracy(value);
              setSubmitted(false);
            }}
          />
          <View style={styles.sliderEnds}>
            <Faint>{ACCURACY_LABELS.low}</Faint>
            <Faint>{ACCURACY_LABELS.high}</Faint>
          </View>
        </View>

        <Eyebrow>How did it feel? Optional</Eyebrow>
        <View style={styles.chipRow}>
          {MOOD_CHIPS.map((chip) => (
            <Chip
              key={chip}
              label={chip}
              selected={mood === chip}
              onPress={() => {
                setMood((current) => (current === chip ? null : chip));
                setSubmitted(false);
              }}
            />
          ))}
        </View>

        {submitted ? (
          <Faint>Thanks — cyncd is learning your patterns.</Faint>
        ) : (
          <Btn label="Submit" block onPress={submit} />
        )}
      </Card>

      <View style={styles.section}>
        <Eyebrow>Recent</Eyebrow>
        {derived.timeline.length === 0 ? (
          <Empty>
            Nothing here yet. Reflections and anything you save from the coach
            show up here.
          </Empty>
        ) : (
          <View style={styles.timeline}>
            {derived.timeline.map((entry) => (
              <View key={entry.id} style={styles.entry}>
                <Text style={styles.when}>{formatWhen(entry.date)}</Text>
                <View style={styles.what}>
                  <Text style={styles.entryText}>{entry.text}</Text>
                  <Faint>
                    Day {entry.day} · {DAY_TYPE_LABELS[entry.dayType]}
                    {entry.rating === undefined
                      ? ''
                      : ` · rated ${entry.rating} of ${ACCURACY_MAX}`}
                  </Faint>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: space.lg,
  },
  section: {
    gap: space.md,
  },
  slider: {
    gap: space.xs,
  },
  sliderEnds: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  timeline: {
    gap: space.md,
  },
  entry: {
    flexDirection: 'row',
    gap: space.md,
    alignItems: 'flex-start',
  },
  when: {
    width: 56,
    paddingTop: 2,
    fontSize: font.size.caption,
    fontWeight: font.weight.bold,
    color: color.inkFaint,
  },
  what: {
    flex: 1,
    gap: 2,
  },
  entryText: {
    fontSize: font.size.small,
    lineHeight: 21,
    fontWeight: font.weight.semibold,
    color: color.ink,
  },
});
