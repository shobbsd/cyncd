import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ScoreHistoryEntry, ScoreResult } from '../content';
import { color, font, radius, space } from '../theme/tokens';
import { Btn, Card, Eyebrow, Faint, Guidance, Muted } from './ui';

export function ScoreCard({
  score,
  compact = false,
  history = [],
  actionCompleted = false,
  onOpen,
  onComplete,
}: {
  score: ScoreResult;
  compact?: boolean;
  history?: ScoreHistoryEntry[];
  actionCompleted?: boolean;
  onOpen?: () => void;
  onComplete?: () => void;
}) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <Card variant={compact ? 'warm' : 'raised'}>
      <View style={styles.header}>
        <Eyebrow>cyncd Score</Eyebrow>
        <Text style={styles.percentage}>{score.percentage}%</Text>
      </View>
      <Text style={styles.label}>{score.label}</Text>
      <Guidance>{score.line}</Guidance>
      <Faint>{score.confidence}</Faint>

      {compact ? (
        <Btn
          label="View cyncd Score"
          variant="secondary"
          block
          onPress={onOpen!}
        />
      ) : (
        <>
          <Muted>{score.action}</Muted>
          <Btn
            label={
              actionCompleted
                ? 'Today’s action is complete'
                : 'Mark today’s action complete'
            }
            variant={actionCompleted ? 'secondary' : 'primary'}
            block
            disabled={actionCompleted}
            onPress={onComplete!}
          />
          <Btn
            label={showDetail ? 'Hide how this works' : 'How this works'}
            variant="ghost"
            block
            onPress={() => setShowDetail((visible) => !visible)}
          />
          {showDetail ? (
            <Faint>
              Communication alignment 40% · energy and capacity 30% · shared
              action 20% · recent feedback 10%.
            </Faint>
          ) : null}
          <View style={styles.history}>
            <Eyebrow>Recent score history</Eyebrow>
            <View style={styles.historyValues}>
              {history.map((entry) => (
                <View key={entry.date} style={styles.historyValue}>
                  <Text style={styles.historyNumber}>{entry.percentage}%</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  percentage: {
    fontSize: 30,
    fontWeight: font.weight.bold,
    color: color.sageDeep,
  },
  label: {
    fontSize: font.size.heading,
    fontWeight: font.weight.bold,
    color: color.ink,
  },
  history: { gap: space.sm, marginTop: space.sm },
  historyValues: { flexDirection: 'row', gap: space.xs },
  historyValue: {
    flex: 1,
    paddingVertical: space.sm,
    borderRadius: radius.soft,
    alignItems: 'center',
    backgroundColor: color.surfaceWarm,
  },
  historyNumber: {
    fontSize: font.size.caption,
    fontWeight: font.weight.bold,
    color: color.inkSoft,
  },
});
