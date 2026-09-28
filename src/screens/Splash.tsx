import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark, Wordmark } from '../components/BrandMark';
import { FadeIn } from '../components/FadeIn';
import { Btn, Faint, Muted } from '../components/ui';
import { INTRO, SLOGAN } from '../content';
import { useCyncd } from '../state';
import { color, font, radius, space, tap } from '../theme/tokens';

const LOGO_SIZE = 132;

/**
 * Welcome: the logo, a clockwise swirl into the CYNCD wordmark, then the
 * slogan and the actions.
 *
 * One `Animated.Value` per beat, sequenced, so nothing appears on its own — each
 * element starts moving while the one before it is still settling. With Reduce
 * Motion on, the whole thing lands in its final state instead.
 */
export function Splash() {
  const { actions } = useCyncd();
  const insets = useSafeAreaInsets();
  const logoIn = useRef(new Animated.Value(0)).current;
  const swirl = useRef(new Animated.Value(0)).current;
  const slogan = useRef(new Animated.Value(0)).current;
  const controls = useRef(new Animated.Value(0)).current;
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const values = [logoIn, swirl, slogan, controls];
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled) return;
      if (reduced) {
        values.forEach((value) => value.setValue(1));
        return;
      }
      const ease = Easing.inOut(Easing.cubic);
      Animated.sequence([
        Animated.timing(logoIn, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(450),
        Animated.timing(swirl, {
          toValue: 1,
          duration: 1300,
          easing: ease,
          useNativeDriver: true,
        }),
        Animated.stagger(350, [
          Animated.timing(slogan, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(controls, {
            toValue: 1,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });
    return () => {
      cancelled = true;
      values.forEach((value) => value.stopAnimation());
    };
  }, [logoIn, swirl, slogan, controls]);

  // The logo turns a full clockwise revolution while shrinking away; the
  // wordmark picks the same rotation up for its last quarter, so it reads as
  // one motion that the logo hands over rather than a cut between two things.
  const logoStyle = {
    opacity: Animated.multiply(
      logoIn,
      swirl.interpolate({ inputRange: [0, 0.55, 0.8], outputRange: [1, 1, 0] }),
    ),
    transform: [
      {
        scale: Animated.add(
          logoIn.interpolate({ inputRange: [0, 1], outputRange: [-0.08, 0] }),
          swirl.interpolate({ inputRange: [0, 1], outputRange: [1, 0.25] }),
        ),
      },
      { rotate: swirl.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
    ],
  };

  const wordStyle = {
    opacity: swirl.interpolate({ inputRange: [0, 0.55, 0.9], outputRange: [0, 0, 1] }),
    transform: [
      { scale: swirl.interpolate({ inputRange: [0.55, 1], outputRange: [0.55, 1], extrapolate: 'clamp' }) },
      {
        rotate: swirl.interpolate({
          inputRange: [0.55, 1],
          outputRange: ['-90deg', '0deg'],
          extrapolate: 'clamp',
        }),
      },
    ],
  };

  const riseIn = (value: Animated.Value) => ({
    opacity: value,
    transform: [
      { translateY: value.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
    ],
  });

  return (
    <View style={[styles.splash, { paddingBottom: space.xl + insets.bottom }]}>
      <View style={styles.stage}>
        <View style={styles.centre}>
          <Animated.View style={[styles.layer, logoStyle]}>
            <BrandMark size={LOGO_SIZE} />
          </Animated.View>
          <Animated.View style={wordStyle}>
            <Wordmark size={46} />
          </Animated.View>
        </View>
        <Animated.Text style={[styles.slogan, riseIn(slogan)]}>{SLOGAN}</Animated.Text>
      </View>

      <Animated.View style={[styles.actions, riseIn(controls)]}>
        <Btn
          label="Create account"
          block
          onPress={actions.startSignup}
          style={styles.create}
        />
        <View style={styles.secondary}>
          <Pressable
            accessibilityRole="button"
            hitSlop={12}
            onPress={() => setNotice('Signing in isn’t part of this demo — tap Create account.')}
          >
            <Text style={styles.login}>Login</Text>
          </Pressable>
          <Text style={styles.dot}>·</Text>
          <Pressable
            accessibilityRole="button"
            hitSlop={12}
            onPress={() => setNotice('Password reset isn’t part of this demo — tap Create account.')}
          >
            <Text style={styles.forgot}>Forgotten your password?</Text>
          </Pressable>
        </View>
        {notice === null ? null : (
          <FadeIn key={notice}>
            <Faint style={styles.notice}>{notice}</Faint>
          </FadeIn>
        )}
      </Animated.View>
    </View>
  );
}

/**
 * Why Cyncd exists, then one ask. Deliberately unvalidated — a demo that
 * rejects a typo'd address in front of an audience is worse than one that
 * accepts anything.
 */
export function Signup() {
  const { actions } = useCyncd();
  const [email, setEmail] = useState('');

  return (
    <View style={styles.onboard}>
      <View style={styles.top}>
        <BrandMark size={32} />
      </View>

      <FadeIn style={styles.intro}>
        <Text style={styles.heading}>{INTRO.title}</Text>
        <Muted>{INTRO.body}</Muted>
      </FadeIn>

      <FadeIn delay={250} style={styles.ask}>
        <Text style={styles.question}>What is your email?</Text>
        <TextInput
          style={styles.input}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Email address"
          placeholderTextColor={color.inkFaint}
          value={email}
          onChangeText={setEmail}
          onSubmitEditing={() => actions.submitSignup(email)}
          returnKeyType="next"
        />
        <Btn label="Continue" block onPress={() => actions.submitSignup(email)} />
      </FadeIn>
    </View>
  );
}

/** Where Cyncd starts to feel personal rather than like registration. */
export function NameStep() {
  const { actions } = useCyncd();
  const [name, setName] = useState('');

  return (
    <View style={styles.onboard}>
      <View style={styles.top}>
        <BrandMark size={32} />
      </View>

      <FadeIn style={styles.ask}>
        <Text style={styles.heading}>What would you like Cyncd to call you?</Text>
        <TextInput
          style={styles.input}
          autoComplete="given-name"
          textContentType="givenName"
          autoCapitalize="words"
          autoFocus
          placeholder="Name"
          placeholderTextColor={color.inkFaint}
          value={name}
          onChangeText={setName}
          onSubmitEditing={() => actions.submitName(name)}
          returnKeyType="next"
        />
        <Btn label="Continue" block onPress={() => actions.submitName(name)} />
      </FadeIn>
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    paddingHorizontal: space.xl,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  // Sized to the wordmark, not the logo: the logo overflows it while it is on
  // screen, and the slogan then sits right under the wordmark it belongs to.
  centre: {
    width: LOGO_SIZE,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layer: {
    position: 'absolute',
  },
  slogan: {
    fontFamily: font.family,
    fontSize: font.size.body,
    lineHeight: 24,
    color: color.inkSoft,
    textAlign: 'center',
  },
  actions: {
    alignItems: 'center',
    gap: space.md,
  },
  create: {
    backgroundColor: color.forest,
  },
  secondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: tap,
  },
  login: {
    fontSize: font.size.small,
    fontWeight: font.weight.semibold,
    color: color.forest,
    textDecorationLine: 'underline',
  },
  dot: {
    fontSize: font.size.small,
    color: color.inkFaint,
  },
  forgot: {
    fontSize: font.size.small,
    color: color.inkFaint,
  },
  notice: {
    textAlign: 'center',
  },
  onboard: {
    flex: 1,
    gap: space.xl,
    padding: space.xl,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: tap,
  },
  intro: {
    gap: space.md,
  },
  heading: {
    fontSize: font.size.display,
    lineHeight: 36,
    fontWeight: font.weight.bold,
    letterSpacing: -0.4,
    color: color.ink,
  },
  ask: {
    gap: space.md,
  },
  question: {
    fontSize: font.size.heading,
    fontWeight: font.weight.semibold,
    color: color.ink,
  },
  input: {
    minHeight: tap + 6,
    paddingHorizontal: space.lg,
    borderRadius: radius.soft,
    borderWidth: 1,
    borderColor: color.lineStrong,
    backgroundColor: color.surface,
    fontSize: font.size.body,
    color: color.ink,
  },
});
