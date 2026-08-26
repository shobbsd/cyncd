# cyncd Score and Phase Guidance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the rule-based cyncd Score plus phase-driven Today and Partner guidance while preserving all private cycle details.

**Architecture:** New pure content modules translate persisted onboarding answers and a simulated date into a Score, phase-safe guidance, and short derived history. A minimal persisted collection records only shared Score-action completion. Today uses a compact Score card; Partner uses the full form without exposing the cycle prediction.

**Tech Stack:** TypeScript, Expo SDK 57, React Native, AsyncStorage, Vitest.

---

## File structure

- `src/content/score.ts` and `src/content/score.test.ts` — deterministic percentage, bands, actions, and no-data behaviour.
- `src/content/phaseGuidance.ts` and `src/content/phaseGuidance.test.ts` — safe shared guidance keyed by phase and a trait fallback.
- `src/content/content-rules.test.ts` — shared-vocabulary lint coverage for the new authored strings.
- `src/content/types.ts`, `src/content/index.ts` — Score, guidance, and completion contracts.
- `src/state/reducer.ts`, `src/state/persistence.ts`, `src/state/*.test.ts` — safe shared action completion and schema v4.
- `src/state/derived.ts`, `src/state/derived.test.ts` — single simulated-date integration point and privacy boundary.
- `src/components/ScoreCard.tsx` — reusable compact/full Score presentation.
- `src/screens/Today.tsx`, `src/screens/Partner.tsx`, `src/app/index.tsx` — Score placement and Partner navigation.

### Task 1: Define the Score and guidance contracts with failing tests

**Files:**
- Create: `src/content/score.test.ts`
- Create: `src/content/phaseGuidance.test.ts`
- Modify: `src/content/types.ts`
- Modify: `src/content/index.ts`

- [ ] **Step 1: Write failing Score tests**

Create `src/content/score.test.ts` that imports `calculateScore` and
`scoreBandFor` from `./score`. Pin these boundaries:

```ts
expect(scoreBandFor(80).label).toBe('Naturally aligned')
expect(scoreBandFor(79).label).toBe('Gently connected')
expect(scoreBandFor(60).label).toBe('Gently connected')
expect(scoreBandFor(59).label).toBe('Different rhythms')
expect(scoreBandFor(40).label).toBe('Different rhythms')
expect(scoreBandFor(39).label).toBe('Extra-care day')
for (const percentage of [80, 60, 40, 39]) {
  expect(scoreBandFor(percentage).action).not.toBe('')
}
```

Add an input with empty answer records and `cycle: { kind: 'unavailable' }`,
asserting the approved confidence line and a percentage in 0–100. Add paired
answers twice, once with `completedAction: false` and once `true`, asserting
the completed result is greater and its `components.completedAction` is 100.

- [ ] **Step 2: Run the new Score suite**

Run: `npm test -- src/content/score.test.ts`

Expected: FAIL with no module at `./score`.

- [ ] **Step 3: Write failing phase-guidance tests**

Create `src/content/phaseGuidance.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { guidanceFor } from './phaseGuidance'

describe('guidanceFor', () => {
  it.each(['period', 'follicular', 'ovulatory', 'luteal'] as const)(
    'returns safe shared guidance for %s',
    (phase) => {
      const guidance = guidanceFor({ kind: 'predicted', phase })
      expect(guidance.todayGuidance).not.toBe('')
      expect(guidance.partnerGuidance).not.toBe('')
      expect(guidance.actions.length).toBeGreaterThan(0)
    },
  )

  it('returns trait guidance when the cycle is unavailable', () => {
    expect(guidanceFor({ kind: 'unavailable' }).kind).toBe('trait')
  })
})
```

- [ ] **Step 4: Run the phase-guidance suite**

Run: `npm test -- src/content/phaseGuidance.test.ts`

Expected: FAIL with no module at `./phaseGuidance`.

- [ ] **Step 5: Add the contracts**

Add these definitions to `src/content/types.ts`:

```ts
export type ScoreBand = 'naturallyAligned' | 'gentlyConnected' | 'differentRhythms' | 'extraCare'
export interface ScoreResult {
  percentage: number; band: ScoreBand; label: string; line: string; action: string
  confidence: string
  components: { communication: number; energyAndCapacity: number; completedAction: number; accuracyFeedback: number }
}
export interface ScoreHistoryEntry { date: string; percentage: number; label: string }
export interface PhaseGuidance {
  kind: 'phase' | 'trait'; dayType: DayType; label: string
  todayGuidance: string; partnerGuidance: string; reassurance: string; why: string
  approach: SupportApproach; actions: string[]
}
export interface ScoreActionCompletion { date: string; completedBy: Role }
```

Export the new modules from `src/content/index.ts`.

- [ ] **Step 6: Commit the test-first contracts**

```bash
git add src/content/types.ts src/content/index.ts src/content/score.test.ts src/content/phaseGuidance.test.ts
git commit -m "test: define score and phase guidance contracts"
```

