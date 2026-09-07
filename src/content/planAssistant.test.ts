import { describe, expect, it } from 'vitest';
import { answerPlanQuestion } from './planAssistant';

describe('answerPlanQuestion', () => {
  it('answers plan questions locally using the public outlook', () => {
    expect(
      answerPlanQuestion('Would Friday or Saturday be better?', {
        publicScoreOutlook: [
          { date: '2026-09-04', label: 'Gently connected' },
          { date: '2026-09-05', label: 'Naturally aligned' },
        ],
        calendarEntries: [],
        activeSharedItems: [],
      }),
    ).toContain('Saturday');
  });

  it('declines questions it cannot answer locally', () => {
    expect(
      answerPlanQuestion('Anything unsafe', {
        publicScoreOutlook: [],
        calendarEntries: [],
        activeSharedItems: [],
      }),
    ).toContain('Try asking about a date, dinner, a quiet night, or a weekend');
  });
});
