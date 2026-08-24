# Deferred tests

Tests that were passing in the web prototype and have **not** been ported yet.
They are excluded from `tsconfig.json` and from `vitest.config.mts`, so they
neither typecheck nor run. Nothing here is dead — it is all behaviour that used
to be covered and currently is not.

## `store.test.tsx`

253 lines covering `CyncdProvider` end to end: walking a coach conversation
through `say` / `choice` / `summary` nodes, Save vs. Send landing the right log
entry, and stepping the day closing an open session.

It is written against `@testing-library/react`, which renders to a DOM. The
port needs `@testing-library/react-native` plus a `jest-expo` project, because
vitest's `node` environment has no native renderer — this is why the rest of
the suite (pure content and state logic) runs under vitest and this file does
not.

Porting it also has to account for the store now hydrating asynchronously:
`CyncdProvider` mounts on `initialState()` and dispatches `hydrate` a tick
later, so assertions that used to read state synchronously after mount need to
wait for `hydrated` to flip.
