import { describe, expect, it, vi } from 'vitest';
import { PRIVACY_NOTE, ROLE_NAMES } from '../content';
import {
  SCHEMA_VERSION,
  STORAGE_KEY,
  initialState,
  load,
  reconcile,
  resolveTransientFlow,
  save,
  type AsyncKeyValueStore,
} from './persistence';

/**
 * The async equivalent of the jsdom `localStorage` the web build tested
 * against. Passed in explicitly rather than installed on a global, because the
 * module now takes its store as an argument — which is the whole reason the
 * native port did not need a mock of the native module.
 */
function memoryStore(seed?: Record<string, string>): AsyncKeyValueStore {
  const map = new Map<string, string>(Object.entries(seed ?? {}));
  return {
    getItem: async (key) => map.get(key) ?? null,
    setItem: async (key, value) => void map.set(key, value),
    removeItem: async (key) => void map.delete(key),
  };
}

describe('reconcile', () => {
  it('starts clean on a version mismatch', () => {
    const stale = {
      ...initialState(),
      version: SCHEMA_VERSION - 1,
      flow: 'app' as const,
    };
    expect(reconcile(stale)).toEqual(initialState());
  });

  it('starts clean on a non-object blob', () => {
    expect(reconcile('nope')).toEqual(initialState());
    expect(reconcile(null)).toEqual(initialState());
    expect(reconcile([1, 2, 3])).toEqual(initialState());
  });

  it('fills in missing keys rather than half-loading', () => {
    const partial = {
      version: SCHEMA_VERSION,
      flow: 'app',
      demo: { currentDay: 4 },
    };
    const state = reconcile(partial);
    expect(state.flow).toBe('app');
    expect(state.demo).toEqual({
      currentDay: 4,
      simulatedDate: '2026-08-28',
      role: 'shanice',
    });
    expect(state.onboarding).toEqual({
      answers: {},
      skipped: [],
      completed: false,
    });
    expect(state.savedPlans).toEqual([]);
    expect(state.notification).toBeNull();
  });

  it('clamps a persisted day back into the scripted week', () => {
    expect(
      reconcile({ version: SCHEMA_VERSION, demo: { currentDay: 99 } }).demo
        .currentDay,
    ).toBe(7);
    expect(
      reconcile({ version: SCHEMA_VERSION, demo: { currentDay: 0 } }).demo
        .currentDay,
    ).toBe(1);
    expect(
      reconcile({ version: SCHEMA_VERSION, demo: { currentDay: 'four' } }).demo
        .currentDay,
    ).toBe(1);
  });

  it('rejects an unknown role', () => {
    expect(
      reconcile({ version: SCHEMA_VERSION, demo: { role: 'nobody' } }).demo
        .role,
    ).toBe('shanice');
    expect(
      reconcile({ version: SCHEMA_VERSION, demo: { role: 'darnell' } }).demo
        .role,
    ).toBe('darnell');
  });

  it('rejects an unknown stored flow instead of returning a blank shell', () => {
    expect(
      reconcile({ version: SCHEMA_VERSION, flow: 'no-longer-a-flow' }).flow,
    ).toBe(initialState().flow);
  });
});

describe('the role rename', () => {
  it('resets a v1 blob rather than landing the partner on the wrong person', () => {
    // v1 stored role as 'alex' | 'sam'. Without the version bump this falls
    // through the role check and comes back as the primary user, so a demo left
    // mid-run as the partner would silently return as someone else.
    const v1 = {
      version: 1,
      flow: 'app',
      demo: { currentDay: 5, role: 'sam' },
      sharing: { paused: true },
    };
    expect(reconcile(v1)).toEqual(initialState());
  });

  it('names the partner in the privacy note', () => {
    expect(PRIVACY_NOTE).toContain(ROLE_NAMES.darnell);
    expect(PRIVACY_NOTE).not.toMatch(/\bSam\b/);
  });

  it('defaults to the primary user', () => {
    expect(initialState().demo.role).toBe('shanice');
    expect(
      reconcile({ version: SCHEMA_VERSION, demo: { role: 'nobody' } }).demo
        .role,
    ).toBe('shanice');
  });
});

describe('transient flow states', () => {
  // A refresh during a timed screen would otherwise land on a screen with
  // nothing to advance it.
  it('resolves learning forward to invite', () => {
    expect(
      resolveTransientFlow({ ...initialState(), flow: 'learning' }).flow,
    ).toBe('invite');
  });

  it('resolves paired forward to app', () => {
    expect(
      resolveTransientFlow({ ...initialState(), flow: 'paired' }).flow,
    ).toBe('app');
  });

  it('leaves every other flow state alone', () => {
    for (const flow of [
      'splash',
      'signup',
      'onboarding',
      'invite',
      'partnerOnboarding',
      'app',
    ] as const) {
      expect(resolveTransientFlow({ ...initialState(), flow }).flow).toBe(flow);
    }
  });

  it('applies on load, not only in memory', async () => {
    const store = memoryStore();
    await save({ ...initialState(), flow: 'learning' }, store);
    expect((await load(store)).flow).toBe('invite');
  });
});

