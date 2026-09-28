import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Easing, type StyleProp, type ViewStyle } from 'react-native';

/**
 * Eases content in — a short fade with a small rise.
 *
 * Key it by whatever changed (the flow, the question id) and each new screen
 * arrives rather than swapping in place. Native driver throughout: opacity and
 * transform only, so the JS thread being busy with a state write never stutters
 * it.
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 380,
  rise = 12,
  style,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  rise?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress, delay, duration]);

  return (
    <Animated.View
      style={[
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [rise, 0],
              }),
            },
          ],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
