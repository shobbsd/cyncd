import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { BrandMark } from '../components/BrandMark';
import { FadeIn } from '../components/FadeIn';
import { HoldToCync } from '../components/HoldToCync';
import { TellMore } from '../components/TellMore';
import { Btn, Chip, Faint, Muted } from '../components/ui';
import {
  answerList,
  noteKey,
  rhythmSummary,
  signalsKey,
  visibleSteps,
  type OnboardingAnswer,
  type OnboardingStep,
} from '../content';
import { color, font, radius, space, tap } from '../theme/tokens';

/** `yyyy-mm-dd`, matching what the web build's `<input type="date">` produced. */
function toIsoDate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

type Answer = (id: string, value: OnboardingAnswer) => void;

/**
 * Onboarding as a conversation: one step per screen, each using the cheapest
 * input that can answer it — a tap, a few taps, or one sentence.
 *
 * Shared by both flows. They differ only in their steps and where they hand
 * off to, which is what the props are for. Steps with a `when` drop out when
 * an earlier answer rules them out, so someone using Cyncd alone is never
 * asked how long they have been together.
 */
export function QuestionFlow({
  steps,
  answers,
  greeting,
  onAnswer,
  onSkip,
  onFinish,
}: {
  steps: OnboardingStep[];
  answers: Record<string, OnboardingAnswer>;
  /** Shown above the first step, e.g. "Nice to meet you, Shanice." */
  greeting?: string;
  onAnswer: Answer;
  onSkip: (id: string) => void;
  onFinish: () => void;
}) {
  const [index, setIndex] = useState(0);

  const visible = visibleSteps(steps, answers);
  const step = visible[Math.min(index, visible.length - 1)];
  const last = index >= visible.length - 1;

  const next = () => {
    if (last) onFinish();
    else setIndex((value) => value + 1);
  };

  const skip = () => {
    onSkip(step.id);
    next();
  };

  const note = (text: string, signals: string[]) => {
    onAnswer(noteKey(step.id), text);
    onAnswer(signalsKey(step.id), signals);
  };

  return (
    <View style={styles.onboard}>
      <View style={styles.top}>
        <BrandMark size={32} />
        <View
          style={styles.track}
          accessibilityLabel={`Step ${index + 1} of ${visible.length}`}
        >
          <View
            style={[
              styles.fill,
              { width: `${((index + 1) / visible.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Keyed by step so each one eases in rather than swapping in place. */}
      <FadeIn key={step.id} style={styles.body}>
        {index === 0 && greeting !== undefined ? (
          <Text style={styles.greeting}>{greeting}</Text>
        ) : null}
        <StepView
          step={step}
          answers={answers}
          onAnswer={onAnswer}
          onNote={note}
          onNext={next}
          onSkip={skip}
        />
      </FadeIn>
    </View>
  );
}

function StepView({
  step,
  answers,
  onAnswer,
  onNote,
  onNext,
  onSkip,
}: {
  step: OnboardingStep;
  answers: Record<string, OnboardingAnswer>;
  onAnswer: Answer;
  onNote: (text: string, signals: string[]) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  switch (step.kind) {
    case 'single':
      return (
        <>
          <Prompt text={step.prompt} hint={step.hint} />
          <View style={styles.answers}>
            {step.options.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={answers[step.id] === option}
                onPress={() => {
                  onAnswer(step.id, option);
                  onNext();
                }}
                style={styles.answer}
              />
            ))}
          </View>
          {step.tellMore === undefined ? null : (
            <TellMore
              lead={step.tellMore.prompt ?? 'Want to tell Cyncd more?'}
              sample={step.tellMore.sample}
              speakLabel={step.tellMore.speakLabel}
              onConfirm={(text, signals) => {
                onNote(text, signals);
                onNext();
              }}
            />
          )}
          <Btn label="Skip" variant="ghost" block onPress={onSkip} />
        </>
      );

    case 'multi':
      return <MultiStep step={step} answers={answers} onAnswer={onAnswer} onNote={onNote} onNext={onNext} onSkip={onSkip} />;

    case 'date':
      return <DateStep step={step} onAnswer={onAnswer} onNext={onNext} onSkip={onSkip} />;

    case 'tell':
      return (
        <>
          <Prompt text={step.prompt} hint={step.hint} />
          <TellMore
            sample={step.sample}
            speakLabel={step.speakLabel}
            skipLabel={step.skipLabel}
            onSkip={onSkip}
            onConfirm={(text, signals) => {
              onNote(text, signals);
              onNext();
            }}
          />
        </>
      );

    case 'pause':
      return (
        <View style={styles.pause}>
          <Text style={styles.pauseTitle}>{step.title}</Text>
          {step.lines.map((line) => (
            <Muted key={line} style={styles.centred}>
              {line}
            </Muted>
          ))}
          <Btn label="Continue" block onPress={onNext} style={styles.pauseCta} />
        </View>
      );

    case 'reflect':
      return (
        <View style={styles.pause}>
          <Text style={styles.pauseTitle}>{step.title}</Text>
          <Muted style={styles.centred}>{rhythmSummary(answers)}</Muted>
          <Muted style={styles.centred}>{step.closing}</Muted>
          <Btn label="Continue" block onPress={onNext} style={styles.pauseCta} />
        </View>
      );

    case 'health':
      return <HealthStep step={step} onAnswer={onAnswer} onNext={onNext} />;

    case 'privacy':
      return <PrivacyStep step={step} answers={answers} onAnswer={onAnswer} onNext={onNext} />;

    case 'commitment':
      return (
        <View style={styles.commit}>
          <Text style={styles.question}>{step.title}</Text>
          {step.lines.map((line) => (
            <Muted key={line}>{line}</Muted>
          ))}
          <Text style={styles.pledge}>“{step.pledge}”</Text>
          <HoldToCync label={step.holdLabel} doneLabel={step.doneLabel} onDone={onNext} />
        </View>
      );
  }
}

function Prompt({ text, hint }: { text: string; hint?: string }) {
  return (
    <View style={styles.prompt}>
      <Text style={styles.question}>{text}</Text>
      {hint === undefined ? null : <Faint>{hint}</Faint>}
    </View>
  );
}

function MultiStep({
  step,
  answers,
  onAnswer,
  onNote,
  onNext,
  onSkip,
}: {
  step: Extract<OnboardingStep, { kind: 'multi' }>;
  answers: Record<string, OnboardingAnswer>;
  onAnswer: Answer;
  onNote: (text: string, signals: string[]) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const [picked, setPicked] = useState<string[]>(() => answerList(answers[step.id]));
  const exclusive = step.exclusive ?? [];

  const toggle = (option: string) => {
    setPicked((current) => {
      if (current.includes(option)) return current.filter((item) => item !== option);
      // "Nothing I've noticed" and a list of changes cannot both be true.
      if (exclusive.includes(option)) return [option];
      return [...current.filter((item) => !exclusive.includes(item)), option];
    });
  };

  const commit = () => {
    if (picked.length > 0) onAnswer(step.id, picked);
  };

  return (
    <>
      <Prompt text={step.prompt} hint={step.hint} />
      <View style={styles.cards}>
        {step.options.map((option) => (
          <Chip
            key={option}
            label={option}
            selected={picked.includes(option)}
            onPress={() => toggle(option)}
          />
        ))}
      </View>
      {step.tellMore === undefined ? null : (
        <TellMore
          sample={step.tellMore.sample}
          speakLabel={step.tellMore.speakLabel}
          lead={step.tellMore.prompt ?? 'Want to tell Cyncd more?'}
          onConfirm={(text, signals) => {
            commit();
            onNote(text, signals);
            onNext();
          }}
        />
      )}
      <View style={styles.answers}>
        <Btn
          label="Continue"
          block
          disabled={picked.length === 0}
          onPress={() => {
            commit();
            onNext();
          }}
        />
        <Btn label="Skip" variant="ghost" block onPress={onSkip} />
      </View>
    </>
  );
}

function DateStep({
  step,
  onAnswer,
  onNext,
  onSkip,
}: {
  step: Extract<OnboardingStep, { kind: 'date' }>;
  onAnswer: Answer;
  onNext: () => void;
  onSkip: () => void;
}) {
  const [date, setDate] = useState<Date | null>(null);

  // Android has no inline date picker — it is a dialog opened imperatively.
  // iOS renders one inline, so only Android needs the explicit open button.
  const openAndroidPicker = () => {
    DateTimePickerAndroid.open({
      value: date ?? new Date(),
      mode: 'date',
      onChange: (_event, selected) => {
        if (selected !== undefined) setDate(selected);
      },
    });
  };

  return (
    <>
      <Prompt text={step.prompt} hint={step.hint} />
      <View style={styles.answers}>
        {Platform.OS === 'android' ? (
          <Btn
            label={date === null ? 'Choose a date' : toIsoDate(date)}
            variant="secondary"
            block
            onPress={openAndroidPicker}
          />
        ) : (
          <DateTimePicker
            value={date ?? new Date()}
            mode="date"
            display="spinner"
            onChange={(_event, selected) => {
              if (selected !== undefined) setDate(selected);
            }}
          />
        )}
        <Btn
          label="Continue"
          block
          disabled={date === null}
          onPress={() => {
            onAnswer(step.id, toIsoDate(date as Date));
            onNext();
          }}
        />
        <Btn label="Skip" variant="ghost" block onPress={onSkip} />
      </View>
    </>
  );
}

/**
 * Explains what connecting does before any system sheet appears.
 *
 * The demo has no HealthKit entitlement, so Connect records the choice and says
 * where Apple's permission sheet would appear rather than pretending to read
 * anything.
 */
function HealthStep({
  step,
  onAnswer,
  onNext,
}: {
  step: Extract<OnboardingStep, { kind: 'health' }>;
  onAnswer: Answer;
  onNext: () => void;
}) {
  const [asked, setAsked] = useState(false);

  return (
    <>
      <Prompt text={step.prompt} />
      <Muted>{step.explainer}</Muted>
      {asked ? (
        <FadeIn style={styles.panel}>
          <Text style={styles.panelTitle}>Apple Health would ask you next.</Text>
          <Faint>
            In the app, Apple’s permission sheet appears here and you choose each
            signal. This demo doesn’t read any health data.
          </Faint>
          <Btn label="Continue" block onPress={onNext} />
        </FadeIn>
      ) : (
        <View style={styles.answers}>
          <Btn
            label={step.connectLabel}
            block
            onPress={() => {
              onAnswer(step.id, 'connected');
              setAsked(true);
            }}
          />
          <Btn
            label={step.declineLabel}
            variant="ghost"
            block
            onPress={() => {
              onAnswer(step.id, 'declined');
              onNext();
            }}
          />
        </View>
      )}
    </>
  );
}

function PrivacyStep({
  step,
  answers,
  onAnswer,
  onNext,
}: {
  step: Extract<OnboardingStep, { kind: 'privacy' }>;
  answers: Record<string, OnboardingAnswer>;
  onAnswer: Answer;
  onNext: () => void;
}) {
  const stored = answers[step.id];
  const [choice, setChoice] = useState(
    typeof stored === 'string' ? stored : step.defaultOption,
  );

  return (
    <>
      <Text style={styles.heading}>{step.title}</Text>
      {step.lines.map((line) => (
        <Muted key={line}>{line}</Muted>
      ))}
      <View style={styles.options} accessibilityRole="radiogroup">
        {step.options.map((option) => {
          const on = option === choice;
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              onPress={() => setChoice(option)}
              style={[styles.option, on && styles.optionOn]}
            >
              <Text style={[styles.optionLabel, on && styles.optionLabelOn]}>{option}</Text>
              <View style={[styles.check, on && styles.checkOn]}>
                {on ? <Text style={styles.checkMark}>✓</Text> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      <Faint>You can change this any time from the Partner tab.</Faint>
      <Btn
        label="Continue"
        block
        onPress={() => {
          onAnswer(step.id, choice);
          onNext();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  onboard: {
    flex: 1,
    gap: space.lg,
    padding: space.xl,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.xl,
    minHeight: tap,
  },
  track: {
    flex: 1,
    maxWidth: 160,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: color.lineStrong,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: color.forest,
  },
  body: {
    flex: 1,
    gap: space.lg,
  },
  greeting: {
    fontSize: font.size.body,
    fontWeight: font.weight.semibold,
    color: color.forest,
  },
  prompt: {
    gap: space.xs,
  },
  question: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: font.weight.bold,
    letterSpacing: -0.3,
    color: color.ink,
  },
  heading: {
    fontSize: font.size.display,
    lineHeight: 36,
    fontWeight: font.weight.bold,
    letterSpacing: -0.4,
    color: color.ink,
  },
  answers: {
    gap: space.md,
  },
  answer: {
    alignItems: 'center',
  },
  cards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  pause: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: space.lg,
    paddingBottom: space.xxl,
  },
  pauseTitle: {
    fontSize: font.size.title,
    lineHeight: 30,
    fontWeight: font.weight.bold,
    color: color.ink,
    textAlign: 'center',
  },
  pauseCta: {
    marginTop: space.lg,
  },
  centred: {
    textAlign: 'center',
  },
  panel: {
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.card,
    backgroundColor: color.surfaceWarm,
  },
  panelTitle: {
    fontSize: font.size.body,
    fontWeight: font.weight.semibold,
    color: color.ink,
  },
  options: {
    gap: space.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    minHeight: tap + 12,
    paddingHorizontal: space.lg,
    borderRadius: radius.soft,
    borderWidth: 1,
    borderColor: color.lineStrong,
    backgroundColor: color.surface,
  },
  optionOn: {
    borderColor: color.forest,
  },
  optionLabel: {
    flex: 1,
    fontSize: font.size.body,
    color: color.inkSoft,
  },
  optionLabelOn: {
    color: color.ink,
    fontWeight: font.weight.semibold,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: color.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: {
    borderColor: color.forest,
    backgroundColor: color.forest,
  },
  checkMark: {
    fontSize: 13,
    fontWeight: font.weight.bold,
    color: color.surface,
  },
  commit: {
    flex: 1,
    gap: space.lg,
  },
  pledge: {
    fontFamily: font.wordmark,
    fontSize: font.size.title,
    lineHeight: 30,
    color: color.forest,
    marginVertical: space.md,
  },
});
