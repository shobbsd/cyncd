# cyncd Score and Phase-Guidance Design

**Status:** Approved design awaiting written-spec review.

## Goal

Deliver Phase 1 stages 3–4 together: a deterministic cyncd Score and
phase-driven Today guidance. This replaces the retired scripted-day model for
the surfaces in scope without starting Forecast/Track, calendar, sharing, or
the conversational assistant.

## Scope

### Included

- Rule-based daily Score with its 40/30/20/10 component weighting.
- Approved initial confidence copy: “Still learning — this becomes more
  personal as you both share feedback.”
- Shared Score preview on Today and full Score view on Partner.
- Action-completion state for the Score's behavioural component.
- Phase-keyed and trait-fallback guidance for Today.
- Internal conversion of the demo's current-day control into a simulated-date
  offset, so phase-derived content remains demonstrable before Stage 5 changes
  its visible UI.
- Pure unit and derived-state coverage.

### Excluded

- Forecast/Track UI and private tracker data.
- Reflect's structured Score question and conversational rewrite.
- Per-user feedback entry and persistence, share-card generation, calendar
  prediction labels, and score-history retention policy.
- Partner's later per-item sharing rebuild.
- The visible DemoBar/date UI redesign and asymmetric tabs.

## Score contract

`src/content/score.ts` will expose a pure function returning:

```ts
type ScoreResult = {
  percentage: number
  band: ScoreBand
  label: string
  line: string
  action: string
  confidence: string
  components: {
    communication: number
    energyAndCapacity: number
    completedAction: number
    accuracyFeedback: number
  }
}
```

The first two components are computed from both partners' onboarding answers
and, when available, the primary user's predicted phase. The Score falls back
to trait values when no cycle seed exists. Completion defaults to a neutral
score until a user marks the day's shared action complete; completion then
raises the 20% component. Accuracy feedback remains neutral because the
per-partner feedback surface belongs to the later Reflect stage.

All bands provide a non-empty practical action. Score output deliberately does
not carry period start, cycle day, phase, symptoms, individual answers, or
private feedback. Both perspectives receive the same result.

## Guidance and simulated date

A new phase-guidance dataset replaces `getDay()` for Today. It is keyed by
`CyclePhase` and contains the role-neutral daily insight, reassurance,
relationship insight, and practical action needed by the Today and Partner
surfaces. When `predictCycle()` returns `unavailable`, Today uses a
trait-driven fallback and the approved confidence copy.

The existing `demo.currentDay` remains temporarily persisted for the current
DemoBar. Derived state converts it into a simulated calendar offset before
calling the cycle model. This preserves the presenter affordance while ending
the dependency on the seven-day content script. Stage 5 will rename and
redesign that control around visible dates.

## UI

Today receives a compact Score card beneath its primary guidance. It shows the
percentage, label, one-line meaning, confidence wording, and a button that
opens Partner.

Partner renders the same Score before any current guidance state. Its expanded
form shows the percentage, label, explanation, practical action, action
completion button, and a short locally derived recent score history. The
existing sharing pause never hides the shared Score; it only continues to gate
the retired guidance area until the per-item sharing rebuild.

No native dependency is added. The components use the existing shared React
Native primitives and tokens.

## Testing and recovery

- Score unit tests cover every percentage band boundary, non-empty actions,
  missing cycle data, neutral behaviour defaults, and completed-action impact.
- Guidance tests cover every phase and the unavailable fallback.
- Derived tests assert Score equality across roles and prove no private cycle
  fields are present in Partner-facing output.
- Persistence adds only a safe action-completion collection with element-level
  reconciliation; malformed entries are dropped.
- `npm run verify` remains the final gate.

