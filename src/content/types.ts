/**
 * Shared types for the cyncd prototype.
 *
 * Everything here is demo data. There is no backend, no network call and no
 * real inference anywhere in this app — the "AI" is the scripted content in
 * `src/content/` selected by `demo.currentDay` and `demo.role`.
 */

export type Role = 'shanice' | 'darnell';

export type CyclePhase = 'period' | 'follicular' | 'ovulatory' | 'luteal';

export interface CycleSeed {
  lastPeriodStart?: string;
  cycleLength?: number;
}

export interface CycleOutlookDay {
  date: string;
  cycleDay: number;
  phase: CyclePhase;
}

export type CyclePrediction =
  | { kind: 'unavailable' }
  | {
      kind: 'predicted';
      cycleDay: number;
      phase: CyclePhase;
      nextPeriodStart: string;
      outlook: CycleOutlookDay[];
    };

/**
 * Four day types, because the spec defines exactly four pill colours.
 * Day 4 is a Calm day with `sensitive: true` — a gentler copy variant, not a
 * fifth colour.
 */
export type DayType = 'calm' | 'lowEnergy' | 'social' | 'focused';

export type TabId = 'today' | 'partner' | 'plan' | 'reflect';

/**
 * How the partner is being advised to show up today. Drives which approach the
 * Partner tab leads with; the copy itself lives in `partnerGuidance`.
 */
export type SupportApproach = 'space' | 'reassurance' | 'conversation';

export interface PlanSuggestion {
  /** Stable and content-derived (e.g. `d6-film-night`) so Save is idempotent. */
  id: string;
  day: number;
  title: string;
  detail: string;
  /** Lets "Plan tonight" filter to what the user tapped: Home / Out / Either. */
  setting: 'home' | 'out' | 'either';
}

export interface NotificationDef {
  id: string;
  day: number;
  text: string;
  /**
   * Deep-link destination, declared on the data rather than inferred from the
   * copy at render time.
   */
  target: TabId;
}

export interface DayContent {
  /** 1-7. */
  day: number;
  dayType: DayType;
  /** Pill text: 'Calm' | 'Low Energy' | 'Social' | 'Focused'. */
  label: string;
  /** Day 4 only — gentler framing, same sage pill. */
  sensitive: boolean;
  /** Shanice's Today card. Verbatim from the spec. */
  todayGuidance: string;
  /** Darnell's guidance. Verbatim from the spec. Also what Shanice sees as "What Darnell sees". */
  partnerGuidance: string;
  /** The "Why?" expansion. Human language only — no data, no charts. */
  why: string;
  /** Small reassurance note under the Today card. */
  reassurance: string;
  supportApproach: SupportApproach;
  /** 2-3 concrete things Darnell could actually do today. */
  partnerActions: string[];
  plans: PlanSuggestion[];
  notification: NotificationDef;
}

// --- AI Coach -------------------------------------------------------------

export type ChipId =
  | 'planTonight'
  | 'supportTip'
  | 'talkBetter'
  | 'dateIdea'
  | 'whyToday'
  | 'quickCheckIn';

/** What a finished conversation produced. Recorded on the log entry. */
export type OutputType =
  | 'plan'
  | 'message'
  | 'framework'
  | 'explanation'
  | 'checkin';

export interface CoachChip {
  id: ChipId;
  label: string;
  /** Omitted means both roles. `supportTip` is Darnell's. */
  role?: Role;
}

/**
 * A scripted conversation is a flat map of nodes plus an entry id resolved from
 * (chip, dayType, role). Three node kinds is all the UI has to render:
 *
 *   say     — type these out in order, then advance to `next`
 *   choice  — wait for a tap
 *   summary — terminal card with Save / Send to partner
 */
export type CoachNode =
  | { kind: 'say'; id: string; messages: string[]; next: string }
  | {
      kind: 'choice';
      id: string;
      prompt?: string;
      options: { label: string; next: string }[];
    }
  | {
      kind: 'summary';
      id: string;
      title: string;
      lines: string[];
      /** Present when the output is something the user can send as-is. */
      sendableMessage?: string;
      outputType: OutputType;
      /** What the log entry reads, e.g. 'Plan suggestion saved'. */
      logText: string;
      /** Set when saving should also add to Shared plans. */
      planTitle?: string;
    };

// --- Onboarding -----------------------------------------------------------

export interface OnboardingQuestion {
  id: string;
  prompt: string;
  options: string[];
  /** The optional cycle-start question renders a date picker, not chips. */
  kind?: 'chips' | 'date';
}

// --- Persisted state ------------------------------------------------------

/**
 * Where the user is in the journey. Persisted, because "relaunch preserves
 * state" has to hold mid-onboarding, not just once you reach the tabs.
 *
 * `learning` and `paired` are transient screens (a timed animation and the
 * "You're synced" confirmation shown once the partner joins). On rehydrate they
 * resolve forward — `learning` -> `invite`, `paired` -> `app` — so a relaunch
 * during the animation can never strand someone on a screen with no way out.
 */
export type Flow =
  | 'splash'
  | 'signup'
  | 'onboarding'
  | 'learning'
  | 'invite'
  | 'partnerOnboarding'
  | 'paired'
  | 'app';

export interface SavedPlan {
  id: string;
  day: number;
  text: string;
  sharedBy: Role;
  /** True once "Send to partner" was tapped. */
  shared: boolean;
}

export interface LogEntry {
  id: string;
  /** ISO date string — when the entry was created. */
  date: string;
  day: number;
  dayType: DayType;
  /** Null for entries that did not come from a coach conversation. */
  chip: ChipId | null;
  outputType: OutputType | 'reflection';
  text: string;
  rating?: number;
}

export interface Reflection {
  id: string;
  day: number;
  /** 1-5, "Not really" -> "Very". */
  accuracy: number;
  mood?: string;
}

export interface ActiveNotification {
  id: string;
  day: number;
  text: string;
  target: TabId;
}

export interface CyncdState {
  /** Bumped when a shape change would break a persisted blob. */
  version: number;
  flow: Flow;
  account: { email: string | null };
  onboarding: {
    answers: Record<string, string>;
    skipped: string[];
    completed: boolean;
  };
  partner: {
    joined: boolean;
    answers: Record<string, string>;
    inviteCode: string | null;
  };
  demo: { currentDay: number; role: Role };
  sharing: { paused: boolean };
  savedPlans: SavedPlan[];
  logs: LogEntry[];
  reflections: Reflection[];
  /**
   * Single slot, not a queue. Assignment replaces whatever was showing, so
   * stepping 3 -> 4 -> 5 quickly cannot stack banners.
   */
  notification: ActiveNotification | null;
}
