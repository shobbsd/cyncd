# Remaining Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver approved Stages 5–10 as a private, deterministic,
single-device Expo demo with clean later backend and model seams.

**Architecture:** Persist private logs, explicit shared items, local calendar
entries, and reflections. `derive()` is the sole private-to-shared boundary;
screens consume role-safe derived state. Local repositories/services own data
operations so their implementations, not the UI, can later be replaced.

**Tech Stack:** Expo SDK 57, React Native, TypeScript, AsyncStorage, Vitest.

---

## File map

- `src/content/types.ts`, `tabs.ts`, `forecast.ts`, `calendar.ts`,
  `reflection.ts`: public contracts and deterministic content functions.
- `src/state/reducer.ts`, `persistence.ts`, `derived.ts`,
  `localRepositories.ts`: local-state behavior and privacy derivation.
- `src/screens/Forecast.tsx`, `Track.tsx`, `Welcome.tsx`: new private and
  launch surfaces.
- `src/screens/Partner.tsx`, `Plan.tsx`, `Reflect.tsx`, `src/app/index.tsx`,
  `src/components/TabBar.tsx`, `ScoreCard.tsx`: integration points.

### Task 1: Add role-aware tab navigation

**Files:** Create `src/content/tabs.ts`, `src/content/tabs.test.ts`; modify
`src/content/types.ts`, `src/content/index.ts`, `src/components/TabBar.tsx`,
and `src/app/index.tsx`.

- [ ] Write failing tests that assert `tabsForRole('shanice')` includes
  `forecast`, `tabsForRole('darnell')` does not, and
  `tabForRole('darnell', 'forecast')` is `null`.
- [ ] Run `npm test -- src/content/tabs.test.ts`; confirm failure because the
  navigation module does not exist.
- [ ] Add `forecast` to `TabId`; implement `tabsForRole(role)` and
  `tabForRole(role, tab)`; make `TabBar` receive the role-filtered list.
- [ ] Replace `demo.currentDay` with a validated simulated ISO date (seeded at
  `2026-08-25`) and make the DemoBar step that date by one day. Preserve the
  existing day-derived compatibility output only where a legacy screen still
  needs it; all Forecast, Score, and notification derivation reads the date.
- [ ] In the app shell, render Forecast only for a valid tab; reconcile the
  active tab to `today` on role change; drop notification targets unavailable
  to the current role.
- [ ] Run `npm run typecheck && npm test -- src/content/tabs.test.ts`.
- [ ] Commit with `feat: add role-aware forecast navigation`.

### Task 2: Make prediction log-aware and derive a private Forecast

**Files:** Create `src/content/forecast.ts`, `src/content/forecast.test.ts`;
modify `src/content/types.ts`, `src/content/cycle.ts`, `cycle.test.ts`,
`src/state/derived.ts`, and `derived.test.ts`.

- [ ] Write failing tests with a `CycleLogEntry` whose later
  `period: 'start'` supersedes onboarding's `lastPeriodStart`; assert a missing
  seed derives the plain-language action `Log your first period`.
- [ ] Run `npm test -- src/content/cycle.test.ts src/content/forecast.test.ts`.
- [ ] Add `CycleLogEntry` with `id`, ISO `date`, optional period/flow, mood,
  energy, pain, sleep, stress, physical/emotional symptoms, libido, and notes.
- [ ] Change `predictCycle(seed, date, logs = [])` to choose the latest valid
  period-start log at or before `date`, falling back to the seed. Add
  `forecastFor(prediction)` returning title, detail, mood, energy, and outlook
  in plain language only.
- [ ] Add private `forecast` and `privateCycle` fields to `Derived`; do not add
  logs or prediction data to `partnerScore` or partner output.
- [ ] Run `npm test -- src/content/cycle.test.ts src/content/forecast.test.ts src/state/derived.test.ts`.
- [ ] Commit with `feat: derive private forecast from cycle logs`.

### Task 3: Add validated persisted records and local repositories

**Files:** Create `src/state/localRepositories.ts` and
`localRepositories.test.ts`; modify types, reducer, reducer tests, persistence,
persistence tests, context, and store.

- [ ] Write red reducer tests for upserting a log by date, author-only update
  and revoke of a shared item, idempotent calendar-suggestion save, and
  reflection creation without Score feedback.
- [ ] Write red persistence tests showing malformed elements are dropped while
  valid cycle logs, shared items, calendar entries, and reflections survive.
- [ ] Run `npm test -- src/state/reducer.test.ts src/state/persistence.test.ts src/state/localRepositories.test.ts`.
- [ ] Add contracts: `SharedItem { id, author, kind, body, sharedAt, updatedAt,
  revokedAt? }`, `CalendarEntry { id, date, title, kind, author, icon? }`, and
  `ReflectionEntry { id, author, date, text, signals, scoreFeedback?, createdAt }`.
- [ ] Add `cycleLogs`, `sharedItems`, `calendarEntries`, and
  `reflectionEntries` to state and initial state. Add guards for every enum,
  role, ISO date, id, and array; bump `SCHEMA_VERSION` once.
- [ ] Add reducer actions and expose them through `Actions`: `upsertCycleLog`,
  `createSharedItem`, `updateSharedItem`, `revokeSharedItem`,
  `upsertCalendarEntry`, `removeCalendarEntry`, and `addReflectionEntry`.
- [ ] Make local repository interfaces delegate to those actions; they define
  create/list/update/revoke boundaries without remote dependencies.
- [ ] Run the focused tests and commit with `feat: persist private and shared phase one records`.

