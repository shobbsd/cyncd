import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { BrandMark } from '../components/BrandMark';
import { Btn, Muted, ScreenTitle } from '../components/ui';
import { ROLE_NAMES } from '../content';
import { useCyncd } from '../state';
import { color, radius, space } from '../theme/tokens';

/** Matches the fill animation below. */
const LEARNING_MS = 2400;
const PAIRED_MS = 1800;

/**
 * "Learning your patterns…" — the beat between finishing onboarding and the
 * first guidance. The spec wants a first prediction inside a minute, so this is
 * short on purpose: long enough to feel like something happened, not long
 * enough to be waiting.
 *
 * `advanceFlow()` is safe to call more than once — it is a no-op on any flow
 * that is not transient — so the timer racing a fast tap does no harm.
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

/** "You're cyncd" — the confirmation after the partner joins. */
export function CyncdConfirm() {
  const { actions } = useCyncd();

  useEffect(() => {
    const timer = setTimeout(actions.advanceFlow, PAIRED_MS);
    return () => clearTimeout(timer);
  }, [actions]);

  return (
    <View style={styles.transition}>
      <BrandMark size={64} />
      <ScreenTitle>You&rsquo;re cyncd</ScreenTitle>
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
