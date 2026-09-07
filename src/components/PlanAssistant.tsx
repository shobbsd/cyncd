import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { answerPlanQuestion, type PlanAssistantContext } from '../content';
import { color, font, radius, space } from '../theme/tokens';
import { Btn, Faint } from './ui';

export function PlanAssistant({ context }: { context: PlanAssistantContext }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  return (
    <View style={styles.wrap}>
      <TextInput
        accessibilityLabel="Ask cyncd about your plans"
        placeholder="Ask cyncd about your plans…"
        placeholderTextColor={color.inkFaint}
        value={question}
        onChangeText={(value) => {
          setQuestion(value);
          setAnswer(null);
        }}
        style={styles.input}
      />
      <Btn
        label="Ask"
        variant="secondary"
        block
        disabled={!question.trim()}
        onPress={() => setAnswer(answerPlanQuestion(question, context))}
      />
      {answer === null ? null : <Faint>{answer}</Faint>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  input: { minHeight: 48, paddingHorizontal: space.md, borderWidth: 1, borderColor: color.lineStrong, borderRadius: radius.soft, fontSize: font.size.body, color: color.ink },
});
