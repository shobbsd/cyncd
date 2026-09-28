import { useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { StyleSheet, Text, View } from 'react-native';
import { BrandMark } from '../components/BrandMark';
import { FadeIn } from '../components/FadeIn';
import { Btn, Faint, Muted } from '../components/ui';
import { useCyncd } from '../state';
import { color, font, radius, space, tap } from '../theme/tokens';

/**
 * The partner invitation, offered only after the person has been through Cyncd
 * themselves — it works alone, and is better together. The code only appears
 * once they choose to invite, so "I'll do this later" is an equal choice rather
 * than the way out of a screen that assumed a partner.
 */
export function Invite() {
  const { state, actions } = useCyncd();
  const [inviting, setInviting] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>(
    'idle',
  );

  // Reaching this screen generates the code, so a missing one is a bug rather
  // than a state to render around quietly.
  if (state.partner.inviteCode === null) {
    console.error('cyncd: reached the invite screen with no invite code');
  }
  const code = state.partner.inviteCode ?? '——————';

  /**
   * Only claims success when the write actually succeeded.
   *
   * Native clipboard access is far more reliable than the web build's
   * `navigator.clipboard`, which needed a secure context — but the honesty rule
   * is unchanged: saying "Copied" when nothing was written is the same lie as a
   * test reporting a pass it did not verify, and the person finds out when they
   * paste nothing.
   */
  const copy = async () => {
    try {
      await Clipboard.setStringAsync(`cyncd.app/join/${code}`);
      setCopyState('copied');
    } catch (error) {
      console.error('cyncd: could not copy the invite link', error);
      setCopyState('failed');
    }
    setTimeout(() => setCopyState('idle'), 2400);
  };

  return (
    <View style={styles.onboard}>
      <View style={styles.top}>
        <BrandMark size={32} />
      </View>

      <FadeIn style={styles.intro}>
        <Text style={styles.question}>Cyncd works by itself.</Text>
        <Text style={styles.better}>It’s even better together.</Text>
        <Muted>
          Your partner gets their own short setup — a few questions about how
          they show up. They never see your answers, only the shared guidance
          for the day.
        </Muted>
      </FadeIn>

      {inviting ? (
        <FadeIn style={styles.intro}>
          <View style={styles.codeRow}>
            <Text style={styles.code}>{code}</Text>
            <Btn
              label={
                copyState === 'copied'
                  ? 'Copied'
                  : copyState === 'failed'
                    ? 'Copy failed'
                    : 'Copy'
              }
              variant="secondary"
              onPress={copy}
            />
          </View>
          {copyState === 'failed' ? (
            <Faint>
              Copying is not available here — the code above is the whole
              invite, so read it out or write it down.
            </Faint>
          ) : null}
        </FadeIn>
      ) : null}

      <View style={styles.answers}>
        {inviting ? (
          <Btn
            label="Simulate partner joining"
            block
            onPress={actions.simulatePartnerJoin}
          />
        ) : (
          <Btn label="Invite my partner" block onPress={() => setInviting(true)} />
        )}
        <Btn
          label="I'll do this later"
          variant="ghost"
          block
          onPress={actions.continueWithoutPartner}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  onboard: {
    flex: 1,
    gap: space.xl,
    padding: space.xl,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: tap,
  },
  intro: {
    gap: space.md,
  },
  question: {
    fontSize: font.size.display,
    lineHeight: 36,
    fontWeight: font.weight.bold,
    letterSpacing: -0.4,
    color: color.ink,
  },
  better: {
    fontSize: font.size.title,
    lineHeight: 30,
    fontWeight: font.weight.semibold,
    color: color.forest,
    marginTop: -space.sm,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.soft,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: color.lineStrong,
    backgroundColor: color.surfaceWarm,
  },
  code: {
    fontSize: font.size.title,
    fontWeight: font.weight.bold,
    letterSpacing: 3,
    color: color.ink,
  },
  answers: {
    gap: space.md,
    marginTop: 'auto',
  },
});
