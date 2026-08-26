import { describe, expect, it } from 'vitest';
import { DAY_TYPES, TABS, getCoachEntry, getDay, type Role } from '../content';
import { SCHEMA_VERSION, STORAGE_KEY, initialState } from './persistence';

/**
 * Pins the values that leave this repo's type graph.
 *
 * Everything else in the data layer is protected by `tsc -b`: rename a field
 * and every consumer fails to compile. These do not have that protection,
 * because the things depending on them are strings read at runtime — the
 * browser QA harness reads the persisted blob out of `localStorage`, and a
 * persisted blob written by an earlier build is matched on `version`.
 *
 * This is not a hypothetical. Taking `STORAGE_KEY` from `cyncd.demo.v1` to
 * `cyncd.demo` alongside the v2 bump silently disarmed the QA harness's
 * deep-link assertion: its hardcoded key read `null`, and the assertion skipped
 * itself rather than failing. The gate stayed green over a genuinely broken
 * navigation path. The change was right; making it without it being visible to
 * anyone downstream was not.
 *
 * So these are deliberately hardcoded twice. Changing one means editing this
 * file too, which puts the change in the diff as an intentional act and makes
 * it something to announce rather than something to discover.
 */
describe('values consumed outside the type graph', () => {
  it('pins the storage key and schema version', () => {
    expect(STORAGE_KEY).toBe('cyncd.demo');
    expect(SCHEMA_VERSION).toBe(4);
  });

  it('pins the role ids', () => {
    const roles: Role[] = ['shanice', 'darnell'];
    expect(roles).toContain(initialState().demo.role);
    expect(initialState().demo.role).toBe('shanice');
  });

  it('pins the tab ids, which are deep-link targets', () => {
    expect(TABS.map((tab) => tab.id)).toEqual([
      'today',
      'partner',
      'plan',
      'reflect',
    ]);
    // Every day's banner has to route somewhere that exists.
    for (let day = 1; day <= 7; day += 1) {
      expect(TABS.map((tab) => tab.id)).toContain(
        getDay(day).notification.target,
      );
    }
  });

  it('pins the day types and the coach entry id format', () => {
    expect(DAY_TYPES).toEqual(['calm', 'lowEnergy', 'social', 'focused']);
    // The id shape is load-bearing for anything selecting a node by name.
    expect(getCoachEntry('planTonight', getDay(3))).toBe(
      'planTonight:d3:intro',
    );
  });
});
