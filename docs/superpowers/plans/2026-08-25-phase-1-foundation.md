# cyncd Phase 1 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Phase 1 foundation: audience-aware content safety, approved onboarding datasets, persisted-flow recovery, and a deterministic cycle model.

**Architecture:** Content safety remains an executable boundary for shared strings. A pure `predictCycle()` function derives a discriminated result from optional onboarding seed data and an ISO date. Persistence continues resetting version mismatches but validates a current-version flow value.

**Tech Stack:** TypeScript, Expo SDK 57, Vitest, React Native AsyncStorage.

---

## File structure

- `src/content/content-rules.test.ts` — shared/global vocabulary policy and onboarding data assertions.
- `src/content/onboarding.ts` — approved question datasets.
- `src/content/types.ts` — cycle contract types.
- `src/content/cycle.ts` — pure UTC date calculation.
- `src/content/cycle.test.ts` — cycle contract tests.
- `src/content/index.ts` — cycle export.
- `src/state/persistence.ts` — schema v3 and flow guard.
- `src/state/persistence.test.ts`, `src/state/contract.test.ts` — persistence and external-contract coverage.

### Task 1: Scope the content safety policy

**Files:**
- Modify: `src/content/content-rules.test.ts:19-100`
- Test: `src/content/content-rules.test.ts`

- [ ] **Step 1: Write the failing policy assertions**

Replace the current `BANNED` declaration with:

```ts
const BANNED_EVERYWHERE = [
  'bad day', 'low compatibility', 'relationship risk', 'difficult phase',
  'hormonal behaviour', 'she may be emotional', 'avoid her today',
  'streak', 'badge', 'you missed', "don't forget", 'keep it up',
]

const BANNED_IN_SHARED = [
  'hormone', 'hormonal', 'menstrual', 'ovulat', 'luteal', 'follicular', 'pms',
  'symptom', 'diagnos', 'medical', 'clinical', 'therapy', 'treatment', 'disorder',
  'chart', 'graph',
]
```

Rename `strings` to `sharedStrings`, keep it limited to `DAYS` and
`COACH_NODES`, and add:

```ts
it.each(BANNED_EVERYWHERE)('never uses %j on any current content surface', (term) => {
  expect(show(sharedStrings.filter((s) => s.value.toLowerCase().includes(term)))).toEqual([])
})
it.each(BANNED_IN_SHARED)('never uses %j on a shared surface', (term) => {
  expect(show(sharedStrings.filter((s) => s.value.toLowerCase().includes(term)))).toEqual([])
})
it('never references cycle language on a shared surface', () => {
  expect(show(sharedStrings.filter((s) => /\bcycle/i.test(s.value)))).toEqual([])
})
```

Delete `VERBATIM` and its parameterized test. Leave the existing no-data
numbers test intact.

- [ ] **Step 2: Run the test before implementation**

Run: `npm test -- src/content/content-rules.test.ts`

Expected: FAIL until the old one-list policy and verbatim assertion are replaced.

- [ ] **Step 3: Implement the policy from Step 1**

Private Forecast/Track strings are not introduced in this slice, so do not add
a synthetic private fixture. The change establishes the shared boundary they
will be tested against. Keep `score` allowed.

- [ ] **Step 4: Run the focused test**

Run: `npm test -- src/content/content-rules.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/content/content-rules.test.ts
git commit -m "test: scope content rules by audience"
```

### Task 2: Replace onboarding data with the approved questions

**Files:**
- Modify: `src/content/onboarding.ts:12-83`
- Modify: `src/content/content-rules.test.ts`
- Test: `src/content/content-rules.test.ts`

- [ ] **Step 1: Write a failing exact-data test**

Import `ONBOARDING_QUESTIONS` and `PARTNER_QUESTIONS`. Add:

```ts
it('uses the approved onboarding question ids and counts', () => {
  expect(ONBOARDING_QUESTIONS.map((question) => question.id)).toEqual([
    'energy', 'support', 'communication', 'social', 'cycleStart', 'cycleLength', 'routine',
  ])
  expect(PARTNER_QUESTIONS.map((question) => question.id)).toEqual([
    'energy', 'communication', 'support', 'social', 'misunderstandings',
  ])
})
```

- [ ] **Step 2: Confirm the test fails**

