# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Renaming

`npm run verify` (typecheck + tests) runs on every commit via `.githooks/pre-commit`.
Run it before you claim a change works.

Three separate find-and-replace passes have shipped breakage in this repo. Two
were caught by typecheck only after someone ran the app by hand; one was not
caught by anything. Prefer your editor's rename-symbol over text replacement —
it is scope-aware, so it cannot do any of the following.

**Case-insensitive replace changes identifiers, not just prose.**
`Synched` → `cyncd` turned `SynchedProvider` into `cyncdProvider`. A lowercase
JSX tag is a *host element*, not a component, so the provider silently never
mounted and every `useCyncd()` threw. Typecheck catches this; nothing else does.

**Never replace across a third-party API surface.**
`onChange` → `onValueChange` renamed the `DateTimePicker` prop, which is defined
by `@react-native-community/datetimepicker`, not by us. Its prop type is
permissive, so **typecheck did not catch it** — the picker simply stopped firing
and the cycle-start question became unanswerable. If a replace touches a name
you did not define, it is wrong by default.

**Brand words are sometimes load-bearing state.**
The `Flow` union had a member `'synched'` meaning *the confirmation screen shown
once the partner joins*. The brand replace renamed it to `'cyncd'`, which
typechecked and passed tests while making the state machine unreadable. It is
now `'paired'`. Before replacing a word, check whether it is also a value.

When a replace is genuinely the right tool, scope it: match word boundaries,
exclude `node_modules`, and read the diff before staging it.
