import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import type { SharedItem } from '../content';
import { color, font, radius, space } from '../theme/tokens';
import { Btn, Chip, Eyebrow, Faint } from './ui';

export function SharedItemComposer({
  onShare,
}: {
  onShare: (input: Pick<SharedItem, 'kind' | 'body'>) => void;
}) {
  const [kind, setKind] = useState<SharedItem['kind']>('note');
  const [body, setBody] = useState('');
  const [shared, setShared] = useState(false);
  const submit = () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    onShare({ kind, body: trimmed });
    setBody('');
    setShared(true);
  };

  return (
    <View style={styles.composer}>
      <Eyebrow>Share something intentional</Eyebrow>
      <View style={styles.kinds}>
        {(['note', 'need', 'insight'] as const).map((value) => (
          <Chip
            key={value}
            label={value}
            selected={kind === value}
            onPress={() => {
              setKind(value);
              setShared(false);
            }}
          />
        ))}
      </View>
      <TextInput
        accessibilityLabel="Shared note"
        multiline
        placeholder={
          kind === 'need'
            ? 'What would help today?'
            : 'A short note for your partner'
        }
        placeholderTextColor={color.inkFaint}
        value={body}
        onChangeText={(value) => {
          setBody(value);
          setShared(false);
        }}
        style={styles.input}
      />
      {kind === 'insight' ? (
        <Faint>Share only a general sentence, never private cycle details.</Faint>
      ) : null}
      {shared ? (
        <Faint>Shared. You can edit or revoke it below.</Faint>
      ) : (
        <Btn label="Share with partner" block disabled={!body.trim()} onPress={submit} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  composer: { gap: space.md },
  kinds: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  input: {
    minHeight: 88,
    padding: space.md,
    borderWidth: 1,
    borderColor: color.lineStrong,
    borderRadius: radius.soft,
    color: color.ink,
    fontSize: font.size.body,
    textAlignVertical: 'top',
  },
});
