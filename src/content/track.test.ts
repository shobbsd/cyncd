import { describe, expect, it } from 'vitest';
import { buildCycleLog } from './track';

describe('buildCycleLog', () => {
  it('makes a complete, date-addressed private log record', () => {
    expect(
      buildCycleLog('2026-09-07', {
        period: 'start',
        flow: 'medium',
        mood: 'Low',
        energy: 'Low',
        pain: 'Mild',
        sleep: 'Poor',
        stress: 'High',
        physicalSymptoms: ['Cramps'],
        emotionalSymptoms: ['Sensitive'],
        libido: 'Low',
        notes: 'Would like a quiet evening.',
      }),
    ).toEqual({
      id: 'cycle-2026-09-07',
      date: '2026-09-07',
      period: 'start',
      flow: 'medium',
      mood: 'Low',
      energy: 'Low',
      pain: 'Mild',
      sleep: 'Poor',
      stress: 'High',
      physicalSymptoms: ['Cramps'],
      emotionalSymptoms: ['Sensitive'],
      libido: 'Low',
      notes: 'Would like a quiet evening.',
    });
  });
});
