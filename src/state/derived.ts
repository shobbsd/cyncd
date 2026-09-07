import type {
  DayContent,
  DayType,
  CyclePrediction,
  ForecastView,
  LogEntry,
  PhaseGuidance,
  PlanSuggestion,
  SavedPlan,
  ScoreHistoryEntry,
  ScoreResult,
  SharedItem,
  SupportApproach,
  CyncdState,
} from '../content';
import {
  STARTER_NOTE,
  WEEK_STRIP,
  bestEveningSentence,
  calculateScore,
  forecastFor,
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
  /** Private to Shanice; the Partner tab only receives non-cycle guidance. */
  forecast: ForecastView;
  /** Never pass this to a shared or partner-facing view. */
  privateCycle: CyclePrediction;
  /** Active items deliberately shared by the current role. */
  sharedByMe: SharedItem[];
  /** Active items deliberately shared by the other role. */
  sharedWithMe: SharedItem[];
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

/**
 * Score input is intentionally numbers-only. Reflection text and signals stay
 * in the private reflection view and never cross into the calculation.
 */
function recentFeedback(state: CyncdState): number {
  const values = state.reflectionEntries
    .filter((entry) => entry.scoreFeedback !== undefined)
    .slice(0, 8)
    .map((entry) => (entry.scoreFeedback! - 1) * 25);
  if (values.length === 0) return 50;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function scoreForDate(state: CyncdState, date: string): ScoreResult {
  const cycle = predictCycle(
    {
      lastPeriodStart: state.onboarding.answers.cycleStart,
      cycleLength: cycleLengthFromAnswer(state.onboarding.answers.cycleLength),
    },
    date,
    state.cycleLogs,
  );
  return calculateScore({
    primaryAnswers: state.onboarding.answers,
    partnerAnswers: state.partner.answers,
    cycle,
    completedAction: state.scoreActionCompletions.some(
      (completion) => completion.date === date,
    ),
    accuracyFeedback: recentFeedback(state),
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
    state.cycleLogs,
  );
  const rawScore = scoreForDate(state, simulatedDate);
  const feedbackByRole = state.reflectionEntries.filter(
    (entry) => entry.scoreFeedback !== undefined,
  );
  const hasPersonalisedScore = (['shanice', 'darnell'] as const).every(
    (role) => feedbackByRole.filter((entry) => entry.author === role).length >= 4,
  );
  const score: ScoreResult = {
    ...rawScore,
    confidence: hasPersonalisedScore
      ? 'Your personalised cyncd Score.'
      : 'Today’s predicted cyncd Score.',
  };
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
  const activeSharedItems = state.sharedItems.filter(
    (item) => item.revokedAt === undefined,
  );

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
    forecast: forecastFor(cycle),
    privateCycle: cycle,
    sharedByMe: activeSharedItems.filter(
      (item) => item.author === state.demo.role,
    ),
    sharedWithMe: activeSharedItems.filter(
      (item) => item.author !== state.demo.role,
    ),
    score,
    partnerScore,
    scoreHistory,
  };
}
