import { describe, expect, it } from 'vitest';
import { forecastFor } from './forecast';

describe('forecastFor', () => {
  it('invites a first log when no private prediction is available', () => {
    expect(forecastFor({ kind: 'unavailable' })).toMatchObject({
      title: 'Your forecast will take shape here',
      action: 'Log your first period',
    });
  });
});