Run: `npm test -- src/content/content-rules.test.ts`

Expected: FAIL because the current sets contain the retired static questions.

- [ ] **Step 3: Implement the exact question datasets**

Replace `ONBOARDING_QUESTIONS` with:

```ts
export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  { id: 'energy', prompt: 'How does your energy usually change across the month?', options: ['Fairly steady', 'Some ups and downs', 'Big swings'] },
  { id: 'support', prompt: "When you're feeling stretched, what usually helps?", options: ['Space', 'Reassurance', 'Practical help'] },
  { id: 'communication', prompt: 'When something comes up between you, what do you prefer?', options: ['Talk it through soon', 'Need time first', 'Depends on the day'] },
  { id: 'social', prompt: 'How do you usually like to spend a free evening?', options: ['At home', 'Out', 'Depends'] },
  { id: 'cycleStart', prompt: 'When did your last period start? This stays private and helps personalise your forecast.', options: [], kind: 'date' },
  { id: 'cycleLength', prompt: 'How long is your cycle usually?', options: ['~28 days', 'Shorter', 'Longer', 'Varies', 'Not sure'] },
  { id: 'routine', prompt: 'When do you usually have time together?', options: ['Weekdays', 'Weekends', 'Varies'] },
]
```

Replace `PARTNER_QUESTIONS` with:

```ts
export const PARTNER_QUESTIONS: OnboardingQuestion[] = [
  { id: 'energy', prompt: 'How would you describe your usual energy?', options: ['Low', 'Moderate', 'High'] },
  { id: 'communication', prompt: 'When something comes up, what do you prefer?', options: ['Talk immediately', 'Need time first'] },
  { id: 'support', prompt: 'How do you usually support your partner?', options: ['Talk', 'Space', 'Practical help'] },
  { id: 'social', prompt: 'How do you like to spend a free evening?', options: ['At home', 'Out', 'Depends'] },
  { id: 'misunderstandings', prompt: 'What causes most misunderstandings between you?', options: ['Timing', 'Communication', 'Energy'] },
]
```

Retain `cycleStart` to preserve its persisted answer ID. Do not change
`QuestionFlow`; all questions are already skippable and date support exists.

- [ ] **Step 4: Extend the test to assert the full objects, then run it**

Run: `npm test -- src/content/content-rules.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/content/onboarding.ts src/content/content-rules.test.ts
git commit -m "feat: update phase 1 onboarding questions"
```

### Task 3: Add a pure deterministic cycle prediction

**Files:**
- Modify: `src/content/types.ts:1-150`
- Create: `src/content/cycle.ts`
- Create: `src/content/cycle.test.ts`
- Modify: `src/content/index.ts:1-8`

- [ ] **Step 1: Write failing tests**

Create `src/content/cycle.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { predictCycle } from './cycle'

describe('predictCycle', () => {
  it('returns unavailable without a valid period date', () => {
    expect(predictCycle({}, '2026-08-25')).toEqual({ kind: 'unavailable' })
    expect(predictCycle({ lastPeriodStart: 'not-a-date', cycleLength: 28 }, '2026-08-25')).toEqual({ kind: 'unavailable' })
  })

  it('derives a one-based cycle day and seven-day outlook', () => {
    const result = predictCycle({ lastPeriodStart: '2026-08-01', cycleLength: 28 }, '2026-08-25')
    expect(result).toMatchObject({ kind: 'predicted', cycleDay: 25, nextPeriodStart: '2026-08-29' })
    expect(result.kind === 'predicted' && result.outlook).toHaveLength(7)
  })

  it('normalises predictions into a new shorter cycle', () => {
    expect(predictCycle({ lastPeriodStart: '2026-08-01', cycleLength: 24 }, '2026-08-25'))
      .toMatchObject({ kind: 'predicted', cycleDay: 1, nextPeriodStart: '2026-09-18' })
  })

  it('keeps a longer cycle on its final day', () => {
    expect(predictCycle({ lastPeriodStart: '2026-08-01', cycleLength: 32 }, '2026-09-01'))
      .toMatchObject({ kind: 'predicted', cycleDay: 32, nextPeriodStart: '2026-09-02' })
  })
})
```

- [ ] **Step 2: Confirm the test fails**

Run: `npm test -- src/content/cycle.test.ts`

