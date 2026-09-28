import type { OnboardingAnswer, OnboardingStep } from './types';

/**
 * Onboarding, as a conversation rather than a form.
 *
 * The order is deliberate: why they are here, then the relationship, then the
 * body. Asking about the relationship before cycles is what positions Cyncd as
 * relationship intelligence rather than another period tracker. Every question
 * is skippable, and the open questions are always optional — "tell us only
 * what we need to begin, we'll learn you naturally".
 */

export const PARTNERED = 'With a partner';

export const CONNECTION_OPTIONS = [
  'Talking',
  'Physical affection',
  'Sex/intimacy',
  'Quality time',
  'Doing things together',
  'Acts of care',
  'Reassurance',
  'Having space together',
];

/** Options on the change cards that mean "nothing to summarise". */
export const NO_CHANGE_OPTIONS = ["Nothing I've noticed", "I'm not sure"];

export const PRIVACY_OPTIONS = {
  private: 'Private to me',
  shared: 'Okay for Cyncd to use for shared guidance',
} as const;

const privacyStep: OnboardingStep = {
  id: 'privacy',
  kind: 'privacy',
  title: 'You decide what gets shared.',
  lines: [
    'Your private logs, conversations and cycle details stay private.',
    'Cyncd can turn what it learns into helpful guidance for your partner without showing them what you told us.',
  ],
  options: [PRIVACY_OPTIONS.private, PRIVACY_OPTIONS.shared],
  defaultOption: PRIVACY_OPTIONS.shared,
};

/** Primary onboarding. */
export const ONBOARDING_STEPS: OnboardingStep[] = [
  // 1. Why they are here.
  {
    id: 'intent',
    kind: 'multi',
    prompt: 'What would you most like Cyncd to help with?',
    hint: 'Choose as many as feel right.',
    options: [
      'Understand myself better',
      'Understand my cycle/rhythm',
      'Communicate better with my partner',
      'Feel more connected',
      'Reduce misunderstandings/conflict',
      'Plan better together',
      'Intimacy & affection',
      'Something else',
    ],
  },
  {
    id: 'aboutYou',
    kind: 'tell',
    prompt: 'Anything you’d like Cyncd to understand about you?',
    hint: 'Completely optional.',
    speakLabel: 'Speak',
    skipLabel: 'Skip',
    sample:
      'When work gets busy I need a bit of space first, then I like to talk things through properly.',
  },

  // 2. Their situation.
  {
    id: 'usage',
    kind: 'single',
    prompt: 'Are you using Cyncd…',
    options: [PARTNERED, 'By myself for now'],
  },
  {
    id: 'together',
    kind: 'single',
    when: { id: 'usage', equals: PARTNERED },
    prompt: 'How long have you been together?',
    options: ['Just started', 'Less than a year', '1–3 years', '3–7 years', '7+ years'],
  },
  {
    id: 'moreOf',
    kind: 'multi',
    when: { id: 'usage', equals: PARTNERED },
    prompt: 'What would you like more of in your relationship?',
    hint: 'Choose as many as feel right.',
    options: [
      'Connection',
      'Communication',
      'Affection',
      'Quality time',
      'Intimacy',
      'Understanding',
      'Better planning',
      'Less conflict',
    ],
    tellMore: {
      prompt: 'Tell Cyncd more',
      sample:
        'We used to plan little dates and it has slipped since work got busy. I miss having proper time together.',
    },
  },
  {
    id: 'breather',
    kind: 'pause',
    title: 'We’re already learning your rhythm.',
    lines: [
      'You don’t need to tell us everything today. Cyncd will learn more naturally as you use it.',
    ],
  },

  // The cycle questions are unchanged from Phase 1 — they seed the forecast.
  {
    id: 'cycleStart',
    kind: 'date',
    prompt: 'When did your last period start?',
    hint: 'This stays private and helps personalise your forecast.',
  },
  {
    id: 'cycleLength',
    kind: 'single',
    prompt: 'How long is your cycle usually?',
    options: ['~28 days', 'Shorter', 'Longer', 'Varies', 'Not sure'],
  },

  // 4. What actually changes for them.
  {
    id: 'changes',
    kind: 'multi',
    prompt: 'What tends to change across your cycle?',
    hint: 'Choose as many as feel right.',
    options: [
      'Mood',
      'Energy',
      'Sleep',
      'Sex drive',
      'Appetite',
      'Skin',
      'Pain/cramps',
      'Confidence',
      'Focus',
      'Sociability',
      'Affection',
      'Sensitivity',
      ...NO_CHANGE_OPTIONS,
    ],
    exclusive: NO_CHANGE_OPTIONS,
  },
  {
    id: 'noticeMore',
    kind: 'tell',
    prompt: 'Anything else you notice?',
    speakLabel: 'Tell Cyncd',
    skipLabel: 'Nothing else',
    sample:
      'Before my period I get really emotional, don’t want to go out, get spots and usually want more reassurance from my partner.',
  },

  // 5. Communication style.
  {
    id: 'support',
    kind: 'single',
    prompt: 'When you’re having a difficult day, what usually helps most?',
    options: [
      'Give me space',
      'Check in with me',
      'Reassure me',
      'Physical affection',
      'Practical help',
      'Distract me / make me laugh',
      'Ask me what I need',
      'It depends',
    ],
  },
  {
    id: 'communication',
    kind: 'single',
    prompt: 'And when something’s bothering you, what are you most likely to do?',
    options: [
      'Talk about it straight away',
      'Need time first',
      'Go quiet',
      'Become emotional',
      'Try to solve it myself',
      'It depends',
    ],
  },

  // 6. Connection.
  {
    id: 'connection',
    kind: 'multi',
    prompt: 'What makes you feel most connected to your partner?',
    hint: 'Choose as many as feel right.',
    options: CONNECTION_OPTIONS,
  },
  {
    id: 'intimacy',
    kind: 'single',
    prompt: 'Would you like Cyncd to include intimacy in your guidance?',
    hint: 'Optional. You can change this any time.',
    options: ['Yes', 'Sometimes', 'Not right now'],
  },

  // 7. Something back.
  {
    id: 'rhythm',
    kind: 'reflect',
    title: 'We’re getting to know your rhythm.',
    closing:
      'Cyncd will learn what’s actually true for you as you use it — rather than assuming every cycle looks the same.',
  },

  // 8. Health.
  {
    id: 'health',
    kind: 'health',
    prompt: 'Want Cyncd to learn with less logging?',
    explainer:
      'Sleep, activity and other permitted health signals can help Cyncd understand changes in your rhythm without you manually logging everything.',
    connectLabel: 'Connect Apple Health',
    declineLabel: 'Continue without connecting',
  },

  // 10. Privacy, before any partner connection.
  privacyStep,

  // 11. The commitment.
  {
    id: 'commitment',
    kind: 'commitment',
    title: 'One last thing.',
    lines: [
      'Cyncd gets better as you check in honestly — even when all you have is ten seconds.',
    ],
    pledge: 'I’m ready to understand myself better and help us understand each other.',
    holdLabel: 'Hold to Cync',
    doneLabel: 'You’re Cyncd.',
  },
];

