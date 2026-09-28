import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { color, font, space } from '../theme/tokens';
import { MarkHalf } from './BrandMark';

const HOLD_MS = 1800;
const MARK = 112;
/** How far apart the two halves start. */
const GAP = 22;

/** Pulses that build as the mark completes: light, light, medium, heavy. */
const PULSES: { at: number; style: Haptics.ImpactFeedbackStyle }[] = [
  { at: 0, style: Haptics.ImpactFeedbackStyle.Light },
  { at: 0.3, style: Haptics.ImpactFeedbackStyle.Light },
  { at: 0.55, style: Haptics.ImpactFeedbackStyle.Medium },
  { at: 0.8, style: Haptics.ImpactFeedbackStyle.Heavy },
];

/**
 * Hold to Cync: the two halves of the mark come together while it is held.
 *
 * Letting go early eases the halves back apart — nothing is committed until
 * the mark is whole. Screen-reader users get the same outcome from a single
 * activate action, since a timed hold is not something VoiceOver can perform.
 *
 * Haptics are fire-and-forget: a device without a Taptic Engine rejects the
 * call, and the moment should still complete.
 */
export function HoldToCync({
  label,
  doneLabel,
  onDone,
}: {
  label: string;
  doneLabel: string;
  onDone: () => void;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [done, setDone] = useState(false);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(onDone, 1400);
    return () => clearTimeout(timer);
  }, [done, onDone]);

  const complete = () => {
    clearTimers();
    progress.setValue(1);
    setDone(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  const start = () => {
    if (done) return;
    clearTimers();
    // `stopAnimation` reports where the halves actually are, so a second hold
    // after an early release picks up from there instead of restarting.
    progress.stopAnimation((from) => {
      timers.current = PULSES.filter((pulse) => pulse.at >= from).map((pulse) =>
        setTimeout(
          () => Haptics.impactAsync(pulse.style).catch(() => {}),
          (pulse.at - from) * HOLD_MS,
        ),
      );
      Animated.timing(progress, {
        toValue: 1,
        duration: (1 - from) * HOLD_MS,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) complete();
      });
    });
  };

  const release = () => {
    if (done) return;
    clearTimers();
    progress.stopAnimation(() => {
      Animated.timing(progress, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    });
  };

  const half = (direction: -1 | 1) => ({
    opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }),
    transform: [
      {
        translateX: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [direction * GAP, 0],
        }),
      },
    ],
  });

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint="Press and hold until the two halves meet."
        accessibilityActions={[{ name: 'activate' }]}
        onAccessibilityAction={complete}
        onPressIn={start}
        onPressOut={release}
        disabled={done}
        style={styles.target}
      >
        <Animated.View
          style={[
            styles.halo,
            {
              opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
              transform: [
                { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] }) },
              ],
            },
          ]}
        />
        <Animated.View style={[styles.layer, half(-1)]}>
          <MarkHalf side="left" size={MARK} />
        </Animated.View>
        <Animated.View style={[styles.layer, half(1)]}>
          <MarkHalf side="right" size={MARK} />
        </Animated.View>
      </Pressable>
      <Text style={[styles.label, done && styles.done]}>
        {done ? `✓ ${doneLabel}` : label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: space.lg,
  },
  target: {
    width: MARK + GAP * 2 + space.xl,
    height: MARK + space.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: MARK + space.xxl,
    height: MARK + space.xxl,
    borderRadius: (MARK + space.xxl) / 2,
    backgroundColor: color.surfaceWarm,
  },
  layer: {
    position: 'absolute',
  },
  label: {
    fontSize: font.size.heading,
    fontWeight: font.weight.semibold,
    color: color.inkSoft,
  },
  done: {
    color: color.forest,
  },
});
