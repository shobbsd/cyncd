# Remaining Phase 1 Design

## Goal

Complete Stages 5–10 of the Phase 1 roadmap as a trustworthy single-device
demo. It must preserve the private/shared boundary, remain deterministic without
a network connection, and expose clean seams for a later backend and model.

## Decisions

- Forecast is private to Shanice and uses plain language, not clinical phase
  labels.
- Forecast leads with the outlook; tracking opens as a separate focused action.
- Calendar linking to Google, Apple, and Outlook is deferred. The Phase 1
  calendar is internal only.
- Sharing remains local to one device. A repository boundary makes a later
  backend implementation replaceable without screen rewrites.
- Score history retains 30 local days and renders the most recent seven.
- Reflect starts with free text, followed by an optional structured Score
  question.

## Slice 1: Role-aware navigation and Forecast

`TabId` gains `forecast`; `tabsForRole(role)` becomes the only source of visible
tabs. The shell reconciles the active tab whenever the demo role changes: if it
is not available to the new role, it resets to `today`. Notification navigation
uses the same role check and returns `null` for an unavailable destination.

`Forecast` is a Shanice-only screen. It shows a plain-language current outlook,
next expected period when a prediction exists, mood/energy outlook, a tappable
seven-day forecast, and a call to action to open tracking. When there is no
cycle seed, it invites Shanice to log a first period and presents trait-based
guidance rather than inventing a prediction.

## Slice 2: Private Track and deterministic prediction

`CycleLogEntry` is a date-addressed private record with optional values for
period status, flow, mood, energy, pain, sleep, stress, physical symptoms,
emotional symptoms, libido, and notes. The tracker opens from Forecast, creates
or edits the selected date, and allows revisiting past entries.

The cycle model accepts the seed plus log entries. A logged period start is more
recent evidence than onboarding data; logs otherwise tune only private mood and
energy outlook. Predictions and the Score remain deterministic. No partner
surface imports the raw log.

## Slice 3: Local sharing with a backend seam

`SharedItem` has `id`, `author`, `kind`, `body`, `sharedAt`, `updatedAt`, and
optional `revokedAt`. The local repository exposes create, list, update, and
revoke operations; its implementation reads/writes the persisted state. A future
remote repository implements the same interface.

Partner renders `Shared with me` and `Shared by me`. An author can edit or
revoke only their own active item. Forecast insights are copied into a shared
item only after the author explicitly selects Share. Revoked and unshared
private data never reaches the partner-derived state.

## Slice 4: Plan and global assistant entry

`CalendarEntry` has `id`, `date`, `title`, `kind`, `author`, and optional icon.
The internal shared calendar supports add, edit, remove, and idempotent saving
of generated suggestions. It displays a compact date grid, stored entries, and
score-informed suggestions.

Plan opens the existing app-shell `CoachSheet`; it does not create a second chat
component. The existing scripted Coach remains the local implementation behind a
small assistant service interface, ready for a future grounded model.

## Slice 5: Reflect loop

`ReflectionEntry` stores author, date, free text, extracted deterministic
signals, optional Score feedback, and timestamps. Reflect presents a text area
and submit action first. Once submitted it offers one optional structured
feedback answer. A local reflection interpreter classifies only transparent,
non-clinical signals and does not expose private content to the other role.

## Slice 6: Welcome and share card

The initial hydrated launch renders `Welcome` instead of a blank hydration
frame, then continues to the appropriate persisted flow after a short dwell or
Continue action. It never becomes a `Flow` state and does not replay after
onboarding transitions.

The share card receives only the already-derived public Score view: percentage,
label, line, action, confidence, and selected history. Its data contract
prohibits cycle, symptom, log, and private-feedback fields. Native sharing is
guarded by platform availability; if the package/platform cannot share, the UI
copies a textual summary instead.

## Persistence and migration

All new state collections are initialized empty, validated at the persistence
boundary, and reconciled by retaining only valid entries. The schema version is
bumped once for the complete state expansion. IDs, ISO dates, roles, enum
values, authorship, and bounded history are validated before the reducer reads
them. Malformed persisted values are discarded safely.

## Tests

- Role-tab, role-switch, and notification guards for Forecast.
- Cycle-log precedence and private forecast fallbacks.
- Reducer/persistence tests for tracked data, shared items, calendar entries,
  and reflections.
- Partner-derived output and share-card contracts contain no private cycle/log
  vocabulary or fields.
- Local repositories enforce authorship, edit/revoke, and idempotent suggestion
  persistence.
- Reflection feedback is optional and produces no partner-visible raw data.
- Splash lifecycle and platform-share fallback behavior.

## Delivery

Each slice is built test-first, verified independently, and committed separately
inside one isolated feature worktree. `npm run verify` is the final required
check before integration.
