import { describe, expect, it } from 'vitest';
import { toShareCardInput } from './scoreShare';

describe('toShareCardInput', () => {
  it('allows only the public score card fields through', () => {
    const input = toShareCardInput({
      percentage: 72,
      label: 'Gently connected',
      line: 'A warm public line.',
      action: 'Make time for a walk.',
    });
    expect(input).toEqual({
      percentage: 72,
      label: 'Gently connected',
      line: 'A warm public line.',
      action: 'Make time for a walk.',
    });
    expect(JSON.stringify(input)).not.toMatch(/cycle|period|symptom|notes|feedback|reflection/i);
  });
});
