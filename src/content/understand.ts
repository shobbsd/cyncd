/**
 * Turns one spoken or typed sentence into the structured signals a
 * questionnaire would otherwise have asked for, one screen at a time.
 *
 * This is the demo's stand-in for the model: a phrase list, not inference. It
 * is deliberately conservative — a signal appears only when its words do — and
 * the person always sees and confirms the result ("Looks right · Edit"), so a
 * miss costs a correction rather than a wrong assumption stored silently.
 */

export type Timing = 'before' | 'during' | 'after';

export interface Understanding {
  timing: Timing | null;
  signals: string[];
}

const SIGNALS: { label: string; pattern: RegExp }[] = [
  { label: 'Mood sensitivity', pattern: /emotional|moody|mood|tearful|teary|irritab|\bcry/ },
  {
    label: 'Lower social energy',
    pattern: /(don[’']?t|do not) (want|feel like) (to )?(go(ing)? out|see people|socialis)|stay (in|home)|antisocial/,
  },
  { label: 'Skin changes', pattern: /spots?\b|breakouts?|acne|oily|\bskin/ },
  { label: 'More need for reassurance', pattern: /reassur/ },
  { label: 'Lower energy', pattern: /tired|exhausted|drained|no energy|low energy|fatigue/ },
  { label: 'Pain or cramps', pattern: /cramp|\bpain|aches?\b/ },
  { label: 'Sleep changes', pattern: /sleep|insomnia/ },
  { label: 'Appetite changes', pattern: /hungry|craving|appetite/ },
  { label: 'Changes in sex drive', pattern: /sex drive|libido/ },
  { label: 'Space to process first', pattern: /\bspace\b|time (to myself|alone|first)|on my own/ },
  { label: 'Talking things through', pattern: /talk(ing)? (it|things) (through|out)|talk about it/ },
  { label: 'Busy or stressful stretches', pattern: /\bwork\b|busy|stress/ },
  { label: 'Time together', pattern: /\bplan|dates?\b|date night|time together/ },
  { label: 'Knowing when to check in', pattern: /when to check in|check in/ },
  { label: 'Physical affection', pattern: /\bhugs?\b|cuddl|affection/ },
];

const TIMINGS: { timing: Timing; pattern: RegExp }[] = [
  { timing: 'before', pattern: /before (my|the|it|a) ?period|week before|before it (starts|comes)/ },
  { timing: 'during', pattern: /(during|on) my period/ },
  { timing: 'after', pattern: /after my period|after it (ends|finishes)/ },
];

export function understand(text: string): Understanding {
  const lower = text.toLowerCase();
  return {
    timing: TIMINGS.find((entry) => entry.pattern.test(lower))?.timing ?? null,
    signals: SIGNALS.filter((entry) => entry.pattern.test(lower)).map((entry) => entry.label),
  };
}

/** The confirmation copy for an understanding. */
export function confirmationFor(result: Understanding): { title: string; lead: string } {
  if (result.signals.length === 0) {
    return { title: 'Got it.', lead: 'Cyncd has saved that in your words.' };
  }
  const lead =
    result.timing === null
      ? 'Cyncd will keep in mind:'
      : `${result.timing[0].toUpperCase()}${result.timing.slice(1)} your period you tend to notice:`;
  return { title: result.signals.length > 1 ? 'I’ve got you.' : 'Got it.', lead };
}
