import type { ReflectionSignal } from './types';

const SIGNAL_RULES: { signal: ReflectionSignal; words: string[] }[] = [
  { signal: 'connection', words: ['connected', 'connection', 'close', 'together'] },
  { signal: 'support', words: ['supported', 'helped', 'kind', 'cared'] },
  { signal: 'space', words: ['space', 'alone', 'quiet', 'time to myself'] },
  { signal: 'low-energy', words: ['tired', 'exhausted', 'drained', 'low energy'] },
  { signal: 'friction', words: ['argued', 'argument', 'tense', 'friction'] },
];

/**
 * A small, documented keyword map—not a model or a diagnosis. The caller
 * keeps the original text private and can explain every signal it shows.
 */
export function interpretReflection(text: string): ReflectionSignal[] {
  const lower = text.toLowerCase();
  return SIGNAL_RULES.filter(({ words }) =>
    words.some((word) => lower.includes(word)),
  ).map(({ signal }) => signal);
}

export function acknowledgementFor(signals: ReflectionSignal[]): string {
  if (signals.includes('connection')) return 'It sounds like you found a moment of connection.';
  if (signals.includes('friction')) return 'That sounds like it took some care today.';
  if (signals.includes('low-energy')) return 'It sounds like energy was limited today.';
  if (signals.includes('support')) return 'It sounds like support mattered today.';
  if (signals.includes('space')) return 'It sounds like a little space mattered today.';
  return 'Thank you for taking a moment to reflect.';
}
