import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { BrandMark } from '../components/BrandMark';
import { Btn, Chip } from '../components/ui';
import type { OnboardingQuestion } from '../content';
import { color, font, radius, space, tap } from '../theme/tokens';

/** `yyyy-mm-dd`, matching what the web build's `<input type="date">` produced. */
function toIsoDate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * One question per screen, tap-to-answer chips, every question skippable.
 *
 * Shared by both onboarding flows — the primary user's eight questions and the
 * partner's four. They differ only in the questions and where they hand off to,
 * which is what the props are for.
 */
export function QuestionFlow({
  questions,
  onAnswer,
  onSkip,
  onFinish,
}: {
  questions: OnboardingQuestion[];
  onAnswer: (id: string, value: string) => void;
  onSkip: (id: string) => void;
  onFinish: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [date, setDate] = useState<Date | null>(null);

  const question = questions[index];
  const last = index === questions.length - 1;

  const next = () => {
    if (last) onFinish();
    else setIndex((value) => value + 1);
  };

  const answer = (value: string) => {
    onAnswer(question.id, value);
    next();
  };

  const skip = () => {
    onSkip(question.id);
    next();
  };

  // Android has no inline date picker — it is a dialog opened imperatively.
  // iOS renders one inline, so only Android needs the explicit open button.
  const openAndroidPicker = () => {
    DateTimePickerAndroid.open({
      value: date ?? new Date(),
      mode: 'date',
      onChange: (_event, selected) => {
        if (selected !== undefined) setDate(selected);
      },
    });
  };

  return (
    <View style={styles.onboard}>
      <View style={styles.top}>
        <BrandMark size={28} />
        <View
          style={styles.dots}
          accessibilityLabel={`Question ${index + 1} of ${questions.length}`}
        >
          {questions.map((item, position) => (
            <View
              key={item.id}
              style={[styles.dot, position === index && styles.dotOn]}
            />
          ))}
        </View>
      </View>

      <Text style={styles.question}>{question.prompt}</Text>

      <View style={styles.answers}>
        {question.kind === 'date' ? (
          <>
            {Platform.OS === 'android' ? (
              <Btn
                label={date === null ? 'Choose a date' : toIsoDate(date)}
                variant="secondary"
                block
                onPress={openAndroidPicker}
              />
            ) : (
              <DateTimePicker
                value={date ?? new Date()}
                mode="date"
                display="spinner"
                onChange={(_event, selected) => {
                  if (selected !== undefined) setDate(selected);
                }}
              />
            )}
            <Btn
              label="Continue"
              block
              disabled={date === null}
              onPress={() => answer(toIsoDate(date as Date))}
            />
          </>
        ) : (
          question.options.map((option) => (
            <Chip
              key={option}
              label={option}
              onPress={() => answer(option)}
              style={styles.answer}
            />
          ))
        )}

        {/* Skip sits below the answers rather than in the top row: the demo bar
            overlays the top-right corner, and a control a presenter can miss by
            hitting Demo instead is worse than one further down the thumb's
            reach. Every question stays skippable, including this one. */}
        <Btn label="Skip" variant="ghost" block onPress={skip} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  onboard: {
    flex: 1,
    gap: space.lg,
    padding: space.xl,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: tap,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: color.lineStrong,
  },
  dotOn: {
    backgroundColor: color.sageDeep,
    width: 18,
    borderRadius: radius.pill,
  },
  question: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: font.weight.bold,
    letterSpacing: -0.3,
    color: color.ink,
  },
  answers: {
    gap: space.md,
    marginTop: space.sm,
  },
  answer: {
    alignItems: 'center',
  },
});