Expected: FAIL with no module at `./cycle`.

- [ ] **Step 3: Define the type contract**

Add to `src/content/types.ts`:

```ts
export type CyclePhase = 'period' | 'follicular' | 'ovulatory' | 'luteal'
export interface CycleSeed { lastPeriodStart?: string; cycleLength?: number }
export interface CycleOutlookDay { date: string; cycleDay: number; phase: CyclePhase }
export type CyclePrediction =
  | { kind: 'unavailable' }
  | { kind: 'predicted'; cycleDay: number; phase: CyclePhase; nextPeriodStart: string; outlook: CycleOutlookDay[] }
```

- [ ] **Step 4: Implement `src/content/cycle.ts`**

Use UTC date-only parsing, rejecting strings that do not round-trip as
`YYYY-MM-DD`. Accept only integer cycle lengths 20–45. Normalize elapsed days
with `((elapsed % cycleLength) + cycleLength) % cycleLength`, expose a
one-based day, and build seven consecutive dates. Use this internal phase rule:

```ts
function phaseFor(cycleDay: number, cycleLength: number): CyclePhase {
  if (cycleDay <= 5) return 'period'
  if (cycleDay < cycleLength - 13) return 'follicular'
  if (cycleDay <= cycleLength - 12) return 'ovulatory'
  return 'luteal'
}
```

Return `{ kind: 'unavailable' }` for invalid seed/date input. Export
`predictCycle` through `src/content/index.ts`.

- [ ] **Step 5: Run focused tests**

Run: `npm test -- src/content/cycle.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/content/types.ts src/content/cycle.ts src/content/cycle.test.ts src/content/index.ts
git commit -m "feat: add deterministic cycle prediction"
```

### Task 4: Validate persisted flow values

**Files:**
- Modify: `src/state/persistence.ts:20-160`
- Modify: `src/state/persistence.test.ts:20-95`
- Modify: `src/state/contract.test.ts:24-34`

- [ ] **Step 1: Add failing tests**

Add to the `reconcile` suite:

```ts
it('rejects an unknown stored flow instead of returning a blank shell', () => {
  expect(reconcile({ version: SCHEMA_VERSION, flow: 'no-longer-a-flow' }).flow)
    .toBe(initialState().flow)
})
```

Change the external contract assertion to `expect(SCHEMA_VERSION).toBe(3)`.

- [ ] **Step 2: Confirm the tests fail**

Run: `npm test -- src/state/persistence.test.ts src/state/contract.test.ts`

Expected: FAIL because flow is currently cast and the schema remains version 2.

- [ ] **Step 3: Implement the guard and bump**

Import `Flow` as a type. Set `SCHEMA_VERSION = 3`, then add:

```ts
const FLOW_IDS: Flow[] = [
  'splash', 'signup', 'onboarding', 'learning', 'invite',
  'partnerOnboarding', 'paired', 'app',
]
function isFlow(value: unknown): value is Flow {
  return typeof value === 'string' && FLOW_IDS.includes(value as Flow)
}
```

Replace the unsafe flow cast in `reconcile()` with:

```ts
flow: isFlow(raw.flow) ? raw.flow : base.flow,
```

Keep version mismatch reset and `resolveTransientFlow()` unchanged.

- [ ] **Step 4: Run focused tests**

Run: `npm test -- src/state/persistence.test.ts src/state/contract.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/state/persistence.ts src/state/persistence.test.ts src/state/contract.test.ts
git commit -m "fix: validate persisted flow values"
```

### Task 5: Verify the foundation

**Files:**
- Verify only: files changed in Tasks 1–4.

- [ ] **Step 1: Check the scope and whitespace**

Run:

```bash
git diff --check HEAD~4..HEAD
git status --short
```

Expected: no whitespace errors; the user-owned `docs/spec-2026-08-14.md`
remains unstaged and untouched.

- [ ] **Step 2: Run the required delivery gate**

Run: `npm run verify`

Expected: TypeScript exits 0 and the complete Vitest suite passes.

- [ ] **Step 3: Report precisely**

Report the changed files, schema version 3, the `unavailable` cycle fallback,
and the exact verification result. Do not claim Score, Forecast UI, tracking,
sharing, calendar, assistant, splash, or backend work.

