import { describe, expect, it } from 'vitest';
import { tabForRole, tabsForRole } from './tabs';

describe('role-aware tabs', () => {
  it('shows the private Forecast tab only to Shanice', () => {
    expect(tabsForRole('shanice').map(({ id }) => id)).toContain('forecast');
    expect(tabsForRole('darnell').map(({ id }) => id)).not.toContain(
      'forecast',
    );
  });

  it('rejects a destination unavailable to the current role', () => {
    expect(tabForRole('darnell', 'forecast')).toBeNull();
    expect(tabForRole('shanice', 'forecast')).toBe('forecast');
  });
});
