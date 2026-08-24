import type {
  ChipId,
  LogEntry,
  OutputType,
  Role,
  CyncdState,
} from '../content';
import { clampDay, getDay } from '../content';
import { initialState, resolveTransientFlow } from './persistence';

export type Action =
  | { type: 'startSignup' }
  | { type: 'submitSignup'; email: string }
  | { type: 'answerOnboarding'; id: string; value: string }
  | { type: 'skipOnboarding'; id: string }
  | { type: 'finishOnboarding' }
  | { type: 'advanceFlow' }
  | { type: 'simulatePartnerJoin' }
  | { type: 'answerPartnerOnboarding'; id: string; value: string }
  | { type: 'completePartnerOnboarding' }
  | { type: 'continueWithoutPartner' }
  | { type: 'setRole'; role: Role }
  | { type: 'setDay'; day: number }
  | { type: 'stepDay'; delta: number }
  | { type: 'togglePauseSharing' }
  | { type: 'savePlan'; day: number; text: string; share?: boolean }
  | { type: 'sharePlan'; id: string }
  | {
      type: 'addLog';
      chip: ChipId | null;
      outputType: OutputType | 'reflection';
      text: string;
      rating?: number;
    }
  | { type: 'addReflection'; accuracy: number; mood?: string }
  | { type: 'dismissNotification' }
  | { type: 'clearNotification' }
  | { type: 'reset' }
  /**
   * Replaces the whole state with what came back from storage.
   *
   * Native storage is async, so unlike the web build the store cannot hydrate
   * inside `useReducer`'s initialiser — it mounts on `initialState()` and this
   * lands a moment later. `state` has already been through `reconcile`.
   */
  | { type: 'hydrate'; state: CyncdState };

/**
 * Ids are derived from the highest existing suffix rather than from a module
 * counter, so they stay unique across a reload — a counter would restart at 1
 * and collide with everything already persisted.
 */
function nextId(prefix: string, existing: { id: string }[]): string {
  const highest = existing.reduce((max, item) => {
    const parsed = Number.parseInt(item.id.slice(prefix.length + 1), 10);
    return Number.isFinite(parsed) && parsed > max ? parsed : max;
  }, 0);
  return `${prefix}-${highest + 1}`;
}

function planKey(day: number, text: string): string {
  return `${day}|${text}`;
}

/** Fake, and only ever displayed. Nothing resolves it. */
function makeInviteCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `cyncd-${code}`;
}

/** The banner for a given day. Assignment, never a queue. */
function notificationFor(day: number): CyncdState['notification'] {
  const content = getDay(day).notification;
  return {
    id: content.id,
    day: content.day,
    text: content.text,
    target: content.target,
  };
}

function withDay(state: CyncdState, day: number): CyncdState {
  const next = clampDay(day);
  if (next === state.demo.currentDay) return state;
  return {
    ...state,
    demo: { ...state.demo, currentDay: next },
    // Replaces whatever was showing, so stepping 3 -> 4 -> 5 quickly cannot stack.
    notification: state.flow === 'app' ? notificationFor(next) : null,
  };
}

function enterApp(state: CyncdState): CyncdState {
  return {
    ...state,
    flow: 'app',
    notification: notificationFor(state.demo.currentDay),
  };
}

