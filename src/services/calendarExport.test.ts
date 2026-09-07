import { describe, expect, it } from 'vitest';
import { toIcsEvent } from './calendarExport';

describe('toIcsEvent', () => {
  it('creates a plain all-day ICS event from a shared calendar entry', () => {
    expect(
      toIcsEvent({
        id: 'date-night',
        date: '2026-09-07',
        title: 'Date night',
        kind: 'date',
        author: 'shanice',
      }),
    ).toContain('BEGIN:VCALENDAR');
  });
});
