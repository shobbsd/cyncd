// @ts-expect-error Vitest runs this Node-only source-contract check.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Demo control touch target', () => {
  it('keeps the partner-view switch reachable on touch devices', () => {
    const source = readFileSync(
      new URL('../components/DemoBar.tsx', import.meta.url),
      'utf8',
    );

    const toggleBlock = source.match(
      /toggle:\s*{([\s\S]*?)\n  },\n  toggleLabel:/,
    )?.[1];

    expect(toggleBlock).toMatch(/minHeight:\s*tap/);
  });
});