export function reducer(state: CyncdState, action: Action): CyncdState {
  switch (action.type) {
    case 'startSignup':
      return { ...state, flow: 'signup' };

    case 'submitSignup':
      // No validation by design — the field is a prop in the demo.
      return {
        ...state,
        account: { email: action.email.trim() || null },
        flow: 'onboarding',
      };

    case 'answerOnboarding':
      return {
        ...state,
        onboarding: {
          ...state.onboarding,
          answers: { ...state.onboarding.answers, [action.id]: action.value },
          skipped: state.onboarding.skipped.filter((id) => id !== action.id),
        },
      };

    case 'skipOnboarding': {
      const { [action.id]: _dropped, ...answers } = state.onboarding.answers;
      return {
        ...state,
        onboarding: {
          ...state.onboarding,
          answers,
          skipped: state.onboarding.skipped.includes(action.id)
            ? state.onboarding.skipped
            : [...state.onboarding.skipped, action.id],
        },
      };
    }

    case 'finishOnboarding':
      return {
        ...state,
        onboarding: { ...state.onboarding, completed: true },
        flow: 'learning',
      };

    case 'advanceFlow': {
      if (state.flow === 'learning') {
        return {
          ...state,
          flow: 'invite',
          partner: {
            ...state.partner,
            inviteCode: state.partner.inviteCode ?? makeInviteCode(),
          },
        };
      }
      if (state.flow === 'paired') return enterApp(state);
      return state;
    }

    case 'simulatePartnerJoin':
      return { ...state, flow: 'partnerOnboarding' };

    case 'answerPartnerOnboarding':
      return {
        ...state,
        partner: {
          ...state.partner,
          answers: { ...state.partner.answers, [action.id]: action.value },
        },
      };

    case 'completePartnerOnboarding':
      return {
        ...state,
        partner: { ...state.partner, joined: true },
        flow: 'paired',
      };

    case 'continueWithoutPartner':
      return enterApp(state);

    case 'setRole':
      return { ...state, demo: { ...state.demo, role: action.role } };

    case 'setDay':
      return withDay(state, action.day);

    case 'stepDay':
      return withDay(state, state.demo.currentDay + action.delta);

    case 'togglePauseSharing':
      return { ...state, sharing: { paused: !state.sharing.paused } };

    case 'savePlan': {
      const existing = state.savedPlans.find(
        (plan) =>
          planKey(plan.day, plan.text) === planKey(action.day, action.text),
      );
      if (existing) {
        // Saving the same card twice is a no-op; sending it later upgrades it.
        if (!action.share || existing.shared) return state;
        return {
          ...state,
          savedPlans: state.savedPlans.map((plan) =>
            plan.id === existing.id ? { ...plan, shared: true } : plan,
          ),
        };
      }
      return {
        ...state,
        savedPlans: [
          ...state.savedPlans,
          {
            id: nextId('plan', state.savedPlans),
            day: action.day,
            text: action.text,
            sharedBy: state.demo.role,
            shared: action.share === true,
          },
        ],
      };
    }

    case 'sharePlan':
      return {
        ...state,
        savedPlans: state.savedPlans.map((plan) =>
          plan.id === action.id ? { ...plan, shared: true } : plan,
        ),
      };

    case 'addLog': {
      const day = getDay(state.demo.currentDay);
      const entry: LogEntry = {
        id: nextId('log', state.logs),
        date: new Date().toISOString(),
        day: day.day,
        dayType: day.dayType,
        chip: action.chip,
        outputType: action.outputType,
        text: action.text,
        ...(action.rating === undefined ? {} : { rating: action.rating }),
      };
      return { ...state, logs: [entry, ...state.logs] };
    }

    case 'addReflection': {
      const day = getDay(state.demo.currentDay);
      const reflection = {
        id: nextId('reflection', state.reflections),
        day: day.day,
        accuracy: action.accuracy,
        ...(action.mood === undefined ? {} : { mood: action.mood }),
      };
      // A reflection is also a timeline entry, so Reflect writes both at once.
      const entry: LogEntry = {
        id: nextId('log', state.logs),
        date: new Date().toISOString(),
        day: day.day,
        dayType: day.dayType,
        chip: null,
        outputType: 'reflection',
        text: action.mood
          ? `Reflection — ${action.mood.toLowerCase()}`
          : 'Reflection',
        rating: action.accuracy,
      };
      return {
        ...state,
        reflections: [reflection, ...state.reflections],
        logs: [entry, ...state.logs],
      };
    }

    case 'dismissNotification':
    case 'clearNotification':
      return state.notification === null
        ? state
        : { ...state, notification: null };

    case 'reset':
      return initialState();

    case 'hydrate':
      return action.state;

    default:
      return state;
  }
}

export { resolveTransientFlow };
