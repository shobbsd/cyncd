import type {
  DayContent,
  DayType,
  LogEntry,
  PhaseGuidance,
  PlanSuggestion,
  SavedPlan,
  ScoreHistoryEntry,
  ScoreResult,
  SupportApproach,
  CyncdState,
} from '../content';
import {
  STARTER_NOTE,
  WEEK_STRIP,
  bestEveningSentence,
  calculateScore,
  getDay,
  guidanceFor,
  predictCycle,
  preferredPlans,
} from '../content';

const DAY_MS = 24 * 60 * 60 * 1000;

/** What the Partner tab should render, for the role currently selected. */
export type PartnerTabState = 'invite' | 'paused' | 'guidance';

export interface Derived {
  today: DayContent;
  weekStrip: DayType[];
  bestEvening: string;
  /** Three of the day's pool, one per setting, led by what the day type calls for. */
  planSuggestions: PlanSuggestion[];
  partnerTabState: PartnerTabState;
  /**
   * True for Shanice while sharing is paused. Darnell gets the paused state; Shanice keeps
   * her view and the toggle, because she is the only one who can unpause and
   * hiding the control would read as the toggle being broken.
   */
  sharingPausedNotice: boolean;
  partnerFacing: {
    guidance: string;
    approach: SupportApproach;
    actions: string[];
  };
  hasOnboarding: boolean;
  /** Non-null only when onboarding was skipped end to end. */
  starterNote: string | null;
  /**
   * Every saved plan, shared or not. Pausing gates *guidance* only — a plan that
   * was explicitly sent stays visible to both roles, because taking a sent
   * message back out of someone's hands reads worse than the inconsistency.
   */
  sharedPlans: SavedPlan[];
  timeline: LogEntry[];
  simulatedDate: string;
  guidance: PhaseGuidance;
  score: ScoreResult;
  partnerScore: Pick<
    ScoreResult,
    'percentage' | 'band' | 'label' | 'line' | 'action' | 'confidence'
  >;
  scoreHistory: ScoreHistoryEntry[];
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  return new Date(date.getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

function cycleLengthFromAnswer(answer: string | undefined): number | undefined {
  if (answer === undefined) return undefined;
  if (answer === 'Shorter') return 24;
  if (answer === 'Longer') return 32;
  return 28;
}

function scoreForDate(state: CyncdState, date: string): ScoreResult {
  const cycle = predictCycle(
    {
      lastPeriodStart: state.onboarding.answers.cycleStart,
      cycleLength: cycleLengthFromAnswer(state.onboarding.answers.cycleLength),
    },
    date,
  );
  return calculateScore({
    primaryAnswers: state.onboarding.answers,
    partnerAnswers: state.partner.answers,
    cycle,
    completedAction: state.scoreActionCompletions.some(
      (completion) => completion.date === date,
    ),
  });
}

export function derive(state: CyncdState): Derived {
  const today = getDay(state.demo.currentDay);
  const answered = Object.keys(state.onboarding.answers).length > 0;
  const simulatedDate = state.demo.simulatedDate ?? '2026-08-25';
  const cycle = predictCycle(
    {
      lastPeriodStart: state.onboarding.answers.cycleStart,
      cycleLength: cycleLengthFromAnswer(state.onboarding.answers.cycleLength),
    },
    simulatedDate,
  );
  const score = scoreForDate(state, simulatedDate);
  const { components: _components, ...partnerScore } = score;
  const scoreHistory = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(simulatedDate, index - 6);
    const historicalScore = scoreForDate(state, date);
    return {
      date,
      percentage: historicalScore.percentage,
      label: historicalScore.label,
    };
  });

  return {
    today,
    weekStrip: WEEK_STRIP,
    bestEvening: bestEveningSentence(),
    planSuggestions: preferredPlans(today),
    partnerTabState: !state.partner.joined
      ? 'invite'
      : state.sharing.paused && state.demo.role === 'darnell'
        ? 'paused'
        : 'guidance',
    sharingPausedNotice: state.sharing.paused && state.demo.role === 'shanice',
    partnerFacing: {
      guidance: today.partnerGuidance,
      approach: today.supportApproach,
      actions: today.partnerActions,
    },
    hasOnboarding: answered,
    starterNote: answered ? null : STARTER_NOTE,
    sharedPlans: state.savedPlans,
    timeline: state.logs,
    simulatedDate,
    guidance: guidanceFor(cycle),
    score,
    partnerScore,
    scoreHistory,
  };
}
