import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { SharedItem } from '../content';
import { color, font, radius, space } from '../theme/tokens';
import { Btn, Faint } from './ui';

export function SharedItemCard({
  item,
  editable = false,
  onUpdate,
  onRevoke,
}: {
  item: SharedItem;
  editable?: boolean;
  onUpdate?: (body: string) => void;
  onRevoke?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(item.body);
  return (
    <View style={styles.card}>
      <Faint>{item.kind}</Faint>
      {editing ? (
        <TextInput value={body} onChangeText={setBody} style={styles.input} multiline />
      ) : (
        <Text style={styles.body}>{item.body}</Text>
      )}
      <Faint>Shared {item.updatedAt}</Faint>
      {editable ? (
        <View style={styles.actions}>
          {editing ? (
            <Btn
              label="Save edit"
              variant="secondary"
              onPress={() => {
                const trimmed = body.trim();
                if (trimmed) onUpdate?.(trimmed);
                setEditing(false);
              }}
            />
          ) : (
            <Btn label="Edit" variant="ghost" onPress={() => setEditing(true)} />
          )}
          <Btn label="Revoke" variant="ghost" onPress={() => onRevoke?.()} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.sm, padding: space.md, borderRadius: radius.soft, backgroundColor: color.surfaceWarm },
  body: { fontSize: font.size.small, lineHeight: 21, color: color.ink },
  input: { minHeight: 56, padding: space.sm, borderWidth: 1, borderColor: color.lineStrong, borderRadius: radius.soft, color: color.ink, textAlignVertical: 'top' },
  actions: { flexDirection: 'row', gap: space.sm },
});
