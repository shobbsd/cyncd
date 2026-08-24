import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import { CyncdProvider, useCyncd } from './index';

function mount() {
  window.localStorage.clear();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <CyncdProvider>{children}</CyncdProvider>
  );
  const hook = renderHook(() => useCyncd(), { wrapper });
  // Straight to the tabs — the flow itself is covered by the reducer tests.
  act(() => hook.result.current.actions.continueWithoutPartner());
  return hook;
}

describe('coach chips', () => {
  it('offers the support tip to Darnell only', () => {
    const { result } = mount();
    expect(result.current.coach.chips.map((chip) => chip.id)).not.toContain(
      'supportTip',
    );
    act(() => result.current.actions.setRole('darnell'));
    expect(result.current.coach.chips.map((chip) => chip.id)).toContain(
      'supportTip',
    );
  });
});

describe('Plan tonight — the spec’s scripted scenario', () => {
  it('runs opener -> question -> Home/Out/Either -> three options -> save', () => {
    const { result } = mount();
    act(() => result.current.actions.setDay(2)); // a Low Energy day

    act(() => result.current.coach.open('planTonight'));
    const intro = result.current.coach.node;
    expect(intro).toMatchObject({
      kind: 'say',
      messages: [
        'Got it. Tonight looks better for something low-effort and cosy.',
        'Want 3 options based on your usual vibe?',
      ],
    });

    // Pacing is the UI's; the walk only moves when the animation says so.
    act(() => result.current.coach.advance());
    const pick = result.current.coach.node;
    expect(pick?.kind).toBe('choice');
    expect(
      pick?.kind === 'choice' && pick.options.map((option) => option.label),
    ).toEqual(['Home', 'Out', 'Either']);

    act(() => result.current.coach.choose(0));
    const summary = result.current.coach.node;
    expect(summary?.kind).toBe('summary');
    expect(summary?.kind === 'summary' && summary.lines).toHaveLength(3);

    act(() => result.current.coach.save());
    expect(result.current.state.logs[0]).toMatchObject({
      day: 2,
      dayType: 'lowEnergy',
      chip: 'planTonight',
      outputType: 'plan',
      text: 'Plan suggestion saved',
    });
    expect(result.current.state.savedPlans[0]).toMatchObject({
      day: 2,
      shared: false,
    });
  });

  it('draws its options from the same day the Plan tab shows', () => {
    const { result } = mount();
    act(() => result.current.actions.setDay(3)); // Social
    act(() => result.current.coach.open('planTonight'));
    act(() => result.current.coach.advance());
    act(() => result.current.coach.choose(1)); // Out

    const summary = result.current.coach.node;
    const lines = summary?.kind === 'summary' ? summary.lines : [];
    const dayTitles = result.current.derived.today.plans.map(
      (plan) => plan.title,
    );
    for (const line of lines) expect(dayTitles).toContain(line);
  });

  it('gives day 7 its own copy rather than day 1’s', () => {
    // Both are plain Calm days, so a day-type-keyed graph would collapse them —
    // and day 7 is the connection day, where day 1's copy reads wrong.
    const { result } = mount();
    const optionsOn = (day: number) => {
      act(() => result.current.actions.setDay(day));
      act(() => result.current.coach.open('planTonight'));
      act(() => result.current.coach.advance());
      act(() => result.current.coach.choose(1));
      const node = result.current.coach.node;
      const lines = node?.kind === 'summary' ? node.lines : [];
      act(() => result.current.coach.close());
      return lines;
    };
    expect(optionsOn(7)).not.toEqual(optionsOn(1));
  });
});

describe('Support tip — the spec’s scripted scenario', () => {
  it('offers the low-energy approach and both tone variants verbatim', () => {
    const { result } = mount();
    act(() => result.current.actions.setRole('darnell'));
    act(() => result.current.actions.setDay(2));

    act(() => result.current.coach.open('supportTip'));
    act(() => result.current.coach.advance());
    expect(result.current.coach.node?.kind).toBe('choice');

    act(() => result.current.coach.choose(1)); // Warm
    const warm = result.current.coach.node;
    expect(warm?.kind === 'summary' && warm.sendableMessage).toBe(
      'Want a chilled night? I can handle dinner — no pressure to do anything.',
    );

    act(() => result.current.coach.send());
    expect(result.current.state.logs[0]).toMatchObject({
      chip: 'supportTip',
      outputType: 'message',
      text: 'Support message saved',
    });
    // A message is not a plan, so nothing lands in Shared plans.
    expect(result.current.state.savedPlans).toEqual([]);
  });
});

