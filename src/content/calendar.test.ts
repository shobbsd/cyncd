import { describe, expect, it } from 'vitest';
import { calendarDaysForMonth, upsertCalendarSuggestion } from './calendar';

describe('calendar helpers', () => {
  it('builds a stable six-week month grid', () => {
    expect(calendarDaysForMonth('2026-09')).toHaveLength(42);
  });

  it('does not duplicate an idempotent suggestion', () => {
    const suggestion = {
      id: 'plan-2026-09-05-dinner',
      date: '2026-09-05',
      title: 'Dinner',
      kind: 'plan' as const,
      author: 'shanice' as const,
    };
    expect(
      upsertCalendarSuggestion(upsertCalendarSuggestion([], suggestion), suggestion),
    ).toEqual([suggestion]);
  });
});
