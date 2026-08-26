import { describe, expect, it } from 'vitest';
import {
  DAYS,
  STARTER_NOTE,
  bestEveningDay,
  weekdayFor,
  type CyncdState,
} from '../content';
import { derive } from './derived';
import { initialState } from './persistence';
import { reducer } from './reducer';

function joined(overrides: Partial<CyncdState> = {}): CyncdState {
  return {
    ...initialState(),
    flow: 'app',
    partner: { joined: true, answers: {}, inviteCode: 'cyncd-ABC234' },
    ...overrides,
  };
}

describe('partnerTabState', () => {
  it('asks for an invite until the partner has joined', () => {
    expect(derive(initialState()).partnerTabState).toBe('invite');
  });

  it('shows guidance once joined', () => {
    expect(derive(joined()).partnerTabState).toBe('guidance');
  });

  it('shows the paused state to Darnell only', () => {
    const paused = joined({ sharing: { paused: true } });
    expect(
      derive({ ...paused, demo: { currentDay: 1, role: 'darnell' } })
        .partnerTabState,
    ).toBe('paused');
    expect(
      derive({ ...paused, demo: { currentDay: 1, role: 'shanice' } })
        .partnerTabState,
    ).toBe('guidance');
  });

  it('keeps Shanice’s view and flags the notice, so the toggle that paused it stays reachable', () => {
    const paused = joined({ sharing: { paused: true } });
    expect(
      derive({ ...paused, demo: { currentDay: 1, role: 'shanice' } })
        .sharingPausedNotice,
    ).toBe(true);
    expect(
      derive({ ...paused, demo: { currentDay: 1, role: 'darnell' } })
        .sharingPausedNotice,
    ).toBe(false);
  });

  it('prefers the invite prompt over the paused state when the partner never joined', () => {
    const state = { ...initialState(), sharing: { paused: true } };
    expect(
      derive({ ...state, demo: { currentDay: 1, role: 'darnell' } })
        .partnerTabState,
    ).toBe('invite');
  });
});

describe('skipped onboarding', () => {
  it('still shows the day’s guidance, with a starter note instead of a blank state', () => {
    const skipped = reducer(
      { ...initialState(), flow: 'app' },
      { type: 'skipOnboarding', id: 'sleep' },
    );
    const derived = derive(skipped);
    expect(derived.hasOnboarding).toBe(false);
    expect(derived.starterNote).toBe(STARTER_NOTE);
    expect(derived.today.todayGuidance).not.toBe('');
  });

  it('drops the note as soon as anything is answered', () => {
    const answered = reducer(initialState(), {
      type: 'answerOnboarding',
      id: 'sleep',
      value: 'Late',
    });
    expect(derive(answered).starterNote).toBeNull();
    expect(derive(answered).hasOnboarding).toBe(true);
  });
});

describe('score and phase guidance', () => {
  const scoreReady = joined({
    onboarding: {
      answers: {
        cycleStart: '2026-08-01',
        cycleLength: '~28 days',
        support: 'Space',
        communication: 'Need time first',
        energy: 'Fairly steady',
        social: 'At home',
      },
      skipped: [],
      completed: true,
    },
    partner: {
      joined: true,
      inviteCode: 'cyncd-ABC234',
      answers: {
        support: 'Space',
        communication: 'Need time first',
        energy: 'Moderate',
        social: 'At home',
      },
    },
  });

  it('derives the same shared score for both perspectives', () => {
    const shanice = derive(scoreReady);
    const darnell = derive({
      ...scoreReady,
      demo: { currentDay: 1, role: 'darnell' },
    });

    expect(shanice.score).toEqual(darnell.score);
    expect(shanice.guidance.kind).toBe('phase');
    expect(shanice.scoreHistory).toHaveLength(7);
  });

  it('uses trait guidance without a cycle date', () => {
    expect(derive(joined()).guidance.kind).toBe('trait');
  });

  it('never includes private cycle details in partner-facing score output', () => {
    const partnerScore = derive({
      ...scoreReady,
      demo: { currentDay: 1, role: 'darnell' },
    }).partnerScore;

    expect(JSON.stringify(partnerScore)).not.toMatch(
      /cycle|period|follicular|ovulatory|luteal|symptom/i,
    );
  });

  it('raises the current score after the action is completed', () => {
    const before = derive(scoreReady).score.percentage;
    const completed = reducer(scoreReady, {
      type: 'completeScoreAction',
      date: '2026-08-25',
    });
    expect(derive(completed).score.percentage).toBeGreaterThan(before);
  });
});

describe('plan shortlist', () => {
  it('shows three of the day’s pool, not all five', () => {
    const derived = derive(joined());
    expect(derived.planSuggestions).toHaveLength(3);
    expect(derived.today.plans).toHaveLength(5);
  });

  it('offers one of each setting on every day, never the same shape seven times', () => {
    // The pool is stored [home, home, out, out, either], so slicing the first
    // three gave home/home/out on all seven days and day type never entered it.
    for (const day of DAYS) {
      const plans = derive({
        ...joined(),
        demo: { currentDay: day.day, role: 'shanice' },
      }).planSuggestions;
      expect(plans.map((plan) => plan.setting).sort()).toEqual([
        'either',
        'home',
        'out',
      ]);
      for (const plan of plans) expect(plan.day).toBe(day.day);
    }
  });

  it('leads with what the day type calls for', () => {
    const leadOn = (day: number) =>
      derive({ ...joined(), demo: { currentDay: day, role: 'shanice' } })
        .planSuggestions[0];

    // Social: the spec's own verbatim suggestion, not buried under two stay-ins.
    expect(leadOn(3).title).toBe('Nice night to go out — dinner then a walk');
    // The connection day leads with the date night it is framed around.
    expect(leadOn(7).title).toBe('Relaxed date night');
    // Low energy leads with staying in; so does the sensitive day.
    expect(leadOn(2).setting).toBe('home');
    expect(leadOn(6).setting).toBe('home');
    expect(leadOn(4).setting).toBe('home');
    // The focused day leads with the decision it is good for.
    expect(leadOn(5).title).toBe('Book the thing you keep talking about');
  });

  it('keeps a sent plan visible while sharing is paused', () => {
    // Pausing gates guidance only — a plan already sent is not taken back.
    const sent = reducer(joined(), {
      type: 'savePlan',
      day: 1,
      text: 'Walk and a coffee',
      share: true,
    });
    const paused = reducer(sent, { type: 'togglePauseSharing' });
    expect(
      derive({ ...paused, demo: { currentDay: 1, role: 'darnell' } })
        .sharedPlans,
    ).toHaveLength(1);
  });
});

describe('week overview', () => {
  it('reports the whole scripted week and its best evening', () => {
    const derived = derive(joined());
    expect(derived.weekStrip).toEqual([
      'calm',
      'lowEnergy',
      'social',
      'calm',
      'focused',
      'lowEnergy',
      'calm',
    ]);
    expect(derived.bestEvening).toBe(
      'Saturday looks like your best evening this week.',
    );
  });

  it('never suggests an evening whose own guidance says to keep plans light', () => {
    // The weekday is an anchor, not a hardcoded string, precisely so this holds.
    // Day 6 is the Saturday-shaped candidate in a Monday-anchored week and it is
    // a Low Energy day that tells you to suggest one simple option and give
    // space — recommending a date night there is the app arguing with itself.
    const best = bestEveningDay();
    expect(best.dayType).not.toBe('lowEnergy');
    expect(best.sensitive).toBe(false);
    expect(derive(joined()).bestEvening).toContain(weekdayFor(best.day));
  });
});
