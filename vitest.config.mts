import { defineConfig } from 'vitest/config'

/**
 * Covers the content and state layers only — the parts that are plain
 * TypeScript with no React Native runtime behind them.
 *
 * Deliberately a `node` environment with no jsdom: nothing under test touches a
 * DOM any more, and the async storage interface is injected rather than reached
 * for globally (see `src/state/persistence.ts`). Screen and component tests
 * need the native renderer and belong under a separate jest-expo project.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'src/content/**/*.test.ts',
      'src/state/**/*.test.ts',
      'src/services/**/*.test.ts',
    ],
  },
})