describe('load', () => {
  it('returns a clean demo when nothing is stored', async () => {
    expect(await load(memoryStore())).toEqual(initialState());
  });

  it('survives unparseable storage instead of throwing', async () => {
    const store = memoryStore({ [STORAGE_KEY]: '{ not json' });
    expect(await load(store)).toEqual(initialState());
  });

  it('round-trips a real state', async () => {
    const store = memoryStore();
    const state = {
      ...initialState(),
      flow: 'app' as const,
      demo: {
        currentDay: 5,
        simulatedDate: '2026-08-29',
        role: 'darnell' as const,
      },
      sharing: { paused: true },
    };
    await save(state, store);
    expect(await load(store)).toEqual(state);
  });

  it('starts clean when the read itself rejects', async () => {
    const failing: AsyncKeyValueStore = {
      getItem: () => Promise.reject(new Error('storage unavailable')),
      setItem: async () => {},
      removeItem: async () => {},
    };
    expect(await load(failing)).toEqual(initialState());
  });
});

describe('malformed records', () => {
  it('drops a bad entry instead of keeping a record that would break a render', () => {
    const state = reconcile({
      version: SCHEMA_VERSION,
      savedPlans: [
        {
          id: 'plan-1',
          day: 1,
          text: 'Walk',
          sharedBy: 'shanice',
          shared: false,
        },
        { id: 'plan-2', day: 1 }, // no text — would render blank or throw
        'nonsense',
      ],
      logs: [{ id: 'log-1', day: 1 }],
      reflections: [{ id: 'reflection-1', day: 1, accuracy: 3 }],
    });
    expect(state.savedPlans).toHaveLength(1);
    expect(state.logs).toEqual([]);
    expect(state.reflections).toHaveLength(1);
  });

  it('drops a notification with an unroutable target', () => {
    const bad = reconcile({
      version: SCHEMA_VERSION,
      notification: { id: 'n-d1', day: 1, text: 'Hello', target: 'nowhere' },
    });
    expect(bad.notification).toBeNull();

    const good = reconcile({
      version: SCHEMA_VERSION,
      notification: { id: 'n-d1', day: 1, text: 'Hello', target: 'plan' },
    });
    expect(good.notification?.target).toBe('plan');
  });

  it('replaces a non-array collection rather than trusting it', () => {
    const state = reconcile({
      version: SCHEMA_VERSION,
      logs: 'lots',
      savedPlans: {},
    });
    expect(state.logs).toEqual([]);
    expect(state.savedPlans).toEqual([]);
  });

  it('drops malformed score action completion entries', () => {
    const state = reconcile({
      version: SCHEMA_VERSION,
      scoreActionCompletions: [
        { date: '2026-08-25', completedBy: 'shanice' },
        { date: '25-08-2026', completedBy: 'shanice' },
        { date: '2026-08-26', completedBy: 'nobody' },
      ],
    });
    expect(state.scoreActionCompletions).toEqual([
      { date: '2026-08-25', completedBy: 'shanice' },
    ]);
  });
});

describe('silent recoveries are not silent', () => {
  // A recovery nobody can see is indistinguishable from nothing having gone
  // wrong. Both of these used to swallow.
  it('warns when a malformed record is dropped, naming the field and the count', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    reconcile({
      version: SCHEMA_VERSION,
      savedPlans: [
        {
          id: 'plan-1',
          day: 1,
          text: 'Walk',
          sharedBy: 'shanice',
          shared: false,
        },
        { id: 'plan-2', day: 1 },
        'nonsense',
      ],
    });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('dropped 2 malformed savedPlans');
    warn.mockRestore();
  });

  it('warns when a stored collection is not a list at all', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    reconcile({ version: SCHEMA_VERSION, logs: 'lots' });
    expect(warn.mock.calls.map((call) => call[0]).join(' ')).toContain(
      'logs was not a list',
    );
    warn.mockRestore();
  });

  it('stays quiet when nothing was dropped', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    reconcile({ version: SCHEMA_VERSION, logs: [], savedPlans: [] });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('errors when a write fails, because "relaunch preserves state" just became false', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const failing: AsyncKeyValueStore = {
      getItem: async () => null,
      setItem: () => Promise.reject(new Error('quota exceeded')),
      removeItem: async () => {},
    };

    await expect(save(initialState(), failing)).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledTimes(1);
    expect(error.mock.calls[0][0]).toContain('could not persist state');
    error.mockRestore();
  });
});
