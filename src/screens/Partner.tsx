import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DayPill } from '../components/DayPill';
import {
  Btn,
  Card,
  Eyebrow,
  Faint,
  Guidance,
  Muted,
  Row,
  ScreenTitle,
} from '../components/ui';
import { PRIVACY_NOTE, ROLE_NAMES } from '../content';
import { useCyncd } from '../state';
import { color, font, radius, space, tap } from '../theme/tokens';

const APPROACH_LABEL = {
  space: 'Give a little space',
  reassurance: 'Short reassurance',
  conversation: 'Open a conversation',
} as const;

/**
 * Partner tab.
 *
 * The partner gets the guidance itself: how to show up today, the suggested
 * approach and concrete things he could actually do. The primary user gets the
 * same guidance framed as "What <partner> sees", which is the shared-
 * understanding view — she can check what he is being told, and nothing is
 * hidden from her.
 *
 * What renders comes from `derived.partnerTabState`, not from raw flags, so the
 * invite / paused / guidance cases cannot drift apart between roles.
 */
export function Partner() {
  const { state, actions, derived } = useCyncd();
  const { today, partnerFacing, partnerTabState, sharingPausedNotice } =
    derived;
  const viewingAsPartner = state.demo.role === 'darnell';

  if (partnerTabState === 'invite') {
    return (
      <View style={styles.screen}>
        <ScreenTitle>No partner yet</ScreenTitle>
        <Muted>
          cyncd works on its own, but the shared guidance only appears once your
          partner joins.
        </Muted>
        <Card>
          <Muted>
            They answer four quick questions. They never see your answers — only
            the guidance for the day.
          </Muted>
          <Btn
            label="Invite your partner"
            block
            onPress={actions.simulatePartnerJoin}
          />
        </Card>
      </View>
    );
  }

  if (partnerTabState === 'paused') {
    return (
      <View style={styles.screen}>
        <ScreenTitle>Sharing is paused</ScreenTitle>
        <Card>
          <Muted>
            {ROLE_NAMES.shanice} has paused sharing for now. You will see the
            day&rsquo;s guidance again when she turns it back on.
          </Muted>
        </Card>
        <Faint>Nothing is wrong — this is a normal thing to do.</Faint>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Card>
        <Row>
          <Eyebrow>
            {viewingAsPartner
              ? 'Today, for you'
              : `What ${ROLE_NAMES.darnell} sees`}
          </Eyebrow>
          <DayPill dayType={today.dayType} label={today.label} />
        </Row>

        <Guidance>{partnerFacing.guidance}</Guidance>
        <View style={styles.approach}>
          <Text style={styles.approachLabel}>
            {APPROACH_LABEL[partnerFacing.approach]}
          </Text>
        </View>
      </Card>

      <Card variant="flat">
        <Eyebrow>
          {viewingAsPartner
            ? 'What might help today'
            : `What ${ROLE_NAMES.darnell} is being suggested`}
        </Eyebrow>
        <View style={styles.actions}>
          {partnerFacing.actions.map((action) => (
            <View key={action} style={styles.action}>
              <View style={styles.bullet} />
              <Text style={styles.actionText}>{action}</Text>
            </View>
          ))}
        </View>
      </Card>

      <View style={styles.privacy}>
        <Muted>{PRIVACY_NOTE}</Muted>

        {viewingAsPartner ? null : (
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: state.sharing.paused }}
            accessibilityLabel="Pause sharing"
            onPress={actions.togglePauseSharing}
            style={styles.switch}
          >
            <Text style={styles.switchLabel}>Pause sharing</Text>
            <View
              style={[styles.track, state.sharing.paused && styles.trackOn]}
            >
              <View
                style={[styles.thumb, state.sharing.paused && styles.thumbOn]}
              />
            </View>
          </Pressable>
        )}

        {sharingPausedNotice ? (
          <Faint>
            Sharing is paused. {ROLE_NAMES.darnell} sees a paused notice instead
            of today&rsquo;s guidance — plans you already sent him stay where
            they are.
          </Faint>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: space.lg,
  },
  approach: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    backgroundColor: color.surfaceWarm,
  },
  approachLabel: {
    fontSize: font.size.caption,
    fontWeight: font.weight.bold,
    letterSpacing: 0.3,
    color: color.sageDeep,
  },
  actions: {
    gap: space.md,
  },
  action: {
    flexDirection: 'row',
    gap: space.md,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    backgroundColor: color.sage,
  },
  actionText: {
    flex: 1,
    fontSize: font.size.small,
    lineHeight: 22,
    color: color.ink,
  },
  privacy: {
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.soft,
    borderWidth: 1,
    borderColor: color.line,
  },
  switch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: tap,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: font.weight.semibold,
    color: color.ink,
  },
  track: {
    width: 46,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: color.lineStrong,
    padding: 3,
    justifyContent: 'center',
  },
  trackOn: {
    backgroundColor: color.sageDeep,
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: color.surface,
  },
  thumbOn: {
    alignSelf: 'flex-end',
  },
});
