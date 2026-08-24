import { ScrollView, StyleSheet, View } from 'react-native';
import { DayPill } from '../components/DayPill';
import { WeekStrip } from '../components/WeekStrip';
import { WhyDisclosure } from '../components/WhyDisclosure';
import {
  Card,
  Empty,
  Eyebrow,
  Guidance,
  Muted,
  Row,
  Chip,
} from '../components/ui';
import { ROLE_NAMES, type ChipId } from '../content';
import { useCyncd } from '../state';
import { space } from '../theme/tokens';

/**
 * Home tab. One guidance sentence, one colour, one reason — no data anywhere.
 *
 * Both roles read the same sentence and the same pill, because the day type is
 * the shared understanding the product is built on. Only the framing above it
 * changes, so the partner is never shown her day as though it were his own.
 */
export function Today({
  onOpenCoach,
}: {
  onOpenCoach: (chip: ChipId) => void;
}) {
  const { state, actions, derived, coach } = useCyncd();
  const { today, weekStrip, starterNote } = derived;
  const viewingAsPartner = state.demo.role === 'darnell';

  return (
    <View style={styles.screen}>
      <Card>
        <Row>
          <Eyebrow>
            {viewingAsPartner ? `${ROLE_NAMES.shanice}'s day` : 'Today'}
          </Eyebrow>
          <DayPill dayType={today.dayType} label={today.label} />
        </Row>

        <Guidance>{today.todayGuidance}</Guidance>
        <Muted>{today.reassurance}</Muted>

        <WhyDisclosure why={today.why} />
      </Card>

      {starterNote === null ? null : <Empty>{starterNote}</Empty>}

      <View style={styles.section}>
        <Eyebrow>Ask the coach</Eyebrow>
        {/* Horizontal rather than wrapped: the chip set is short and the row
            reads as a set of prompts, not a form. */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {coach.chips.map((chip) => (
            <Chip
              key={chip.id}
              label={chip.label}
              onPress={() => onOpenCoach(chip.id)}
            />
          ))}
        </ScrollView>
      </View>

      <WeekStrip
        week={weekStrip}
        currentDay={state.demo.currentDay}
        onSelect={actions.setDay}
      />
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
  chipRow: {
    gap: space.sm,
    paddingRight: space.lg,
  },
});
