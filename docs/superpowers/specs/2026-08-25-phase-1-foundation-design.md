# cyncd Phase 1 Foundation Design

**Status:** Approved design awaiting written-spec review.

## Goal

Deliver the deterministic foundation for cyncd Phase 1: safe private-versus-
shared content rules, approved onboarding inputs, persistence recovery, and a
pure cycle prediction model. This is stages 0–2 of
`docs/spec-2026-08-14.md`; it deliberately does not change any screen.

## Scope

### Included

- Rescope the content lint by audience.
- Apply the approved onboarding question sets for both roles.
- Add the cycle-length onboarding answer while retaining stable IDs for
  conceptually unchanged answers.
- Bump the persisted schema and validate stored flow values.
- Build and test a pure, local cycle model that has an explicit no-data state.

### Excluded

- cyncd Score calculation and UI.
- Today content conversion, Forecast UI, tracking/logging, tab changes, and
  simulated-date stepping.
- Sharing, calendar, assistant, Reflect rewrite, splash work, backend, and
  third-party integrations.

The remaining Phase 1 product questions do not block this foundation. In
particular, user-facing phase terminology is deferred because this slice does
not render a phase.

## Architecture

The cycle model is a new pure content-layer module. It receives a simulated
calendar date and an optional seed:

```ts
type CycleSeed = {
  lastPeriodStart?: string;
  cycleLength?: number;
};

type CyclePrediction =
  | { kind: 'unavailable' }
  | {
      kind: 'predicted';
      cycleDay: number;
      phase: CyclePhase;
      nextPeriodStart: string;
      outlook: CycleOutlookDay[];
    };
```

The discriminated union prevents consumers from treating absent data as a
numeric day or guessed phase. It is local and deterministic: it does not call a
network service, write storage, or depend on React Native. Future Score,
Today, and Forecast consumers all derive from this one contract.

The persisted onboarding answer record remains the source for the seed in this
slice. A dedicated cycle-log collection is intentionally deferred until the
tracking stage settles its complete record shape.

## Content boundary

The content-rules test becomes an audience boundary rather than one global
vocabulary ban:

- Private tracker/Forecast content may use required menstrual-cycle and symptom
  vocabulary.
- Shared content—Today, Partner, Plan, Reflect, coach, notifications, and
  Score copy—retains the existing clinical/cycle prohibitions.
- `score` is not banned, since the feature name is required.
- The new globally prohibited blame and judgement phrases are banned
  everywhere.
- The former seven-day verbatim lock is removed; its copy belonged to the
  retired scripted demo.

Tests must collect strings from each surface independently, so private terms
cannot leak to shared content by being accidentally included in one global
fixture.

## Onboarding and persistence

The approved question wording and option sets replace the old static-trait
questions. IDs remain unchanged for equivalent concepts (`energy`,
`communication`, `social`, `routine`); `cycleLength` is added and genuinely
removed concepts are removed. The date answer remains keyed as `cycleStart` so
existing stored answers can seed the new model.

The schema version increments. Since this project intentionally resets on a
schema mismatch, no cross-version data migration is needed. Within the current
version, `reconcile()` validates every flow value against the Flow union and
falls back to the initial flow for invalid values, preventing a blank app shell
after future flow renames.

## Tests and delivery gate

- Content tests pin the audience-specific vocabulary boundary and approved
  question datasets.
- Cycle tests cover standard, shorter, and longer cycles; date rollover; and
  missing or malformed seed input.
- Persistence tests pin the schema version and invalid-flow recovery.
- `npm run verify` is required before the implementation is reported working.

## Deferred decisions

The Score confidence copy, score-history retention, external calendar scope,
visible phase terminology, and Reflect order remain product decisions for later
stages. They do not alter this module's pure prediction contract.
