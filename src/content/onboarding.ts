import type { OnboardingQuestion } from './types';

/** Primary onboarding — approved Phase 1 questions, all skippable. */
export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'energy',
    prompt: 'How does your energy usually change across the month?',
    options: ['Fairly steady', 'Some ups and downs', 'Big swings'],
  },
  {
    id: 'support',
    prompt: "When you're feeling stretched, what usually helps?",
    options: ['Space', 'Reassurance', 'Practical help'],
  },
  {
    id: 'communication',
    prompt: 'When something comes up between you, what do you prefer?',
    options: ['Talk it through soon', 'Need time first', 'Depends on the day'],
  },
  {
    id: 'social',
    prompt: 'How do you usually like to spend a free evening?',
    options: ['At home', 'Out', 'Depends'],
  },
  {
    id: 'cycleStart',
    prompt:
      'When did your last period start? This stays private and helps personalise your forecast.',
    options: [],
    kind: 'date',
  },
  {
    id: 'cycleLength',
    prompt: 'How long is your cycle usually?',
    options: ['~28 days', 'Shorter', 'Longer', 'Varies', 'Not sure'],
  },
  {
    id: 'routine',
    prompt: 'When do you usually have time together?',
    options: ['Weekdays', 'Weekends', 'Varies'],
  },
];

/** Partner onboarding — five approved questions, all skippable. */
export const PARTNER_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'energy',
    prompt: 'How would you describe your usual energy?',
    options: ['Low', 'Moderate', 'High'],
  },
  {
    id: 'communication',
    prompt: 'When something comes up, what do you prefer?',
    options: ['Talk immediately', 'Need time first'],
  },
  {
    id: 'support',
    prompt: 'How do you usually support your partner?',
    options: ['Talk', 'Space', 'Practical help'],
  },
  {
    id: 'social',
    prompt: 'How do you like to spend a free evening?',
    options: ['At home', 'Out', 'Depends'],
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
