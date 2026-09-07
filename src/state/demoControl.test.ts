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

  it('does not place the switch in the operating system status-bar area', () => {
    const source = readFileSync(
      new URL('../components/DemoBar.tsx', import.meta.url),
      'utf8',
    );
    const barBlock = source.match(
      /demobar:\s*{([\s\S]*?)\n  },\n  toggle:/,
    )?.[1];

    expect(barBlock).not.toMatch(/position:\s*'absolute'/);
  });
});
