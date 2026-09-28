/**
 * Shared types for the cyncd prototype.
 *
 * Everything here is demo data. There is no backend, no network call and no
 * real inference anywhere in this app — the "AI" is the scripted content in
 * `src/content/` selected by `demo.currentDay` and `demo.role`.
 */

export type Role = 'shanice' | 'darnell';

export type ScoreBand =
  | 'naturallyAligned'
  | 'gentlyConnected'
  | 'differentRhythms'
  | 'extraCare';

export interface ScoreResult {
  percentage: number;
  band: ScoreBand;
  label: string;
  line: string;
  action: string;
  confidence: string;
  components: {
    communication: number;
    energyAndCapacity: number;
    completedAction: number;
    accuracyFeedback: number;
  };
}

export interface ScoreHistoryEntry {
  date: string;
  percentage: number;
  label: string;
}

export type CyclePhase = 'period' | 'follicular' | 'ovulatory' | 'luteal';

export interface CycleSeed {
  lastPeriodStart?: string;
  cycleLength?: number;
}

/** Private, date-addressed tracking record. Nothing partner-facing reads it. */
export interface CycleLogEntry {
  id: string;
  date: string;
  period?: 'start' | 'end';
  flow?: 'light' | 'medium' | 'heavy';
  mood?: string;
  energy?: string;
  pain?: string;
  sleep?: string;
  stress?: string;
  physicalSymptoms?: string[];
  emotionalSymptoms?: string[];
  libido?: string;
  notes?: string;
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

export interface ForecastView {
  title: string;
  detail: string;
  mood: string;
  energy: string;
  action: string;
  outlook: CycleOutlookDay[];
}

/**
 * Four day types, because the spec defines exactly four pill colours.
 * Day 4 is a Calm day with `sensitive: true` — a gentler copy variant, not a
 * fifth colour.
 */
export type DayType = 'calm' | 'lowEnergy' | 'social' | 'focused';

export interface PhaseGuidance {
  kind: 'phase' | 'trait';
  dayType: DayType;
  label: string;
  todayGuidance: string;
  partnerGuidance: string;
  reassurance: string;
  why: string;
  approach: SupportApproach;
  actions: string[];
}

export type TabId = 'today' | 'forecast' | 'partner' | 'plan' | 'reflect';

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

/**
 * An onboarding answer. Most questions are one tap; the multi-select cards
 * ("Choose as many as feel right") and the signals Cyncd pulls out of a spoken
 * or typed answer are lists.
 */
export type OnboardingAnswer = string | string[];

/** Show a step only once an earlier answer is this value. */
export interface StepCondition {
  id: string;
  equals: string;
}

/**
 * The optional "Want to tell Cyncd more?" row under a question.
 *
 * `sample` is what the Speak button plays back. There is no speech recogniser
 * in the demo, so Speak performs a scripted answer rather than pretending to
 * hear one; the extraction and confirmation that follow are real.
 */
export interface TellMore {
  prompt?: string;
  speakLabel?: string;
  sample: string;
}

interface StepBase {
  id: string;
  when?: StepCondition;
}

/**
 * One screen of onboarding. The kind is the input method — the notes' rule is
 * "don't make them type if they can tap, don't make them tap ten things if they
 * can say one sentence" — so each question declares the cheapest input that
 * can answer it rather than every screen being the same chip list.
 */
export type OnboardingStep =
  | (StepBase & {
      kind: 'single';
      prompt: string;
      hint?: string;
      options: string[];
      tellMore?: TellMore;
    })
  | (StepBase & {
      kind: 'multi';
      prompt: string;
      hint?: string;
      options: string[];
      /** Options that stand alone, e.g. "Nothing I've noticed". */
      exclusive?: string[];
      tellMore?: TellMore;
    })
  | (StepBase & { kind: 'date'; prompt: string; hint?: string })
  /** An open question answered by Speak / Type, or skipped. */
  | (StepBase & {
      kind: 'tell';
      prompt: string;
      hint?: string;
      speakLabel: string;
      skipLabel: string;
      sample: string;
    })
  /** A breather between sections. Nothing to answer. */
  | (StepBase & { kind: 'pause'; title: string; lines: string[] })
  /** "Give them something back" — a summary built from their answers. */
  | (StepBase & { kind: 'reflect'; title: string; closing: string })
  | (StepBase & {
      kind: 'health';
      prompt: string;
      explainer: string;
      connectLabel: string;
      declineLabel: string;
    })
  | (StepBase & {
      kind: 'privacy';
      title: string;
      lines: string[];
      options: string[];
      defaultOption: string;
    })
  | (StepBase & {
      kind: 'commitment';
      title: string;
      lines: string[];
      pledge: string;
      holdLabel: string;
      doneLabel: string;
    });

// --- Persisted state ------------------------------------------------------

/**
 * Where the user is in the journey. Persisted, because "relaunch preserves
 * state" has to hold mid-onboarding, not just once you reach the tabs.
 *
 * `learning` and `paired` are transient screens (a timed animation and the
 * "You're synced" confirmation shown once the partner joins). On rehydrate they
 * resolve forward — `learning` -> `trial`, `paired` -> `app` — so a relaunch
 * during the animation can never strand someone on a screen with no way out.
 */
export type Flow =
  | 'splash'
  | 'signup'
  | 'name'
  | 'onboarding'
  | 'learning'
  | 'trial'
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

export interface ScoreActionCompletion {
  date: string;
  completedBy: Role;
}

export interface SharedItem {
  id: string;
  author: Role;
  kind: 'note' | 'insight' | 'need';
  body: string;
  sharedAt: string;
  updatedAt: string;
  revokedAt?: string;
}

export interface CalendarEntry {
  id: string;
  date: string;
  title: string;
  kind: 'plan' | 'date' | 'note';
  author: Role;
  icon?: string;
}

export type ReflectionSignal =
  | 'connection'
  | 'support'
  | 'space'
  | 'low-energy'
  | 'friction';

export interface ReflectionEntry {
  id: string;
  author: Role;
  date: string;
  text: string;
  signals: ReflectionSignal[];
  scoreFeedback?: number;
  actionCompleted?: boolean;
  createdAt: string;
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
  account: { email: string | null; name: string | null };
  onboarding: {
    answers: Record<string, OnboardingAnswer>;
    skipped: string[];
    completed: boolean;
  };
  partner: {
    joined: boolean;
    answers: Record<string, OnboardingAnswer>;
    inviteCode: string | null;
  };
  demo: { currentDay: number; simulatedDate?: string; role: Role };
  sharing: { paused: boolean };
  savedPlans: SavedPlan[];
  scoreActionCompletions: ScoreActionCompletion[];
  cycleLogs: CycleLogEntry[];
  sharedItems: SharedItem[];
  calendarEntries: CalendarEntry[];
  reflectionEntries: ReflectionEntry[];
  logs: LogEntry[];
  reflections: Reflection[];
  /**
   * Single slot, not a queue. Assignment replaces whatever was showing, so
   * stepping 3 -> 4 -> 5 quickly cannot stack banners.
   */
  notification: ActiveNotification | null;
}
