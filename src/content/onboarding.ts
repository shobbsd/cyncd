import type { OnboardingQuestion } from './types';

/**
 * Primary onboarding — the spec's eight questions, in order, one per screen.
 * Every question is skippable, including the last, which is a date picker
 * rather than chips.
 *
 * `cycle` appears here and only here. It is the spec's own wording for Q8 and is
 * deliberately exempt from the content lint; it must not appear in any guidance,
 * coach or notification copy.
 */
export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'sleep',
    prompt: 'What is your typical sleep schedule?',
    options: ['Early', 'Mid', 'Late'],
  },
  {
    id: 'energy',
    prompt: 'How would you describe your general energy level?',
    options: ['Low', 'Moderate', 'High'],
  },
  {
    id: 'stress',
    prompt: 'How sensitive are you to stress?',
    options: ['Low', 'Medium', 'High'],
  },
  {
    id: 'social',
    prompt: 'What is your social preference?',
    options: ['Home-focused', 'Balanced', 'Social'],
  },
  {
    id: 'shifts',
    prompt: 'How often does your mood noticeably shift?',
    options: ['Rarely', 'Sometimes', 'Often'],
  },
  {
    id: 'communication',
    prompt: 'When something comes up, what do you prefer?',
    options: ['Talk immediately', 'Need time first'],
  },
  {
    id: 'routine',
    prompt: 'What does your week usually look like?',
    options: ['Workdays', 'Weekends', 'Irregular'],
  },
  {
    id: 'cycleStart',
    prompt:
      'Approximate cycle start date? Optional — skip if you would rather not.',
    options: [],
    kind: 'date',
  },
];

/** Partner onboarding — shorter on purpose. Four questions, all skippable. */
export const PARTNER_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'support',
    prompt: 'How do you usually support your partner?',
    options: ['Talk', 'Space', 'Practical help'],
  },
  {
    id: 'timing',
    prompt: 'Preferred time for serious conversations?',
    options: ['Morning', 'Afternoon', 'Evening'],
  },
  {
    id: 'planning',
    prompt: 'How comfortable are you with planning ahead?',
    options: ['Low', 'Medium', 'High'],
  },
  {
    id: 'misunderstandings',
    prompt: 'What causes most misunderstandings between you?',
    options: ['Timing', 'Communication', 'Energy'],
  },
];

/** Reflect screen. Emoji-free, as specified. */
export const MOOD_CHIPS = [
  'Good',
  'Steady',
  'Tired',
  'Stretched',
  'Off',
] as const;

/** Ends of the "How accurate was today?" slider. */
export const ACCURACY_LABELS = { low: 'Not really', high: 'Very' } as const;
export const ACCURACY_MIN = 1;
export const ACCURACY_MAX = 5;

/**
 * Shown when onboarding was skipped end to end.
 *
 * The day script still runs — a skipped setup must never produce a blank Today
 * card, and hiding the week would also break the day stepper. So guidance stays
 * and this note sits alongside it, framed as a starting point rather than as
 * something the user failed to do. No guilt mechanics: it never asks them to go
 * back and finish.
 */
export const STARTER_NOTE =
  'You skipped setup, so this week is a general starting point rather than yours specifically. It will fit better the more cyncd sees.';
