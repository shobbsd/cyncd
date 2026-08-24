import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { BrandMark } from '../components/BrandMark';
import { Btn, Muted } from '../components/ui';
import { SLOGAN, SPLASH_LINE } from '../content';
import { useCyncd } from '../state';
import { color, font, radius, space, tap } from '../theme/tokens';

export function Splash() {
  const { actions } = useCyncd();

  return (
    <View style={styles.splash}>
      <BrandMark size={76} />
      <View style={styles.wordmark}>
        <Text style={styles.word}>cyncd</Text>
        <Text style={styles.slogan}>{SLOGAN}</Text>
      </View>
      <Text style={styles.line}>{SPLASH_LINE}</Text>
      <Btn
        label="Create account"
        block
        onPress={actions.startSignup}
        style={styles.cta}
      />
    </View>
  );
}

/**
 * Deliberately unvalidated — the spec calls for a fake email field, and a demo
 * that rejects a typo'd address in front of an audience is worse than one that
 * accepts anything.
 */
export function Signup() {
  const { actions } = useCyncd();
  const [email, setEmail] = useState('');

  return (
    <View style={styles.onboard}>
      <View style={styles.top}>
        <BrandMark size={28} />
      </View>

      <Text style={styles.question}>What is your email?</Text>
      <Muted>Just so cyncd knows where to find you. Nothing gets sent.</Muted>

      <View style={styles.answers}>
        <TextInput
          style={styles.input}
          keyboardType="email-address"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="you@example.com"
          placeholderTextColor={color.inkFaint}
          value={email}
          onChangeText={setEmail}
          onSubmitEditing={() => actions.submitSignup(email)}
          returnKeyType="go"
        />
        <Btn
          label="Continue"
          block
          onPress={() => actions.submitSignup(email)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xl,
    padding: space.xl,
  },
  wordmark: {
    alignItems: 'center',
    gap: space.sm,
  },
  word: {
    fontSize: font.size.display,
    fontWeight: font.weight.bold,
    letterSpacing: -0.4,
    color: color.ink,
  },
  slogan: {
    fontSize: font.size.small,
    color: color.inkSoft,
    textAlign: 'center',
  },
  line: {
    fontSize: font.size.body,
    lineHeight: 24,
    color: color.inkSoft,
    textAlign: 'center',
  },
  cta: {
    marginTop: space.lg,
  },
  onboard: {
    flex: 1,
    gap: space.lg,
    padding: space.xl,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: tap,
  },
  question: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: font.weight.bold,
    letterSpacing: -0.3,
    color: color.ink,
  },
  answers: {
    gap: space.md,
    marginTop: space.sm,
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

export { styles as onboardStyles };
