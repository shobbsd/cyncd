import type { CycleLogEntry } from './types';

export type CycleLogInput = Omit<CycleLogEntry, 'id' | 'date'>;

/**
 * A stable id makes a log an edit of one private calendar day, rather than a
 * second anonymous record for the same day. The reducer supplies the final
 * replacement guarantee.
 */
export function buildCycleLog(date: string, input: CycleLogInput): CycleLogEntry {
  return {
    id: `cycle-${date}`,
    date,
    ...input,
  };
}
