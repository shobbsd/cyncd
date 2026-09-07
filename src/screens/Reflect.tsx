import { useState } from 'react';
import Slider from '@react-native-community/slider';
import { StyleSheet, TextInput, View } from 'react-native';
import {
  acknowledgementFor,
  interpretReflection,
  ACCURACY_LABELS,
  ACCURACY_MAX,
  ACCURACY_MIN,
} from '../content';
import { Btn, Card, Eyebrow, Faint, ScreenTitle } from '../components/ui';
import { useCyncd } from '../state';
import { color, font, radius, space } from '../theme/tokens';

/** A private, conversation-first reflection with optional score feedback. */
export function Reflect() {
  const { actions, derived, state } = useCyncd();
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<number | null>(null);
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    actions.addReflectionEntry({
      date: derived.simulatedDate,
      text: trimmed,
      signals: interpretReflection(trimmed),
    });
    setSubmitted(true);
    setText('');
  };

  const saveFeedback = () => {
    if (feedback === null) return;
    actions.addReflectionEntry({
      date: derived.simulatedDate,
      text: 'Optional cyncd Score feedback.',
      signals: [],
      scoreFeedback: feedback,
    });
    setFeedbackSaved(true);
  };

  const newest = state.reflectionEntries[0];
  return (
    <View style={styles.screen}>
      <ScreenTitle>Tell me about today.</ScreenTitle>
      <Card>
        <TextInput
          accessibilityLabel="Tell cyncd about today"
          multiline
          placeholder="What felt good, difficult, or worth remembering?"
          placeholderTextColor={color.inkFaint}
          value={text}
          onChangeText={(value) => {
            setText(value);
            setSubmitted(false);
          }}
          style={styles.input}
        />
        {submitted ? (
          <Faint>{acknowledgementFor(newest?.signals ?? [])}</Faint>
        ) : (
          <Btn label="Reflect privately" block disabled={!text.trim()} onPress={submit} />
        )}
      </Card>

      {submitted ? (
        <Card variant="flat">
          <Eyebrow>Optional: did today’s Score feel right?</Eyebrow>
          <Slider
            minimumValue={ACCURACY_MIN}
            maximumValue={ACCURACY_MAX}
            step={1}
            value={feedback ?? 3}
            accessibilityLabel="How accurate was today’s cyncd Score?"
            minimumTrackTintColor={color.sageDeep}
            maximumTrackTintColor={color.lineStrong}
            thumbTintColor={color.sageDeep}
            onValueChange={(value) => {
              setFeedback(value);
              setFeedbackSaved(false);
            }}
          />
          <View style={styles.sliderEnds}>
            <Faint>{ACCURACY_LABELS.low}</Faint>
            <Faint>{ACCURACY_LABELS.high}</Faint>
          </View>
          {feedbackSaved ? (
            <Faint>Feedback saved. It contributes only as a number.</Faint>
          ) : (
            <Btn
              label="Save Score feedback"
              variant="secondary"
              block
              disabled={feedback === null}
              onPress={saveFeedback}
            />
          )}
        </Card>
      ) : null}

      <Card variant="flat">
        <Eyebrow>Private reflections</Eyebrow>
        {state.reflectionEntries.length === 0 ? (
          <Faint>Nothing here yet. There is no pressure to reflect every day.</Faint>
        ) : (
          state.reflectionEntries.slice(0, 5).map((entry) => (
            <View key={entry.id} style={styles.entry}>
              <Faint>{entry.date}</Faint>
              <Faint>{entry.text}</Faint>
            </View>
          ))
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { gap: space.lg },
  input: {
    minHeight: 128,
    padding: space.md,
    borderWidth: 1,
    borderColor: color.lineStrong,
    borderRadius: radius.soft,
    color: color.ink,
    fontSize: font.size.body,
    textAlignVertical: 'top',
  },
  sliderEnds: { flexDirection: 'row', justifyContent: 'space-between' },
  entry: { gap: space.xs, paddingVertical: space.sm },
});
