import type {
  DayContent,
  DayType,
  LogEntry,
  PlanSuggestion,
  SavedPlan,
  SupportApproach,
  CyncdState,
} from '../content';
import {
  STARTER_NOTE,
  WEEK_STRIP,
  bestEveningSentence,
  getDay,
  preferredPlans,
} from '../content';

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
}

export function derive(state: CyncdState): Derived {
  const today = getDay(state.demo.currentDay);
  const answered = Object.keys(state.onboarding.answers).length > 0;

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
  };
}
