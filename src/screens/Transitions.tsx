import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { BrandMark } from '../components/BrandMark';
import { FadeIn } from '../components/FadeIn';
import { Btn, Faint, Muted, ScreenTitle } from '../components/ui';
import { ROLE_NAMES, TRIAL } from '../content';
import { useCyncd } from '../state';
import { color, font, radius, space } from '../theme/tokens';

/** Matches the fill animation below. */
const LEARNING_MS = 2400;
const PAIRED_MS = 1800;

/**
 * "Learning your patterns…" — the beat between finishing onboarding and the
 * first guidance. The spec wants a first prediction inside a minute, so this is
 * short on purpose: long enough to feel like something happened, not long
 * enough to be waiting.
 *
 * Only the timer advances it, and the timer is cleared on unmount, so it
 * cannot fire a second `advanceFlow()` and skip straight past the trial screen.
 */
export function Learning() {
  const { actions } = useCyncd();
  const fill = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(actions.advanceFlow, LEARNING_MS);
    return () => clearTimeout(timer);
  }, [actions]);

  useEffect(() => {
    // `useNativeDriver` is false because width is a layout property, which the
    // native driver cannot animate off the JS thread.
    Animated.timing(fill, {
      toValue: 1,
      duration: LEARNING_MS,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [fill]);

  const width = fill.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.transition}>
      <BrandMark size={64} />
      <ScreenTitle>Learning your patterns…</ScreenTitle>
      <Muted>This only takes a moment.</Muted>
      <View style={styles.bar}>
        <Animated.View style={[styles.fill, { width }]} />
      </View>
    </View>
  );
}

/**
 * Free access, before anything that looks like a paywall.
 *
 * Someone has just told Cyncd personal things; the first thing back should not
 * be a price. Thirty days is long enough for predictions to become personal
 * and for the couple to build history, so by the time payment comes up the
 * product is no longer theoretical.
 */
export function Trial() {
  const { actions } = useCyncd();

  return (
    <View style={styles.transition}>
      <BrandMark size={64} />
      <FadeIn style={styles.trial}>
        <Text style={styles.trialTitle}>{TRIAL.title}</Text>
        {TRIAL.lines.map((line) => (
          <Muted key={line} style={styles.centered}>
            {line}
          </Muted>
        ))}
        <Faint style={styles.centered}>{TRIAL.note}</Faint>
      </FadeIn>
      <Btn label={TRIAL.cta} block onPress={actions.advanceFlow} />
    </View>
  );
}

/** The confirmation after the partner joins and the two profiles meet. */
export function CyncdConfirm() {
  const { actions } = useCyncd();

  useEffect(() => {
    const timer = setTimeout(actions.advanceFlow, PAIRED_MS);
    return () => clearTimeout(timer);
  }, [actions]);

  return (
    <View style={styles.transition}>
      <BrandMark size={64} />
      <ScreenTitle>You&rsquo;re both Cyncd</ScreenTitle>
      <Muted style={styles.centered}>
        You and {ROLE_NAMES.darnell} will see the same day, framed for each of
        you. Private things stay private.
      </Muted>
      <Btn label="Continue" onPress={actions.advanceFlow} />
    </View>
  );
}

const styles = StyleSheet.create({
  transition: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.lg,
    padding: space.xl,
  },
  centered: {
    textAlign: 'center',
  },
  trial: {
    alignItems: 'center',
    gap: space.sm,
    marginBottom: space.lg,
  },
  trialTitle: {
    fontSize: font.size.display,
    lineHeight: 36,
    fontWeight: font.weight.bold,
    letterSpacing: -0.4,
    color: color.ink,
    textAlign: 'center',
    marginBottom: space.sm,
  },
  bar: {
    alignSelf: 'stretch',
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: color.surfaceWarm,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: color.sage,
  },
});
