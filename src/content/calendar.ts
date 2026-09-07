import type { CalendarEntry } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** A stable Sunday-first six-week grid, including days from adjacent months. */
export function calendarDaysForMonth(month: string): string[] {
  if (!/^\d{4}-\d{2}$/.test(month)) return [];
  const first = new Date(`${month}-01T12:00:00.000Z`);
  if (Number.isNaN(first.getTime())) return [];
  const start = new Date(first.getTime() - first.getUTCDay() * DAY_MS);
  return Array.from({ length: 42 }, (_, index) =>
    formatIsoDate(new Date(start.getTime() + index * DAY_MS)),
  );
}

/** An assistant suggestion is keyed by its own id, so saving it twice edits. */
export function upsertCalendarSuggestion(
  entries: CalendarEntry[],
  suggestion: CalendarEntry,
): CalendarEntry[] {
  return [
    suggestion,
    ...entries.filter((entry) => entry.id !== suggestion.id),
  ];
}
