import { describe, expect, it } from 'vitest';
import { getDay } from '../content';
import { derive } from './derived';
import { initialState } from './persistence';
import { reducer, type Action } from './reducer';

/** Applies a sequence of actions to a fresh demo. */
function run(...actions: Action[]) {
  return actions.reduce(reducer, initialState());
}

const TO_APP: Action[] = [
  { type: 'startSignup' },
  { type: 'submitSignup', email: 'shanice@example.com' },
  { type: 'answerOnboarding', id: 'sleep', value: 'Late' },
  { type: 'finishOnboarding' },
  { type: 'advanceFlow' },
  { type: 'simulatePartnerJoin' },
  { type: 'answerPartnerOnboarding', id: 'support', value: 'Space' },
  { type: 'completePartnerOnboarding' },
  { type: 'advanceFlow' },
];

describe('flow', () => {
  it('walks splash -> app in the order the spec lays out', () => {
    const flows = TO_APP.map(
      (_action, i) =>
        TO_APP.slice(0, i + 1).reduce(reducer, initialState()).flow,
    );
    expect(flows).toEqual([
      'signup',
      'onboarding',
      'onboarding',
      'learning',
      'invite',
      'partnerOnboarding',
      'partnerOnboarding',
      'paired',
      'app',
    ]);
  });

  it('generates an invite code once and keeps it stable', () => {
    const invite = run(...TO_APP.slice(0, 5));
    expect(invite.partner.inviteCode).toMatch(/^cyncd-[A-Z2-9]{6}$/);
    const again = reducer(reducer(invite, { type: 'simulatePartnerJoin' }), {
      type: 'advanceFlow',
    });
    expect(again.partner.inviteCode).toBe(invite.partner.inviteCode);
  });

  it('reaches the app without a partner, since the invite screen has no other exit', () => {
    const state = run(...TO_APP.slice(0, 5), {
      type: 'continueWithoutPartner',
    });
    expect(state.flow).toBe('app');
    expect(state.partner.joined).toBe(false);
    expect(derive(state).partnerTabState).toBe('invite');
  });

  it('ignores advanceFlow outside a transient screen', () => {
    const onboarding = run(
      { type: 'startSignup' },
      { type: 'submitSignup', email: 'a@b.c' },
    );
    expect(reducer(onboarding, { type: 'advanceFlow' })).toBe(onboarding);
  });
});

describe('onboarding answers', () => {
  it('treats skip and answer as mutually exclusive', () => {
    const skipped = run({ type: 'skipOnboarding', id: 'sleep' });
    expect(skipped.onboarding.skipped).toEqual(['sleep']);

    const answered = reducer(skipped, {
      type: 'answerOnboarding',
      id: 'sleep',
      value: 'Early',
    });
    expect(answered.onboarding.answers).toEqual({ sleep: 'Early' });
    expect(answered.onboarding.skipped).toEqual([]);

    const reskipped = reducer(answered, {
      type: 'skipOnboarding',
      id: 'sleep',
    });
    expect(reskipped.onboarding.answers).toEqual({});
    expect(reskipped.onboarding.skipped).toEqual(['sleep']);
  });

  it('does not record the same skip twice', () => {
    const state = run(
      { type: 'skipOnboarding', id: 'sleep' },
      { type: 'skipOnboarding', id: 'sleep' },
    );
    expect(state.onboarding.skipped).toEqual(['sleep']);
  });
});

describe('score action completion', () => {
  it('records the current role once per simulated date', () => {
    const completed = reducer(initialState(), {
      type: 'completeScoreAction',
      date: '2026-08-25',
    });
    expect(completed.scoreActionCompletions).toEqual([
      { date: '2026-08-25', completedBy: 'shanice' },
    ]);

    expect(
      reducer(completed, { type: 'completeScoreAction', date: '2026-08-25' }),
    ).toBe(completed);
  });
});

describe('private and shared records', () => {
  it('upserts a private cycle log by date', () => {
    const entry = {
      id: 'cycle-1',
      date: '2026-08-25',
      mood: 'Steady',
    };
    const once = reducer(initialState(), { type: 'upsertCycleLog', entry });
    const updated = reducer(once, {
      type: 'upsertCycleLog',
      entry: { ...entry, mood: 'Low-key' },
    });
    expect(updated.cycleLogs).toEqual([{ ...entry, mood: 'Low-key' }]);
  });

  it('lets an author revoke their own shared item', () => {
    const shared = reducer(initialState(), {
      type: 'createSharedItem',
      kind: 'note',
      body: 'A note for you',
      date: '2026-08-25',
    });
    const revoked = reducer(shared, {
      type: 'revokeSharedItem',
      id: shared.sharedItems[0].id,
      date: '2026-08-25',
    });
    expect(revoked.sharedItems[0].revokedAt).toBe('2026-08-25');
  });
});