### Task 2: Implement pure Score and phase guidance

**Files:**
- Create: `src/content/score.ts`
- Create: `src/content/phaseGuidance.ts`
- Test: `src/content/score.test.ts`, `src/content/phaseGuidance.test.ts`

- [ ] **Step 1: Implement bands and the deterministic score**

In `score.ts`, define all four bands with the exact required labels and lines:

```ts
const CONFIDENCE = 'Still learning — this becomes more personal as you both share feedback.'
const NEUTRAL = 50
const WEIGHTS = { communication: 0.4, energyAndCapacity: 0.3, completedAction: 0.2, accuracyFeedback: 0.1 }
```

Make `calculateScore()` accept both answer records, a `CyclePrediction`,
`completedAction`, and optional accuracy input. Use 50 for absent behaviour
or feedback. Communication gives full value when the primary support preference
matches the partner's support answer, then averages that with compatible
communication preferences. Energy/capacity averages social-preference match,
energy variation, and a phase modifier only when a phase is available. Clamp
every component and the weighted percentage to integers 0–100. The returned
object must never include the supplied cycle object or answer records.

- [ ] **Step 2: Implement phase-safe guidance**

In `phaseGuidance.ts`, store four `PhaseGuidance` records keyed by
`CyclePhase` plus one trait fallback. Use only shared-safe language: no cycle,
clinical, symptom, or score-ban vocabulary. Map the four phase records to the
existing palette hooks: period -> `lowEnergy`, follicular -> `focused`,
ovulatory -> `social`, luteal -> `calm`. `guidanceFor()` accepts only
`Pick<CyclePrediction, 'kind' | 'phase'>` and returns the trait record for
`unavailable`.

- [ ] **Step 3: Run both pure suites**

Run: `npm test -- src/content/score.test.ts src/content/phaseGuidance.test.ts`

Expected: PASS.

- [ ] **Step 4: Extend the shared-content lint**

Import `PHASE_GUIDANCE`, `TRAIT_GUIDANCE`, and `SCORE_BANDS` into
`src/content/content-rules.test.ts`, and append their collected string values to
`sharedStrings`. Add a targeted assertion that the four score-band actions are
non-empty. Run:

`npm test -- src/content/content-rules.test.ts src/content/score.test.ts src/content/phaseGuidance.test.ts`

Expected: PASS; the new shared copy is checked by the same clinical/cycle and
judgement safeguards as Today and Partner.

- [ ] **Step 5: Commit the pure content layer**

```bash
git add src/content/score.ts src/content/phaseGuidance.ts src/content/score.test.ts src/content/phaseGuidance.test.ts src/content/content-rules.test.ts
git commit -m "feat: add score and phase guidance"
```

### Task 3: Persist only Score action completion

**Files:**
- Modify: `src/content/types.ts`
- Modify: `src/state/reducer.ts`
- Modify: `src/state/persistence.ts`
- Modify: `src/state/persistence.test.ts`
- Modify: `src/state/reducer.test.ts`
- Modify: `src/state/contract.test.ts`

- [ ] **Step 1: Add failing state tests**

Add reducer tests showing `{ type: 'completeScoreAction', date: '2026-08-25' }`
creates exactly one entry with the current role, and remains idempotent on a
second tap. Add persistence tests that malformed completion entries are dropped.
Change the contract assertion to expect `SCHEMA_VERSION` 4.

- [ ] **Step 2: Run state tests**

Run: `npm test -- src/state/reducer.test.ts src/state/persistence.test.ts src/state/contract.test.ts`

Expected: FAIL because the action, collection, and schema version do not exist.

- [ ] **Step 3: Implement safe collection handling**

Add `scoreActionCompletions: ScoreActionCompletion[]` to `CyncdState` and
`initialState()`. Add the reducer action:

```ts
case 'completeScoreAction':
  return state.scoreActionCompletions.some((entry) => entry.date === action.date)
    ? state
    : {
        ...state,
        scoreActionCompletions: [
          ...state.scoreActionCompletions,
          { date: action.date, completedBy: state.demo.role },
        ],
      }
```

Bump to schema v4. Add an element guard requiring a `YYYY-MM-DD` date and a
known role, then reconcile with `keepValid('scoreActionCompletions', ...)`.
Expose `completeScoreAction(date)` through the context/store action map.

- [ ] **Step 4: Run focused state tests**

