import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandLockup } from '../components/BrandMark';
import { CoachSheet } from '../components/CoachSheet';
import { DemoBar } from '../components/DemoBar';
import { NotificationBanner } from '../components/NotificationBanner';
import { TabBar } from '../components/TabBar';
import {
  COACH_CHIPS,
  ONBOARDING_QUESTIONS,
  PARTNER_QUESTIONS,
  ROLE_NAMES,
  type TabId,
  tabForRole,
} from '../content';
import { Invite } from '../screens/Invite';
import { Forecast } from '../screens/Forecast';
import { Partner } from '../screens/Partner';
import { Plan } from '../screens/Plan';
import { QuestionFlow } from '../screens/QuestionFlow';
import { Reflect } from '../screens/Reflect';
import { Signup, Splash } from '../screens/Splash';
import { Today } from '../screens/Today';
import { Welcome } from '../screens/Welcome';
import { CyncdConfirm, Learning } from '../screens/Transitions';
import { useCyncd } from '../state';
import { color, font, space } from '../theme/tokens';

/**
 * The whole app. Routing is state — four tabs and a linear onboarding flow do
 * not need a router, and it keeps the notification deep-links to a single
 * `setTab` call.
 *
 * Which screen shows comes from `state.flow`, which is persisted, so a relaunch
 * mid-onboarding resumes where it was rather than dropping back to the splash.
 */
export default function App() {
  const { state, actions, coach, hydrated } = useCyncd();
  const [tab, setTab] = useState<TabId>('today');
  const [welcomed, setWelcomed] = useState(false);

  // Reset picks the app up at the splash; the tab should not survive it.
  useEffect(() => {
    if (state.flow !== 'app') {
      setTab('today');
      setWelcomed(false);
    }
  }, [state.flow]);

  useEffect(() => {
    if (tabForRole(state.demo.role, tab) === null) setTab('today');
  }, [state.demo.role, tab]);

  const openNotification = () => {
    const target = actions.openNotification();
    if (target !== null && tabForRole(state.demo.role, target) !== null) setTab(target);
  };

  const coachChip = COACH_CHIPS.find((chip) => chip.id === coach.chip);
  if (coach.chip !== null && coachChip === undefined) {
    // A chip id with no chip behind it is a bug; titling the sheet "AI Coach"
    // and carrying on would hide it.
    console.error(`cyncd: no coach chip matches id "${coach.chip}"`);
  }

  // Storage is async on native, so for the first tick `state` is a placeholder
  // rather than what the user left behind. Rendering it would flash the splash
  // at someone who is six days into the demo, so hold on the empty frame — it
  // is one tick, and the alternative is a visible wrong answer.
  if (!hydrated) return <View style={styles.frame} />;

  return (
    <SafeAreaView style={styles.frame} edges={['top']}>
      {state.flow === 'app' && !welcomed ? (
        <Welcome onContinue={() => setWelcomed(true)} />
      ) : state.flow === 'app' ? (
        <>
          <View style={styles.appbar}>
            <BrandLockup />
            <View style={styles.appbarControls}>
              <Text style={styles.who}>
                Viewing as {ROLE_NAMES[state.demo.role]}
              </Text>
              <DemoBar
                role={state.demo.role}
                date={state.demo.simulatedDate ?? '2026-08-25'}
                onRole={actions.setRole}
                onStep={actions.stepDay}
                onReset={actions.resetDemo}
              />
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scroll}>
            {state.notification === null ? null : (
              <NotificationBanner
                // Remount on a new banner so it reads as a new arrival rather
                // than the text swapping silently inside one already on screen.
                key={`${state.notification.id}-${state.demo.currentDay}`}
                notification={state.notification}
                onOpen={openNotification}
                onDismiss={actions.dismissNotification}
              />
            )}

            {tab === 'today' ? (
              <Today onOpenCoach={coach.open} onOpenScore={() => setTab('partner')} />
            ) : null}
            {tab === 'forecast' && state.demo.role === 'shanice' ? <Forecast /> : null}
            {tab === 'partner' ? <Partner /> : null}
            {tab === 'plan' ? <Plan /> : null}
            {tab === 'reflect' ? <Reflect /> : null}
          </ScrollView>

          <TabBar active={tab} role={state.demo.role} onValueChange={setTab} />
        </>
      ) : (
        <ScrollView contentContainerStyle={styles.flowScroll}>
          {state.flow === 'splash' ? <Splash /> : null}
          {state.flow === 'signup' ? <Signup /> : null}
          {state.flow === 'onboarding' ? (
            <QuestionFlow
              questions={ONBOARDING_QUESTIONS}
              onAnswer={actions.answerOnboarding}
              onSkip={actions.skipOnboarding}
              onFinish={actions.finishOnboarding}
            />
          ) : null}
          {state.flow === 'learning' ? <Learning /> : null}
          {state.flow === 'invite' ? <Invite /> : null}
          {state.flow === 'partnerOnboarding' ? (
            <QuestionFlow
              questions={PARTNER_QUESTIONS}
              onAnswer={actions.answerPartnerOnboarding}
              onSkip={() => {}}
              onFinish={actions.completePartnerOnboarding}
            />
          ) : null}
          {state.flow === 'paired' ? <CyncdConfirm /> : null}
        </ScrollView>
      )}

      {coach.node === null ? null : (
        <CoachSheet
          node={coach.node}
          title={coachChip?.label ?? 'AI Coach'}
          onAdvance={coach.advance}
          onChoose={coach.choose}
          onSave={coach.save}
          onSend={coach.send}
          onClose={coach.close}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    backgroundColor: color.bg,
  },
  appbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderBottomWidth: 1,
    borderBottomColor: color.line,
    zIndex: 20,
  },
  appbarControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  who: {
    fontSize: font.size.caption,
    fontWeight: font.weight.semibold,
    color: color.inkFaint,
  },
  scroll: {
    padding: space.lg,
    gap: space.lg,
  },
  flowScroll: {
    flexGrow: 1,
  },
});