describe('day stepper', () => {
  it('moves the simulated date rather than stopping after a scripted week', () => {
    const stepped = reducer(
      {
        ...initialState(),
        demo: {
          currentDay: 7,
          simulatedDate: '2026-08-25',
          role: 'shanice',
        },
      },
      { type: 'stepDay', delta: 1 },
    );
    expect(stepped.demo.simulatedDate).toBe('2026-08-26');
  });

  it('clamps at both ends of the scripted week', () => {
    const app = run(...TO_APP);
    expect(reducer(app, { type: 'setDay', day: 99 }).demo.currentDay).toBe(7);
    expect(reducer(app, { type: 'setDay', day: -3 }).demo.currentDay).toBe(1);
    expect(reducer(app, { type: 'stepDay', delta: -1 }).demo.currentDay).toBe(
      1,
    );
  });

  it('replaces the banner rather than stacking one per step', () => {
    const app = run(...TO_APP);
    const stepped = [1, 1, 1].reduce(
      (state, delta) => reducer(state, { type: 'stepDay', delta }),
      app,
    );
    expect(stepped.demo.currentDay).toBe(4);
    // A single slot: the notification is day 4's, and there is no trace of 2 or 3.
    expect(stepped.notification).toEqual({
      id: 'n-d4',
      day: 4,
      text: getDay(4).notification.text,
      target: 'partner',
    });
  });

  it('does not seed a banner before the app is reached', () => {
    const invite = run(...TO_APP.slice(0, 5));
    expect(reducer(invite, { type: 'setDay', day: 3 }).notification).toBeNull();
  });

  it('seeds the current day’s banner on entering the app', () => {
    expect(run(...TO_APP).notification?.day).toBe(1);
  });

  it('clears on dismiss', () => {
    const app = run(...TO_APP);
    expect(
      reducer(app, { type: 'dismissNotification' }).notification,
    ).toBeNull();
  });
});

describe('saved plans', () => {
  const app = run(...TO_APP);

  it('does not duplicate the same card saved twice', () => {
    const once = reducer(app, {
      type: 'savePlan',
      day: 1,
      text: 'Walk and a coffee',
    });
    const twice = reducer(once, {
      type: 'savePlan',
      day: 1,
      text: 'Walk and a coffee',
    });
    expect(twice.savedPlans).toHaveLength(1);
    expect(twice).toBe(once);
  });

  it('upgrades a saved plan to shared when it is sent', () => {
    const saved = reducer(app, {
      type: 'savePlan',
      day: 1,
      text: 'Walk and a coffee',
    });
    expect(saved.savedPlans[0].shared).toBe(false);
    const sent = reducer(saved, {
      type: 'savePlan',
      day: 1,
      text: 'Walk and a coffee',
      share: true,
    });
    expect(sent.savedPlans).toHaveLength(1);
    expect(sent.savedPlans[0].shared).toBe(true);
  });

  it('records who sent it', () => {
    const asSam = reducer(app, { type: 'setRole', role: 'darnell' });
    const sent = reducer(asSam, {
      type: 'savePlan',
      day: 1,
      text: 'Film night',
      share: true,
    });
    expect(sent.savedPlans[0].sharedBy).toBe('darnell');
  });

  it('keeps ids unique across a reload, where a counter would collide', () => {
    const two = [
      { type: 'savePlan', day: 1, text: 'One' } as const,
      { type: 'savePlan', day: 1, text: 'Two' } as const,
    ].reduce(reducer, app);
    // Ids are derived from the highest existing suffix, so a fresh session
    // continues the sequence instead of restarting it.
    const reloaded = reducer(
      { ...initialState(), savedPlans: two.savedPlans },
      {
        type: 'savePlan',
        day: 2,
        text: 'Three',
      },
    );
    expect(reloaded.savedPlans.map((plan) => plan.id)).toEqual([
      'plan-1',
      'plan-2',
      'plan-3',
    ]);
  });
});

describe('reflections', () => {
  it('writes a reflection and a timeline entry together', () => {
    const state = reducer(run(...TO_APP), {
      type: 'addReflection',
      accuracy: 4,
      mood: 'Tired',
    });
    expect(state.reflections).toEqual([
      { id: 'reflection-1', day: 1, accuracy: 4, mood: 'Tired' },
    ]);
    expect(state.logs).toHaveLength(1);
    expect(state.logs[0]).toMatchObject({
      day: 1,
      dayType: 'calm',
      chip: null,
      outputType: 'reflection',
      text: 'Reflection — tired',
      rating: 4,
    });
    expect(Number.isNaN(Date.parse(state.logs[0].date))).toBe(false);
  });

  it('omits mood when none was given', () => {
    const state = reducer(run(...TO_APP), {
      type: 'addReflection',
      accuracy: 2,
    });
    expect(state.reflections[0]).not.toHaveProperty('mood');
    expect(state.logs[0].text).toBe('Reflection');
  });
});

describe('reset', () => {
  it('returns to a clean splash', () => {
    const busy = [
      { type: 'savePlan', day: 1, text: 'Walk and a coffee' } as const,
      { type: 'addReflection', accuracy: 5 } as const,
      { type: 'togglePauseSharing' } as const,
    ].reduce(reducer, run(...TO_APP));
    expect(reducer(busy, { type: 'reset' })).toEqual(initialState());
  });
});
