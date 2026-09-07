import type { CalendarEntry, SharedItem } from './types';

export interface PlanAssistantContext {
  publicScoreOutlook: { date: string; label: string }[];
  calendarEntries: CalendarEntry[];
  activeSharedItems: SharedItem[];
}

const FALLBACK = 'Try asking about a date, dinner, a quiet night, or a weekend.';

/**
 * Local, deliberately narrow planning help. Its input contains public timing,
 * calendar entries, and explicitly shared notes—never logs or private text.
 */
export function answerPlanQuestion(
  question: string,
  context: PlanAssistantContext,
): string {
  const lower = question.toLowerCase();
  if (/friday|saturday|weekend/.test(lower)) {
    const best = context.publicScoreOutlook.find(
      (day) => day.label === 'Naturally aligned',
    );
    if (best !== undefined) {
      const weekday = new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        timeZone: 'UTC',
      }).format(new Date(`${best.date}T12:00:00.000Z`));
      return `${weekday} looks like the easiest option for connection. Keep it simple and check you both still feel up for it.`;
    }
  }
  if (/quiet|home|low.?key/.test(lower)) {
    return 'A quiet plan at home looks like a good fit. Leave room to change it if either of you needs space.';
  }
  if (/date|dinner|plan/.test(lower)) {
    return 'Pick one small plan, add it to your shared calendar, and keep the invitation easy to decline or adjust.';
  }
  return FALLBACK;
}
