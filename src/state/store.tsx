import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import type { ChipId } from '../content';
import { chipsForRole, getCoachEntry, getCoachNode } from '../content';
import { derive } from './derived';
import {
  CyncdContext,
  type Actions,
  type Coach,
  type CyncdContextValue,
} from './context';
import { initialState, load, save } from './persistence';
import { reducer } from './reducer';

export function CyncdProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [session, setSession] = useState<{
    chip: ChipId;
    nodeId: string;
  } | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Native storage is async, so the store mounts on `initialState()` and the
  // stored blob lands a tick later. `cancelled` guards a provider unmounted
  // mid-read, which would otherwise dispatch into a dead reducer.
  useEffect(() => {
    let cancelled = false;
    load().then((stored) => {
      if (cancelled) return;
      dispatch({ type: 'hydrate', state: stored });
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Deliberately gated on `hydrated`. This effect also runs on mount, when
  // `state` is still the placeholder `initialState()` — writing that would
  // erase the stored blob before `load()` had a chance to read it, so the very
  // first launch after any real use would come back as a fresh install.
  useEffect(() => {
    if (!hydrated) return;
    void save(state);
  }, [state, hydrated]);

  const derived = useMemo(() => derive(state), [state]);

  const closeCoach = useCallback(() => setSession(null), []);

  const actions = useMemo<Actions>(
    () => ({
      startSignup: () => dispatch({ type: 'startSignup' }),
      submitSignup: (email) => dispatch({ type: 'submitSignup', email }),
      answerOnboarding: (id, value) =>
        dispatch({ type: 'answerOnboarding', id, value }),
      skipOnboarding: (id) => dispatch({ type: 'skipOnboarding', id }),
      finishOnboarding: () => dispatch({ type: 'finishOnboarding' }),
      advanceFlow: () => dispatch({ type: 'advanceFlow' }),
      simulatePartnerJoin: () => dispatch({ type: 'simulatePartnerJoin' }),
      answerPartnerOnboarding: (id, value) =>
        dispatch({ type: 'answerPartnerOnboarding', id, value }),
      completePartnerOnboarding: () =>
        dispatch({ type: 'completePartnerOnboarding' }),
      continueWithoutPartner: () =>
        dispatch({ type: 'continueWithoutPartner' }),
      setRole: (role) => dispatch({ type: 'setRole', role }),
      setDay: (day) => {
        // A conversation is about a specific day; stepping away from it ends it.
        setSession(null);
        dispatch({ type: 'setDay', day });
      },
      stepDay: (delta) => {
        setSession(null);
        dispatch({ type: 'stepDay', delta });
      },
      togglePauseSharing: () => dispatch({ type: 'togglePauseSharing' }),
      savePlan: (input) => dispatch({ type: 'savePlan', ...input }),
      sharePlan: (id) => dispatch({ type: 'sharePlan', id }),
      addReflection: (accuracy, mood) =>
        dispatch({ type: 'addReflection', accuracy, mood }),
      dismissNotification: () => dispatch({ type: 'dismissNotification' }),
      openNotification: () => {
        const target = state.notification?.target ?? null;
        if (target !== null) dispatch({ type: 'clearNotification' });
        return target;
      },
      // No explicit clear(): the persistence effect writes the fresh state
      // straight back, so removing the key first would only look like it did
      // something. What a reload sees afterwards is a clean splash either way.
      resetDemo: () => {
        setSession(null);
        dispatch({ type: 'reset' });
      },
    }),
    [state.notification],
  );

  const node = session === null ? null : getCoachNode(session.nodeId);

  // A session pointing at an id with no node renders an empty chat sheet and
  // looks like a UI bug. The graph tests make it unreachable today; if it ever
  // happens it should be loud rather than blank.
  useEffect(() => {
    if (session !== null && node === null) {
      console.error(`cyncd: coach node "${session.nodeId}" does not exist.`);
    }
  }, [session, node]);

  const coach = useMemo<Coach>(() => {
    /** Both Save and Send land a log entry; only Send marks the plan shared. */
    const commit = (share: boolean) => {
      if (session === null || node === null || node.kind !== 'summary') return;
      dispatch({
        type: 'addLog',
        chip: session.chip,
        outputType: node.outputType,
        text: node.logText,
      });
      if (node.planTitle !== undefined) {
        dispatch({
          type: 'savePlan',
          day: state.demo.currentDay,
          text: node.planTitle,
          share,
        });
      }
    };

    return {
      chips: chipsForRole(state.demo.role),
      chip: session?.chip ?? null,
      node,
      open: (chip) =>
        setSession({ chip, nodeId: getCoachEntry(chip, derived.today) }),
      advance: () => {
        if (node !== null && node.kind === 'say') {
          setSession({ chip: session!.chip, nodeId: node.next });
        }
      },
      choose: (index) => {
        if (node !== null && node.kind === 'choice') {
          const option = node.options[index];
          if (option !== undefined)
            setSession({ chip: session!.chip, nodeId: option.next });
        }
      },
      save: () => commit(false),
      send: () => commit(true),
      close: closeCoach,
    };
  }, [
    state.demo.role,
    state.demo.currentDay,
    session,
    node,
    derived.today,
    closeCoach,
  ]);

  const value = useMemo<CyncdContextValue>(
    () => ({ state, actions, derived, coach, hydrated }),
    [state, actions, derived, coach, hydrated],
  );

  return (
    <CyncdContext.Provider value={value}>{children}</CyncdContext.Provider>
  );
}