Run: `npm test -- src/state/reducer.test.ts src/state/persistence.test.ts src/state/contract.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit persistence**

```bash
git add src/content/types.ts src/state/reducer.ts src/state/persistence.ts src/state/persistence.test.ts src/state/reducer.test.ts src/state/contract.test.ts src/state/context.ts src/state/store.tsx
git commit -m "feat: persist score action completion"
```

### Task 4: Derive shared-safe Score, history, and phase guidance

**Files:**
- Modify: `src/state/derived.ts`
- Modify: `src/state/derived.test.ts`
- Modify: `src/content/cycle.ts` only if a small exported date helper removes duplicated UTC parsing

- [ ] **Step 1: Write failing derived tests**

Use a joined state with primary `cycleStart: '2026-08-01'`,
`cycleLength: '~28 days'` (adapt this exact seed through a local answer mapper),
both sets of approved trait answers, and a deterministic simulated date. Assert:

```ts
expect(derive(asShanice).score).toEqual(derive(asDarnell).score)
expect(derive(asShanice).guidance.kind).toBe('phase')
expect(derive(noCycle).guidance.kind).toBe('trait')
expect(JSON.stringify(derive(asDarnell).partnerScore)).not.toMatch(/cycle|period|follicular|ovulatory|luteal|symptom/i)
```

Assert the score history has seven entries and the completed action changes the
current Score without adding private data.

- [ ] **Step 2: Run the derived suite**

Run: `npm test -- src/state/derived.test.ts`

Expected: FAIL because Score and guidance fields do not exist.

- [ ] **Step 3: Implement one derived date/input boundary**

In `derived.ts`, define a fixed `DEMO_ANCHOR_DATE = '2026-08-25'` and
derive the simulated ISO date by offsetting it by `currentDay - 1`. Translate
onboarding `cycleLength` values as `~28 days|Varies|Not sure -> 28`,
`Shorter -> 24`, and `Longer -> 32`. Call `predictCycle`, then
`guidanceFor` and `calculateScore` once for current output and seven times
for history. Expose:

```ts
guidance: PhaseGuidance
score: ScoreResult
partnerScore: Pick<ScoreResult, 'percentage' | 'band' | 'label' | 'line' | 'action' | 'confidence'>
scoreHistory: ScoreHistoryEntry[]
simulatedDate: string
```

Keep existing `today`, Coach, Plan, and WeekStrip derivations intact for their
later migrations; Today and Partner must switch to the new fields in Task 5.

- [ ] **Step 4: Run derived tests**

Run: `npm test -- src/state/derived.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit derived integration**

```bash
git add src/state/derived.ts src/state/derived.test.ts
git commit -m "feat: derive shared score and phase guidance"
```

### Task 5: Render the shared Score on Today and Partner

**Files:**
- Create: `src/components/ScoreCard.tsx`
- Modify: `src/screens/Today.tsx`
- Modify: `src/screens/Partner.tsx`
- Modify: `src/app/index.tsx`

- [ ] **Step 1: Typecheck the intended component API before implementation**

Add the unimplemented component import and intended calls:

```tsx
<ScoreCard score={derived.score} compact onOpen={() => setTab('partner')} />
<ScoreCard score={derived.score} history={derived.scoreHistory} onComplete={() => actions.completeScoreAction(derived.simulatedDate)} />
```

Run: `npm run typecheck`

Expected: FAIL because `ScoreCard` and `completeScoreAction` do not yet
exist or are not wired.

- [ ] **Step 2: Implement `ScoreCard` with existing primitives**

Use `Card`, `Eyebrow`, `Guidance`, `Muted`, `Faint`, `Btn`, and
existing tokens. Compact form renders percentage, label, line, confidence, and
a “View cyncd Score” button. Full form renders those plus practical action, a
single idempotent “Mark today’s action complete” button, a local “How this
works” disclosure containing only component labels/weights, and seven derived
history percentages. It must not receive or render a `CyclePrediction`.

- [ ] **Step 3: Swap Today and Partner to the new derived surfaces**

Today replaces `today`, `DayPill`, `WhyDisclosure`, and `WeekStrip`
with `guidance` and compact Score while retaining coach chips and starter
note. Partner renders full Score before the invite/paused branches so the shared
Score remains visible even when guidance sharing is paused; its old guidance
cards consume `guidance` rather than `today`/legacy `partnerFacing`.

Pass `onOpenScore={() => setTab('partner')}` from `src/app/index.tsx` to
Today.

- [ ] **Step 4: Run typecheck and relevant state suites**

Run: `npm run typecheck && npm test -- src/state/derived.test.ts src/content/score.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit UI integration**

```bash
git add src/components/ScoreCard.tsx src/screens/Today.tsx src/screens/Partner.tsx src/app/index.tsx
git commit -m "feat: show cyncd score and phase guidance"
```

### Task 6: Verify the slice

**Files:**
- Verify only: Stage 3–4 files.

- [ ] **Step 1: Inspect clean scope**

Run:

```bash
git diff --check main...HEAD
git status --short
```

Expected: no whitespace error and no modification to the user-owned
`docs/spec-2026-08-14.md`.

- [ ] **Step 2: Run the full delivery gate**

Run: `npm run verify`

Expected: typecheck exits 0 and all Vitest files pass.

- [ ] **Step 3: Report exact coverage**

Report Score calculation, confidence line, action completion, shared-safe
Partner output, phase-driven Today, and the exact verification result. State
explicitly that Forecast/Track, Reflect feedback, share card, Plan calendar,
and per-item sharing remain outside this slice.
