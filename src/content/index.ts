import type { DayType, Role, TabId } from './types';

export * from './types';
export * from './days';
export * from './coach';
export * from './cycle';
export * from './forecast';
export * from './phaseGuidance';
export * from './onboarding';
export * from './understand';
export * from './score';
export * from './track';
export * from './reflection';
export * from './calendar';
export * from './planAssistant';
export * from './tabs';

/** Tab order for the bottom bar. Labels here, styling and icons in the UI. */
export const TABS: { id: TabId; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'forecast', label: 'Forecast' },
  { id: 'partner', label: 'Partner' },
  { id: 'plan', label: 'Plan' },
  { id: 'reflect', label: 'Reflect' },
];

export const DAY_TYPES: DayType[] = ['calm', 'lowEnergy', 'social', 'focused'];

/** Pill text per day type. Four types, four labels — there is no fifth. */
export const DAY_TYPE_LABELS: Record<DayType, string> = {
  calm: 'Calm',
  lowEnergy: 'Low Energy',
  social: 'Social',
  focused: 'Focused',
};

/**
 * The CSS custom property each day type colours from. The *name* is shared so
 * both sides agree on the hook; the values are the UI's to set — sage, warm
 * gold/sand, muted lavender and deeper sage respectively.
 */
export const SLOGAN = 'Stay in Cyncd. Know the day together.';

/** The first screen after "Create account" — why Cyncd exists, then one ask. */
export const INTRO = {
  title: 'Built for two. Personal to you.',
  body: 'Cyncd turns cycle patterns and daily changes into personalised guidance — helping you understand each other, communicate better, plan ahead and offer the right support at the right time.',
} as const;

/** The free-access screen, shown before anything that looks like a paywall. */
export const TRIAL = {
  title: 'Your first 30 days are on us.',
  lines: ['Learn your rhythm.', 'Cync with your partner.', 'See what changes.'],
  note: 'No card required.',
  cta: 'Start my 30 days',
} as const;

/**
 * The demo couple. Shanice is the primary user, Darnell the partner — one
 * source of truth so a screen never hardcodes a name next to a role id.
 */
export const ROLE_NAMES: Record<Role, string> = {
  shanice: 'Shanice',
  darnell: 'Darnell',
};

/** Demo-bar labels, which say what each role is as well as who. */
export const ROLE_LABELS: Record<Role, string> = {
  shanice: 'Shanice (her)',
  darnell: 'Darnell (partner)',
};

export const PRIVACY_NOTE = `${ROLE_NAMES.darnell} never sees your personal data — only shared guidance.`;