describe('Talk better — the spec’s scripted scenario', () => {
  it('gives the soft-start framework, then a topic, then an example sentence', () => {
    const { result } = mount();
    act(() => result.current.coach.open('talkBetter'));
    const intro = result.current.coach.node;
    expect(intro?.kind === 'say' && intro.messages.join(' ')).toContain(
      'what you noticed, how it felt, what you would like',
    );

    act(() => result.current.coach.advance());
    const topics = result.current.coach.node;
    expect(
      topics?.kind === 'choice' && topics.options.map((option) => option.label),
    ).toEqual(['Money', 'Plans', 'Intimacy', 'Family', 'Other']);

    act(() => result.current.coach.choose(0));
    const summary = result.current.coach.node;
    expect(summary?.kind === 'summary' && summary.sendableMessage).toContain(
      'I noticed',
    );
    expect(summary?.kind === 'summary' && summary.outputType).toBe('framework');
  });
});

describe('coach session lifecycle', () => {
  it('ignores advance on a choice node and choose on a say node', () => {
    const { result } = mount();
    act(() => result.current.coach.open('planTonight'));
    act(() => result.current.coach.choose(0));
    expect(result.current.coach.node?.kind).toBe('say');

    act(() => result.current.coach.advance());
    act(() => result.current.coach.advance());
    expect(result.current.coach.node?.kind).toBe('choice');
  });

  it('ignores an out-of-range choice rather than stranding the sheet', () => {
    const { result } = mount();
    act(() => result.current.coach.open('planTonight'));
    act(() => result.current.coach.advance());
    act(() => result.current.coach.choose(99));
    expect(result.current.coach.node?.kind).toBe('choice');
  });

  it('ends the conversation when the day changes underneath it', () => {
    const { result } = mount();
    act(() => result.current.coach.open('whyToday'));
    expect(result.current.coach.node).not.toBeNull();
    act(() => result.current.actions.stepDay(1));
    expect(result.current.coach.node).toBeNull();
    expect(result.current.coach.chip).toBeNull();
  });

  it('saves once when the same summary is saved twice', () => {
    const { result } = mount();
    act(() => result.current.coach.open('dateIdea'));
    act(() => result.current.coach.advance());
    act(() => result.current.coach.choose(0));
    act(() => result.current.coach.save());
    act(() => result.current.coach.save());
    expect(result.current.state.savedPlans).toHaveLength(1);
    // The log is an activity record, so a second Save is still an event.
    expect(result.current.state.logs).toHaveLength(2);
  });
});

describe('notifications', () => {
  it('hands back the deep-link target and clears the banner', () => {
    const { result } = mount();
    act(() => result.current.actions.setDay(2));
    expect(result.current.state.notification?.target).toBe('partner');

    let target: string | null = null;
    act(() => {
      target = result.current.actions.openNotification();
    });
    expect(target).toBe('partner');
    expect(result.current.state.notification).toBeNull();
  });

  it('returns null when there is nothing showing', () => {
    const { result } = mount();
    act(() => result.current.actions.dismissNotification());
    let target: string | null = 'unset';
    act(() => {
      target = result.current.actions.openNotification();
    });
    expect(target).toBeNull();
  });
});

describe('persistence across a remount', () => {
  beforeEach(() => window.localStorage.clear());

  it('keeps the demo where it was', () => {
    const first = mount();
    act(() => first.result.current.actions.setDay(5));
    act(() => first.result.current.actions.setRole('darnell'));
    first.unmount();

    const second = renderHook(() => useCyncd(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <CyncdProvider>{children}</CyncdProvider>
      ),
    });
    expect(second.result.current.state.demo).toEqual({
      currentDay: 5,
      role: 'darnell',
    });
    expect(second.result.current.state.flow).toBe('app');
  });

  it('returns to splash on reset', () => {
    const { result } = mount();
    act(() => result.current.actions.setDay(4));
    act(() => result.current.actions.resetDemo());
    expect(result.current.state.flow).toBe('splash');
    expect(result.current.state.demo.currentDay).toBe(1);

    // What matters is what a reload sees, not whether the key is absent — the
    // persistence effect writes the clean state straight back either way.
    const reloaded = renderHook(() => useCyncd(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <CyncdProvider>{children}</CyncdProvider>
      ),
    });
    expect(reloaded.result.current.state.flow).toBe('splash');
    expect(reloaded.result.current.derived.starterNote).not.toBeNull();
  });
});
