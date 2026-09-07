import { describe, expect, it } from 'vitest';
import { interpretReflection } from './reflection';

describe('interpretReflection', () => {
  it('maps transparent local keywords to non-clinical signals', () => {
    expect(interpretReflection('We went for dinner and felt connected.')).toEqual([
      'connection',
    ]);
    expect(interpretReflection('We were both tired and argued.')).toEqual([
      'low-energy',
      'friction',
    ]);
  });
});
