import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { BrandLockup } from '../components/BrandMark';
import { Btn, Card, Faint, Guidance } from '../components/ui';
import { space } from '../theme/tokens';

export const welcomeDelayMs = 2000;

/** Ephemeral returning-session welcome; it is intentionally not persisted. */
export function Welcome({ onContinue }: { onContinue: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onContinue, welcomeDelayMs);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <View style={styles.screen}>
      <BrandLockup />
      <Card variant="warm">
        <Guidance>Stay in cyncd. Know the day together.</Guidance>
        <Faint>Today’s guidance is ready.</Faint>
        <Btn label="Continue" block onPress={onContinue} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', padding: space.xl, gap: space.xl },
});
