import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DayPill } from '../components/DayPill';
import {
  Btn,
  Card,
  Empty,
  Eyebrow,
  Faint,
  Muted,
  Row,
  ScreenTitle,
} from '../components/ui';
import { useCyncd } from '../state';
import { color, font, radius, space, tap } from '../theme/tokens';

/**
 * Plan Together. Suggestions matched to the day, a best-evening line drawn from
 * the week, and the shared list both roles can see.
 *
 * Save and Send are distinct: Save keeps it, Send marks it shared. Both roles
 * read the same list, and a plan that was explicitly sent stays visible even
 * while sharing is paused — pausing gates guidance, not something already
 * handed over.
 */
export function Plan() {
  const { state, actions, derived } = useCyncd();
  const { today, planSuggestions, bestEvening, sharedPlans } = derived;
  const [justDid, setJustDid] = useState<string | null>(null);

  const flash = (id: string) => {
    setJustDid(id);
    setTimeout(
      () => setJustDid((current) => (current === id ? null : current)),
      1600,
    );
  };

  return (
    <View style={styles.screen}>
      <Row>
        <ScreenTitle>Plan together</ScreenTitle>
        <DayPill dayType={today.dayType} label={today.label} />
      </Row>

      <Card variant="warm">
        <Eyebrow>Best evening this week</Eyebrow>
        <Text style={styles.bestEvening}>{bestEvening}</Text>
      </Card>

      {planSuggestions.map((suggestion) => (
        <Card key={suggestion.id}>
          <Text style={styles.planTitle}>{suggestion.title}</Text>
          <Muted>{suggestion.detail}</Muted>

          {justDid === suggestion.id ? (
            <Faint>Added to your shared plans.</Faint>
          ) : (
            <View style={styles.planActions}>
              <Btn
                label="Save"
                variant="secondary"
                onPress={() => {
                  actions.savePlan({
                    day: state.demo.currentDay,
                    text: suggestion.title,
                  });
                  flash(suggestion.id);
                }}
              />
              <Btn
                label="Send to partner"
                onPress={() => {
                  actions.savePlan({
                    day: state.demo.currentDay,
                    text: suggestion.title,
                    share: true,
                  });
                  flash(suggestion.id);
                }}
              />
            </View>
          )}
        </Card>
      ))}

      <View style={styles.section}>
        <Eyebrow>Shared plans</Eyebrow>
        {sharedPlans.length === 0 ? (
          <Empty>
            Nothing saved yet. Anything you save or send shows up here for both
            of you.
          </Empty>
        ) : (
          <View style={styles.saved}>
            {sharedPlans.map((plan) => (
              <View key={plan.id} style={styles.savedItem}>
                <View style={styles.savedBody}>
                  <Text style={styles.savedText}>{plan.text}</Text>
                  <Faint>Day {plan.day}</Faint>
                </View>
                {plan.shared ? (
                  <View style={[styles.tag, styles.tagShared]}>
                    <Text style={styles.tagLabelShared}>Shared</Text>
                  </View>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => actions.sharePlan(plan.id)}
                    style={({ pressed }) => [
                      styles.tag,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.tagLabel}>Send</Text>
                  </Pressable>
                )}
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
  bestEvening: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: font.weight.semibold,
    color: color.ink,
  },
  planTitle: {
    fontSize: 17,
    fontWeight: font.weight.bold,
    color: color.ink,
  },
  planActions: {
    flexDirection: 'row',
    gap: space.sm,
  },
  saved: {
    gap: space.sm,
  },
  savedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.soft,
    borderWidth: 1,
    borderColor: color.line,
    backgroundColor: color.surface,
  },
  savedBody: {
    flex: 1,
    gap: 2,
  },
  savedText: {
    fontSize: 15,
    lineHeight: 22,
    color: color.ink,
  },
  tag: {
    minHeight: tap,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: color.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagShared: {
    borderColor: 'transparent',
    backgroundColor: color.surfaceWarm,
  },
  tagLabel: {
    fontSize: font.size.caption,
    fontWeight: font.weight.bold,
    color: color.ink,
  },
  tagLabelShared: {
    fontSize: font.size.caption,
    fontWeight: font.weight.bold,
    color: color.inkFaint,
  },
  pressed: {
    opacity: 0.6,
  },
});
