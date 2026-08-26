import type { DayType, Role, TabId } from './types';

export * from './types';
export * from './days';
export * from './coach';
export * from './cycle';
export * from './forecast';
export * from './phaseGuidance';
export * from './onboarding';
export * from './score';
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
export const SLOGAN = 'Stay in sync. Know the day. Together.';

export const SPLASH_LINE =
  'cyncd helps couples understand daily mood, energy and communication timing.';

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
