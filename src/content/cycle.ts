import type {
  CycleOutlookDay,
  CycleLogEntry,
  CyclePhase,
  CyclePrediction,
  CycleSeed,
} from './types';

const DEFAULT_CYCLE_LENGTH = 28;
const MIN_CYCLE_LENGTH = 20;
const MAX_CYCLE_LENGTH = 45;
const DAY_MS = 24 * 60 * 60 * 1000;

function parseIsoDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
    ? null
    : date;
}

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function phaseFor(cycleDay: number, cycleLength: number): CyclePhase {
  if (cycleDay <= 5) return 'period';
  if (cycleDay < cycleLength - 13) return 'follicular';
  if (cycleDay <= cycleLength - 12) return 'ovulatory';
  return 'luteal';
}

function normaliseCycleDay(elapsedDays: number, cycleLength: number): number {
  return ((elapsedDays % cycleLength) + cycleLength) % cycleLength + 1;
}

function validCycleLength(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= MIN_CYCLE_LENGTH &&
    value <= MAX_CYCLE_LENGTH
  );
}

export function predictCycle(
  seed: CycleSeed,
  simulatedDate: string,
  logs: CycleLogEntry[] = [],
): CyclePrediction {
  const currentDate = parseIsoDate(simulatedDate);
  const loggedStart = logs
    .filter(
      (entry) =>
        entry.period === 'start' &&
        parseIsoDate(entry.date) !== null &&
        currentDate !== null &&
        entry.date <= simulatedDate,
    )
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const periodStart = parseIsoDate(loggedStart?.date ?? seed.lastPeriodStart);
  const cycleLength = seed.cycleLength ?? DEFAULT_CYCLE_LENGTH;

  if (!periodStart || !currentDate || !validCycleLength(cycleLength)) {
    return { kind: 'unavailable' };
  }

  const elapsedDays = Math.round(
    (currentDate.getTime() - periodStart.getTime()) / DAY_MS,
  );
  const cycleDay = normaliseCycleDay(elapsedDays, cycleLength);
  const phase = phaseFor(cycleDay, cycleLength);
  const nextPeriodStart = formatIsoDate(
    addDays(currentDate, cycleLength - cycleDay + 1),
  );
  const outlook: CycleOutlookDay[] = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(currentDate, index);
    const outlookCycleDay = normaliseCycleDay(elapsedDays + index, cycleLength);
    return {
      date: formatIsoDate(date),
      cycleDay: outlookCycleDay,
      phase: phaseFor(outlookCycleDay, cycleLength),
    };
  });

  return { kind: 'predicted', cycleDay, phase, nextPeriodStart, outlook };
}
