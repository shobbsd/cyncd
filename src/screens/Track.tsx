import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { buildCycleLog, type CycleLogInput } from '../content';
import { Btn, Card, Chip, Eyebrow, Faint, ScreenTitle } from '../components/ui';
import { useCyncd } from '../state';
import { color, font, radius, space } from '../theme/tokens';

const FORMATTER = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const FIELDS: {
  label: string;
  key: keyof Pick<
    CycleLogInput,
    'mood' | 'energy' | 'pain' | 'sleep' | 'stress' | 'libido'
  >;
  options: string[];
}[] = [
  { label: 'Mood', key: 'mood', options: ['Low', 'Steady', 'Good'] },
  { label: 'Energy', key: 'energy', options: ['Low', 'Medium', 'High'] },
  { label: 'Pain or cramps', key: 'pain', options: ['None', 'Mild', 'Strong'] },
  { label: 'Sleep', key: 'sleep', options: ['Poor', 'Okay', 'Rested'] },
  { label: 'Stress', key: 'stress', options: ['Low', 'Medium', 'High'] },
  { label: 'Libido', key: 'libido', options: ['Low', 'Neutral', 'High'] },
];

function isoLabel(date: string): string {
  return FORMATTER.format(new Date(`${date}T12:00:00.000Z`));
}

function toggle(values: string[] | undefined, value: string): string[] {
  const current = values ?? [];
  return current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
}

/** Private, date-addressed log editor. No item from this form is shared. */
export function Track({ date, onDone }: { date: string; onDone: () => void }) {
  const { state, actions } = useCyncd();
  const existing = state.cycleLogs.find((entry) => entry.date === date);
  const [form, setForm] = useState<CycleLogInput>(() => {
    const { id: _id, date: _date, ...input } = existing ?? { id: '', date: '' };
    return input;
  });
  const [saved, setSaved] = useState(false);

  const choose = (key: keyof CycleLogInput, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const save = () => {
    actions.upsertCycleLog(buildCycleLog(date, form));
    setSaved(true);
  };

  return (
    <View style={styles.screen}>
      <Btn label="Back to forecast" variant="ghost" onPress={onDone} />
      <ScreenTitle>Track how you feel</ScreenTitle>
      <Faint>{isoLabel(date)} · private to you</Faint>

      <Card>
        <Eyebrow>Period</Eyebrow>
        <View style={styles.chips}>
          {(['start', 'end'] as const).map((value) => (
            <Chip
              key={value}
              label={value === 'start' ? 'Period started' : 'Period ended'}
              selected={form.period === value}
              onPress={() => choose('period', value)}
            />
          ))}
        </View>
        <Eyebrow>Flow</Eyebrow>
        <View style={styles.chips}>
          {(['light', 'medium', 'heavy'] as const).map((value) => (
            <Chip
              key={value}
              label={value}
              selected={form.flow === value}
              onPress={() => choose('flow', value)}
            />
          ))}
        </View>
      </Card>

      {FIELDS.map(({ label, key, options }) => (
        <Card key={key} variant="flat">
          <Eyebrow>{label}</Eyebrow>
          <View style={styles.chips}>
            {options.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={form[key] === option}
                onPress={() => choose(key, option)}
              />
            ))}
          </View>
        </Card>
      ))}

      <Card variant="flat">
        <Eyebrow>Physical symptoms</Eyebrow>
        <View style={styles.chips}>
          {['Cramps', 'Headache', 'Bloating', 'Tenderness'].map((item) => (
            <Chip
              key={item}
              label={item}
              selected={form.physicalSymptoms?.includes(item)}
              onPress={() => {
                setForm((current) => ({
                  ...current,
                  physicalSymptoms: toggle(current.physicalSymptoms, item),
                }));
                setSaved(false);
              }}
            />
          ))}
        </View>
        <Eyebrow>Emotional symptoms</Eyebrow>
        <View style={styles.chips}>
          {['Sensitive', 'Irritable', 'Anxious', 'Calm'].map((item) => (
            <Chip
              key={item}
              label={item}
              selected={form.emotionalSymptoms?.includes(item)}
              onPress={() => {
                setForm((current) => ({
                  ...current,
                  emotionalSymptoms: toggle(current.emotionalSymptoms, item),
                }));
                setSaved(false);
              }}
            />
          ))}
        </View>
      </Card>

      <Card>
        <Eyebrow>Notes</Eyebrow>
        <TextInput
          accessibilityLabel="Private notes"
          multiline
          placeholder="Anything you want to remember"
          placeholderTextColor={color.inkFaint}
          value={form.notes ?? ''}
          onChangeText={(notes) => {
            setForm((current) => ({ ...current, notes }));
            setSaved(false);
          }}
          style={styles.notes}
        />
        {saved ? (
          <Faint>Saved privately for this day.</Faint>
        ) : (
          <Btn label="Save privately" block onPress={save} />
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { gap: space.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  notes: {
    minHeight: 96,
    padding: space.md,
    borderWidth: 1,
    borderColor: color.lineStrong,
    borderRadius: radius.soft,
    color: color.ink,
    fontSize: font.size.body,
    textAlignVertical: 'top',
  },
});
