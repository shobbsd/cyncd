import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { confirmationFor, understand, type Understanding } from '../content';
import { color, font, radius, space, tap } from '../theme/tokens';
import { Btn, Faint } from './ui';
import { FadeIn } from './FadeIn';

type Mode =
  | { kind: 'idle' }
  | { kind: 'listening'; heard: string }
  | { kind: 'typing'; text: string }
  | { kind: 'confirm'; text: string; result: Understanding };

const WORD_MS = 110;

function MicIcon({ tint }: { tint: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      <Rect x={5} y={1} width={6} height={9} rx={3} fill={tint} />
      <Path
        d="M3 7.5a5 5 0 0 0 10 0M8 12.5V15"
        stroke={tint}
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function ActionLink({
  label,
  onPress,
  icon,
  subtle = false,
}: {
  label: string;
  onPress: () => void;
  icon?: boolean;
  subtle?: boolean;
}) {
  const tint = subtle ? color.inkFaint : color.forest;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.link, pressed && styles.pressed]}
    >
      {icon ? <MicIcon tint={tint} /> : null}
      <Text style={[styles.linkLabel, { color: tint }]}>{label}</Text>
    </Pressable>
  );
}

/**
 * Speak · Type, then "Got it" with what Cyncd understood.
 *
 * After someone speaks they get a small confirmation, never another
 * questionnaire built from their answer — that is what makes it feel like
 * listening rather than a voice-enabled form.
 *
 * Speak is scripted: the demo has no speech recogniser, so it plays `sample`
 * back word by word and says so. Everything after — the extraction, the
 * confirmation, Edit — runs on the text exactly as it would on a transcript.
 */
export function TellMore({
  sample,
  speakLabel = 'Speak',
  skipLabel,
  lead,
  onConfirm,
  onSkip,
}: {
  sample: string;
  speakLabel?: string;
  skipLabel?: string;
  /** Shown before the actions on an inline row, e.g. "Want to tell Cyncd more?" */
  lead?: string;
  onConfirm: (text: string, signals: string[]) => void;
  onSkip?: () => void;
}) {
  const [mode, setMode] = useState<Mode>({ kind: 'idle' });
  const pulse = useRef(new Animated.Value(0)).current;

  const listening = mode.kind === 'listening';

  useEffect(() => {
    if (!listening) return;
    const words = sample.split(' ');
    let count = 0;
    const timer = setInterval(() => {
      count += 1;
      if (count > words.length) {
        clearInterval(timer);
        setMode({ kind: 'confirm', text: sample, result: understand(sample) });
        return;
      }
      setMode({ kind: 'listening', heard: words.slice(0, count).join(' ') });
    }, WORD_MS);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => {
      clearInterval(timer);
      loop.stop();
    };
  }, [listening, sample, pulse]);

  if (mode.kind === 'idle') {
    return (
      <View style={styles.row}>
        {lead === undefined ? null : <Text style={styles.lead}>{lead}</Text>}
        <View style={styles.actions}>
          <ActionLink
            label={speakLabel}
            icon
            onPress={() => setMode({ kind: 'listening', heard: '' })}
          />
          <Text style={styles.sep}>·</Text>
          <ActionLink label="Type" onPress={() => setMode({ kind: 'typing', text: '' })} />
          {skipLabel === undefined || onSkip === undefined ? null : (
            <>
              <Text style={styles.sep}>·</Text>
              <ActionLink label={skipLabel} subtle onPress={onSkip} />
            </>
          )}
        </View>
      </View>
    );
  }

  if (mode.kind === 'listening') {
    return (
      <FadeIn style={styles.panel}>
        <View style={styles.listeningRow}>
          <Animated.View
            style={[
              styles.micDot,
              {
                opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }),
                transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.15] }) }],
              },
            ]}
          >
            <MicIcon tint={color.surface} />
          </Animated.View>
          <Text style={styles.listening}>Listening…</Text>
        </View>
        <Text style={styles.heard}>{mode.heard.length > 0 ? `“${mode.heard}”` : ' '}</Text>
        <Faint>Demo: plays a sample answer.</Faint>
      </FadeIn>
    );
  }

  if (mode.kind === 'typing') {
    const done = () => {
      const text = mode.text.trim();
      if (text.length > 0) setMode({ kind: 'confirm', text, result: understand(text) });
    };
    return (
      <FadeIn style={styles.panel}>
        <TextInput
          style={styles.input}
          multiline
          autoFocus
          placeholder="Say it however it comes to you…"
          placeholderTextColor={color.inkFaint}
          value={mode.text}
          onChangeText={(text) => setMode({ kind: 'typing', text })}
        />
        <View style={styles.buttons}>
          <Btn label="Cancel" variant="ghost" onPress={() => setMode({ kind: 'idle' })} />
          <Btn label="Done" disabled={mode.text.trim().length === 0} onPress={done} />
        </View>
      </FadeIn>
    );
  }

  const copy = confirmationFor(mode.result);
  return (
    <FadeIn style={[styles.panel, styles.confirm]}>
      <Text style={styles.gotIt}>{copy.title}</Text>
      <Text style={styles.confirmLead}>{copy.lead}</Text>
      {mode.result.signals.map((signal) => (
        <Text key={signal} style={styles.signal}>
          {signal} <Text style={styles.tick}>✓</Text>
        </Text>
      ))}
      <View style={styles.buttons}>
        <Btn
          label="Edit"
          variant="secondary"
          onPress={() => setMode({ kind: 'typing', text: mode.text })}
        />
        <Btn
          label="Looks right ✓"
          onPress={() => onConfirm(mode.text, mode.result.signals)}
        />
      </View>
    </FadeIn>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: space.sm,
  },
  lead: {
    fontSize: font.size.small,
    color: color.inkSoft,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: space.md,
    minHeight: tap,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: tap,
  },
  pressed: {
    opacity: 0.6,
  },
  linkLabel: {
    fontSize: font.size.body,
    fontWeight: font.weight.semibold,
  },
  sep: {
    color: color.inkFaint,
  },
  panel: {
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.card,
    backgroundColor: color.surfaceWarm,
  },
  listeningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  micDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.forest,
  },
  listening: {
    fontSize: font.size.body,
    fontWeight: font.weight.semibold,
    color: color.ink,
  },
  heard: {
    fontSize: font.size.body,
    lineHeight: 24,
    color: color.inkSoft,
    minHeight: 48,
  },
  input: {
    minHeight: 96,
    padding: space.md,
    borderRadius: radius.soft,
    borderWidth: 1,
    borderColor: color.lineStrong,
    backgroundColor: color.surface,
    fontSize: font.size.body,
    lineHeight: 22,
    color: color.ink,
    textAlignVertical: 'top',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: space.sm,
  },
  confirm: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
  },
  gotIt: {
    fontSize: font.size.title,
    fontWeight: font.weight.bold,
    color: color.ink,
  },
  confirmLead: {
    fontSize: font.size.body,
    color: color.inkSoft,
  },
  signal: {
    fontSize: font.size.body,
    fontWeight: font.weight.semibold,
    color: color.ink,
  },
  tick: {
    color: color.forest,
  },
});