### Task 4: Build Forecast-first Track UI

**Files:** Create `src/screens/Forecast.tsx`, `src/screens/Track.tsx`; modify
`src/app/index.tsx` and forecast contracts/tests.

- [ ] Write failing forecast contract tests for all Track field ids, including
  `notes`, `physicalSymptoms`, and `emotionalSymptoms`.
- [ ] Run `npm test -- src/content/forecast.test.ts`.
- [ ] Implement Forecast with the current private outlook, next expected period
  where available, seven day buttons, and a Track action. It must show the
  no-seed invitation rather than fabricate a result.
- [ ] Implement Track as controlled state for the selected ISO date. It loads
  a pre-existing record, supports every approved field, and saves through
  `upsertCycleLog`, so correction replaces instead of duplicates.
- [ ] Run `npm run typecheck && npm test -- src/content/forecast.test.ts src/state/reducer.test.ts`.
- [ ] Commit with `feat: add private forecast and tracking`.

### Task 5: Replace global sharing with local per-item sharing

**Files:** Modify `src/state/derived.ts`, `derived.test.ts`,
`src/screens/Partner.tsx`, and `src/content/content-rules.test.ts`.

- [ ] Write red derivation tests: each role sees only the other author's active
  `sharedWithMe` items; the author sees editable `sharedByMe`; revoked items and
  raw private-cycle fields are absent.
- [ ] Write a content/privacy test that the share-card input contains no cycle,
  period, symptom, notes, or log vocabulary.
- [ ] Run `npm test -- src/state/derived.test.ts src/content/content-rules.test.ts`.
- [ ] Derive `sharedWithMe` and `sharedByMe` from explicit, non-revoked items.
  Replace Partner's pause switch with author-scoped edit/revoke controls and an
  explicit Forecast-insight share action.
- [ ] Run focused tests and commit with `feat: add local per-item partner sharing`.

### Task 6: Add the internal shared calendar and global assistant entry

**Files:** Create `src/content/calendar.ts`, `calendar.test.ts`, and
`src/components/CalendarGrid.tsx`; modify derived state and `src/screens/Plan.tsx`.

- [ ] Write red tests that saving the same generated suggestion twice creates
  one entry and that score history produces a non-empty calendar suggestion set.
- [ ] Run `npm test -- src/content/calendar.test.ts src/state/derived.test.ts`.
- [ ] Implement date-keyed calendar suggestions and `CalendarGrid`; show local
  authored entries and allow add/edit/remove through existing local actions.
- [ ] Update Plan to save suggestions idempotently and open the existing global
  `CoachSheet` via `coach.open('planTonight')`; do not add external calendar
  links or a second chat component.
- [ ] Run typecheck/focused tests and commit with `feat: add internal shared calendar`.

### Task 7: Rewrite Reflect as conversation-first

**Files:** Create `src/content/reflection.ts`, `reflection.test.ts`; modify
Reflect, reducer, reducer tests, and derived state.

- [ ] Write red tests for `interpretReflection('I felt close after dinner')`
  returning `['connection']`, and an added reflection without feedback omitting
  `scoreFeedback`.
- [ ] Run `npm test -- src/content/reflection.test.ts src/state/reducer.test.ts`.
- [ ] Add the `ReflectionInterpreter` contract and deterministic keyword-based
  local implementation. Keep signals transparent and non-clinical.
- [ ] Render free-text input and Submit before any feedback control. After
  submit, acknowledge locally and reveal optional five-step Score feedback;
  skipping it must persist no feedback value.
- [ ] Run focused tests and commit with `feat: add conversational reflection loop`.

### Task 8: Add launch Welcome and privacy-safe Score sharing

**Files:** Create `src/screens/Welcome.tsx`, `src/components/ShareScoreCard.tsx`,
and its test; modify app shell, ScoreCard, `package.json`, and lockfile.

- [ ] Write red tests that `shareCardInput(derive(state))` includes percentage
  and excludes cycle, period, symptoms, notes, and private feedback.
- [ ] Run `npm test -- src/components/ShareScoreCard.test.ts`.
- [ ] Install the SDK-compatible sharing packages with
  `npx expo install expo-sharing react-native-view-shot`.
- [ ] Implement Welcome as hydrated launch UI, not a persisted `Flow`: render a
  safe quote, Continue, and two-second dwell before the resolved flow.
- [ ] Narrow the share card's prop to public Score fields. Share the captured
  card only when `Sharing.isAvailableAsync()` succeeds; otherwise copy its text
  summary through the existing clipboard module.
- [ ] Run typecheck/focused tests and commit with `feat: add welcome and safe score sharing`.

### Task 9: Audit the finished boundary and verify

**Files:** Modify `src/content/content-rules.test.ts` and
`src/state/contract.test.ts` only; do not touch the user-owned spec edit.

- [ ] Add final tests for no Forecast tab for Darnell, no raw private log fields
  in partner-derived JSON, share-card privacy, and seven visible history entries
  from a bounded rolling thirty-day source.
- [ ] Run `npm run verify`, then `git diff --check`.
- [ ] Commit audit tests with `test: enforce remaining phase one boundaries`.
- [ ] Run fresh final verification: `npm run verify && git diff --check`.

## Plan self-review

- Every approved slice maps to one or more explicit tasks: role-aware Forecast,
  private Track, local sharing, internal calendar/global assistant,
  conversation-first Reflect, and Welcome/share card.
- Google/Apple/Outlook links, multi-device backend, and remote model calls are
  deliberately excluded.
- Persistence validation and partner/share-card privacy tests precede dependent
  UI work.
