import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DayPill } from '../components/DayPill';
import { ScoreCard } from '../components/ScoreCard';
import { SharedItemCard } from '../components/SharedItemCard';
import { SharedItemComposer } from '../components/SharedItemComposer';
import { ShareScoreCard } from '../components/ShareScoreCard';
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
import { toShareCardInput } from '../services/scoreShare';
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
  const {
    guidance,
    partnerTabState,
    sharingPausedNotice,
    score,
    scoreHistory,
    sharedByMe,
    sharedWithMe,
    simulatedDate,
  } = derived;
  const viewingAsPartner = state.demo.role === 'darnell';
  const actionCompleted = state.scoreActionCompletions.some(
    (completion) => completion.date === simulatedDate,
  );

  return (
    <View style={styles.screen}>
      <ScoreCard
        score={score}
        history={scoreHistory}
        actionCompleted={actionCompleted}
        onComplete={() => actions.completeScoreAction(simulatedDate)}
      />
      <ShareScoreCard
        input={toShareCardInput({
          percentage: score.percentage,
          label: score.label,
          line: score.line,
          action: score.action,
        })}
      />

      {partnerTabState === 'invite' ? (
        <>
          <ScreenTitle>No partner yet</ScreenTitle>
          <Muted>
            cyncd works on its own, but the shared guidance only appears once
            your partner joins.
          </Muted>
          <Card>
            <Muted>
              They answer five quick questions. They never see your answers —
              only the guidance for the day.
            </Muted>
            <Btn
              label="Invite your partner"
              block
              onPress={actions.simulatePartnerJoin}
            />
          </Card>
        </>
      ) : partnerTabState === 'paused' ? (
        <>
          <ScreenTitle>Sharing is paused</ScreenTitle>
          <Card>
            <Muted>
              {ROLE_NAMES.shanice} has paused sharing for now. You will see the
              day&rsquo;s guidance again when she turns it back on.
            </Muted>
          </Card>
          <Faint>Nothing is wrong — this is a normal thing to do.</Faint>
        </>
      ) : (
        <>
          <Card>
            <Row>
              <Eyebrow>
                {viewingAsPartner
                  ? 'Today, for you'
                  : `What ${ROLE_NAMES.darnell} sees`}
              </Eyebrow>
              <DayPill dayType={guidance.dayType} label={guidance.label} />
            </Row>

            <Guidance>{guidance.partnerGuidance}</Guidance>
            <View style={styles.approach}>
              <Text style={styles.approachLabel}>
                {APPROACH_LABEL[guidance.approach]}
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
              {guidance.actions.map((action) => (
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
                    style={[
                      styles.thumb,
                      state.sharing.paused && styles.thumbOn,
                    ]}
                  />
                </View>
              </Pressable>
            )}

            {sharingPausedNotice ? (
              <Faint>
                Sharing is paused. {ROLE_NAMES.darnell} sees a paused notice
                instead of today&rsquo;s guidance — plans you already sent him stay
                where they are.
              </Faint>
            ) : null}
          </View>

          <Card>
            <Eyebrow>Shared with me</Eyebrow>
            {sharedWithMe.length === 0 ? (
              <Faint>No intentional notes yet.</Faint>
            ) : (
              <View style={styles.sharedItems}>
                {sharedWithMe.map((item) => (
                  <SharedItemCard key={item.id} item={item} />
                ))}
              </View>
            )}
          </Card>

          <Card>
            <SharedItemComposer
              onShare={({ kind, body }) =>
                actions.createSharedItem({
                  kind,
                  body,
                  date: simulatedDate,
                })
              }
            />
            <Eyebrow>Shared by me</Eyebrow>
            {sharedByMe.length === 0 ? (
              <Faint>Nothing shared by you yet.</Faint>
            ) : (
              <View style={styles.sharedItems}>
                {sharedByMe.map((item) => (
                  <SharedItemCard
                    key={item.id}
                    item={item}
                    editable
                    onUpdate={(body) =>
                      actions.updateSharedItem(item.id, body, simulatedDate)
                    }
                    onRevoke={() => actions.revokeSharedItem(item.id, simulatedDate)}
                  />
                ))}
              </View>
            )}
          </Card>
        </>
      )}
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
  sharedItems: { gap: space.sm },
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
