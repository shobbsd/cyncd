import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  ActiveNotification,
  Flow,
  LogEntry,
  Reflection,
  SavedPlan,
  CyncdState,
  TabId,
} from '../content';
import { FIRST_DAY, clampDay } from '../content';

// The key deliberately carries no version — `version` inside the blob is the
// real gate, and two places to keep in step is one too many.
export const STORAGE_KEY = 'cyncd.demo';

/**
 * Bumped whenever a shape change would make an older persisted blob wrong.
 * A mismatch resets to a clean demo rather than half-loading.
 *
 * 2: the roles were renamed from alex/sam to shanice/darnell. A v1 blob would
 * otherwise fall through the role check and silently land on the primary user,
 * so a demo left mid-run as the partner would come back as the wrong person.
 * 3: Phase 1 changes onboarding data and validates persisted flow values.
 */
export const SCHEMA_VERSION = 3;

const FLOW_IDS: Flow[] = [
  'splash',
  'signup',
  'onboarding',
  'learning',
  'invite',
  'partnerOnboarding',
  'paired',
  'app',
];

function isFlow(value: unknown): value is Flow {
  return typeof value === 'string' && FLOW_IDS.includes(value as Flow);
}

export function initialState(): CyncdState {
  return {
    version: SCHEMA_VERSION,
    flow: 'splash',
    account: { email: null },
    onboarding: { answers: {}, skipped: [], completed: false },
    partner: { joined: false, answers: {}, inviteCode: null },
    demo: { currentDay: FIRST_DAY, role: 'shanice' },
    sharing: { paused: false },
    savedPlans: [],
    logs: [],
    reflections: [],
    notification: null,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Dropping a malformed record is the right recovery, but doing it silently is
 * not: the demo would come back with saved plans or log entries simply missing
 * and nothing to say why. Warn rather than error — this is a successful
 * recovery, not a broken guarantee.
 */
function keepValid<T>(
  field: string,
  value: unknown,
  guard: (item: unknown) => item is T,
): T[] {
  if (!Array.isArray(value)) {
    if (value !== undefined) {
      console.warn(`cyncd: stored ${field} was not a list; ignoring it.`);
    }
    return [];
  }
  const kept = value.filter(guard);
  if (kept.length !== value.length) {
    console.warn(
      `cyncd: dropped ${value.length - kept.length} malformed ${field} record(s) from storage.`,
    );
  }
  return kept;
}

function isSavedPlan(value: unknown): value is SavedPlan {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.day === 'number' &&
    typeof value.text === 'string' &&
    (value.sharedBy === 'shanice' || value.sharedBy === 'darnell') &&
    typeof value.shared === 'boolean'
  );
}

function isLogEntry(value: unknown): value is LogEntry {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.date === 'string' &&
    typeof value.day === 'number' &&
    typeof value.dayType === 'string' &&
    typeof value.outputType === 'string' &&
    typeof value.text === 'string'
  );
}

function isReflection(value: unknown): value is Reflection {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.day === 'number' &&
    typeof value.accuracy === 'number'
  );
}

function isActiveNotification(value: unknown): value is ActiveNotification {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.day === 'number' &&
    typeof value.text === 'string' &&
    TAB_IDS.includes(value.target as TabId)
  );
}

const TAB_IDS: TabId[] = ['today', 'partner', 'plan', 'reflect'];

/**
 * Reconciles a persisted blob against the current shape.
 *
 * Deliberately forgiving on missing keys and strict on the version: a demo that
 * white-screens because storage went stale is the worst failure this app has,
 * since it happens in front of an audience and Reset is the only way out. A
 * missing field falls back to its initial value; a version mismatch, a parse
 * failure or a non-object blob starts clean.
 */
export function reconcile(raw: unknown): CyncdState {
  const base = initialState();
  if (!isRecord(raw) || raw.version !== SCHEMA_VERSION) return base;

  const demo = isRecord(raw.demo) ? raw.demo : {};
  const onboarding = isRecord(raw.onboarding) ? raw.onboarding : {};
  const partner = isRecord(raw.partner) ? raw.partner : {};
  const sharing = isRecord(raw.sharing) ? raw.sharing : {};
  const account = isRecord(raw.account) ? raw.account : {};

  const state: CyncdState = {
    ...base,
    flow: isFlow(raw.flow) ? raw.flow : base.flow,
    account: {
      email: typeof account.email === 'string' ? account.email : null,
    },
    onboarding: {
      answers: isRecord(onboarding.answers)
        ? (onboarding.answers as Record<string, string>)
        : {},
      skipped: Array.isArray(onboarding.skipped)
        ? (onboarding.skipped as string[])
        : [],
      completed: onboarding.completed === true,
    },
    partner: {
      joined: partner.joined === true,
      answers: isRecord(partner.answers)
        ? (partner.answers as Record<string, string>)
        : {},
      inviteCode:
        typeof partner.inviteCode === 'string' ? partner.inviteCode : null,
    },
    demo: {
      currentDay: clampDay(
        typeof demo.currentDay === 'number' ? demo.currentDay : FIRST_DAY,
      ),
      role: demo.role === 'darnell' ? 'darnell' : 'shanice',
    },
    sharing: { paused: sharing.paused === true },
    // Element-level checks, not a blanket cast. A single malformed record is
    // enough to break a render, and dropping it is always better than a white
    // screen mid-demo — which is the whole reason `version` exists.
    savedPlans: keepValid('savedPlans', raw.savedPlans, isSavedPlan),
    logs: keepValid('logs', raw.logs, isLogEntry),
    reflections: keepValid('reflections', raw.reflections, isReflection),
    notification: isActiveNotification(raw.notification)
      ? raw.notification
      : null,
  };

  return resolveTransientFlow(state);
}

/**
 * `learning` and `cyncd` are timed screens driven by an animation that only
 * exists while the app is mounted. Rehydrating into one would strand the demo on
 * a screen with nothing to advance it, so they resolve forward on load.
 */
export function resolveTransientFlow(state: CyncdState): CyncdState {
  if (state.flow === 'learning') return { ...state, flow: 'invite' };
  if (state.flow === 'paired') return { ...state, flow: 'app' };
  return state;
}

/**
 * The subset of AsyncStorage this module needs.
 *
 * Declared rather than imported so the reconcile tests can drive an in-memory
 * double without pulling the native module into Node. Every method is async —
 * that is the one real difference from the web build, and it is why the store
 * hydrates in an effect instead of in `useReducer`'s initialiser.
 */
export interface AsyncKeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export async function load(
  storage: AsyncKeyValueStore = AsyncStorage,
): Promise<CyncdState> {
  try {
    const raw = await storage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    return reconcile(JSON.parse(raw));
  } catch {
    // Unparseable or unreadable storage. Start clean rather than throw.
    return initialState();
  }
}

export async function save(
  state: CyncdState,
  storage: AsyncKeyValueStore = AsyncStorage,
): Promise<void> {
  try {
    await storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // The app still works in memory, but "relaunch preserves state" is now
    // false and nothing on screen would say so. A check that cannot do what it
    // was asked has to say so rather than quietly agree.
    console.error(
      'cyncd: could not persist state — a relaunch will lose it.',
      error,
    );
  }
}

export async function clear(
  storage: AsyncKeyValueStore = AsyncStorage,
): Promise<void> {
  try {
    await storage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing useful to do here.
  }
}
