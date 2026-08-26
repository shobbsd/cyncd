import { createContext, useContext } from 'react';
import type {
  ChipId,
  CoachChip,
  CoachNode,
  CyncdState,
  Role,
  TabId,
} from '../content';
import type { Derived } from './derived';

export interface Actions {
  startSignup(): void;
  submitSignup(email: string): void;
  answerOnboarding(id: string, value: string): void;
  skipOnboarding(id: string): void;
  /** Last onboarding screen -> the "Learning your patterns" animation. */
  finishOnboarding(): void;
  /** Moves a transient screen forward: learning -> invite, paired -> app. */
  advanceFlow(): void;
  simulatePartnerJoin(): void;
  answerPartnerOnboarding(id: string, value: string): void;
  completePartnerOnboarding(): void;
  continueWithoutPartner(): void;
  setRole(role: Role): void;
  setDay(day: number): void;
  stepDay(delta: number): void;
  togglePauseSharing(): void;
  savePlan(input: { day: number; text: string; share?: boolean }): void;
  sharePlan(id: string): void;
  completeScoreAction(date: string): void;
  addReflection(accuracy: number, mood?: string): void;
  dismissNotification(): void;
  /** Clears the banner and returns where to navigate. */
  openNotification(): TabId | null;
  resetDemo(): void;
}

export interface Coach {
  chips: CoachChip[];
  /** The chip whose conversation is open, if any. */
  chip: ChipId | null;
  node: CoachNode | null;
  open(chip: ChipId): void;
  /** Call when the typing animation for a `say` node finishes. */
  advance(): void;
  choose(index: number): void;
  save(): void;
  send(): void;
  close(): void;
}

export interface CyncdContextValue {
  state: CyncdState;
  actions: Actions;
  derived: Derived;
  coach: Coach;
  /**
   * False until the stored blob has been read back.
   *
   * Native storage is async, so for the first tick `state` is the placeholder
   * `initialState()` rather than what the user left behind. Anything that would
   * look wrong for a moment — the splash deciding where to send someone, a
   * screen keyed off `flow` — should wait on this.
   */
  hydrated: boolean;
}

export const CyncdContext = createContext<CyncdContextValue | null>(null);

export function useCyncd(): CyncdContextValue {
  const value = useContext(CyncdContext);
  if (value === null) {
    throw new Error('useCyncd must be used inside <CyncdProvider>');
  }
  return value;
}