/**
 * Partner onboarding. Deliberately not the same as the primary flow — a
 * handful of questions about how they show up, then privacy and their own
 * commitment moment.
 */
export const PARTNER_STEPS: OnboardingStep[] = [
  {
    id: 'intent',
    kind: 'multi',
    prompt: 'What would you like Cyncd to help you understand?',
    hint: 'Choose as many as feel right.',
    options: [
      'What changes for my partner',
      'How to support them better',
      'When to give space',
      'When to plan things',
      'How to communicate better',
      'How to feel more connected',
    ],
  },
  {
    id: 'connection',
    kind: 'multi',
    prompt: 'What makes you feel connected?',
    hint: 'Choose as many as feel right.',
    options: CONNECTION_OPTIONS,
  },
  {
    id: 'struggling',
    kind: 'single',
    prompt: 'How do you normally respond when your partner is struggling?',
    options: [
      'Give them space',
      'Check in',
      'Reassure them',
      'Physical affection',
      'Practical help',
      'Try to lighten the mood',
      'Ask what they need',
      'I’m not always sure',
    ],
  },
  {
    id: 'communication',
    kind: 'single',
    prompt: 'How do you prefer difficult conversations?',
    options: ['Talk it through straight away', 'Take some time first', 'It depends'],
  },
  {
    id: 'support',
    kind: 'multi',
    prompt: 'What support comes naturally to you?',
    hint: 'Choose as many as feel right.',
    options: [
      'Listening',
      'Practical help',
      'Physical affection',
      'Planning things',
      'Giving space',
      'Making them laugh',
    ],
  },
  {
    id: 'aboutYou',
    kind: 'tell',
    prompt: 'Anything Cyncd should know?',
    speakLabel: 'Speak',
    skipLabel: 'Skip',
    sample:
      'I’m never quite sure when to check in and when to give space, and I don’t want to get it wrong.',
  },
  privacyStep,
  {
    id: 'commitment',
    kind: 'commitment',
    title: 'One last thing.',
    lines: [
      'Cyncd gets better as you check in honestly — even when all you have is ten seconds.',
    ],
    pledge: 'I’m ready to understand us better and show up at the right time.',
    holdLabel: 'Hold to Cync',
    doneLabel: 'You’re Cyncd.',
  },
];

/** Where the notes and signals from a Speak / Type answer are stored. */
export const noteKey = (id: string) => `${id}Note`;
export const signalsKey = (id: string) => `${id}Signals`;

export function answerList(answer: OnboardingAnswer | undefined): string[] {
  if (answer === undefined) return [];
  return Array.isArray(answer) ? answer : [answer];
}

export function answerText(answer: OnboardingAnswer | undefined): string | undefined {
  return typeof answer === 'string' ? answer : undefined;
}

/** Steps that apply given the answers so far — partnered-only ones drop out otherwise. */
export function visibleSteps(
  steps: OnboardingStep[],
  answers: Record<string, OnboardingAnswer>,
): OnboardingStep[] {
  return steps.filter(
    (step) => step.when === undefined || answers[step.when.id] === step.when.equals,
  );
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

const CHANGE_WORDS: Record<string, string> = {
  'Pain/cramps': 'comfort',
  'Sex drive': 'sex drive',
  Sociability: 'social energy',
  Affection: 'need for affection',
};

/**
 * The "give them something back" line: a sentence built from what changes, so
 * the questionnaire visibly produced something.
 */
export function rhythmSummary(answers: Record<string, OnboardingAnswer>): string {
  const picked = answerList(answers.changes).filter(
    (option) => !NO_CHANGE_OPTIONS.includes(option),
  );
  const signals = answerList(answers[signalsKey('noticeMore')]);
  if (picked.length === 0 && signals.length === 0) {
    return 'From what you’ve told us, you’re still noticing how things change for you — which is exactly where Cyncd starts.';
  }
  const words = picked
    .slice(0, 3)
    .map((option) => CHANGE_WORDS[option] ?? option.toLowerCase());
  if (words.length === 0) {
    return `From what you’ve told us, ${signals[0].toLowerCase()} is something that can change throughout the month.`;
  }
  return `From what you’ve told us, your ${joinList(words)} can change throughout the month.`;
}

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
