import { describe, expect, it } from 'vitest'
import * as content from './index'
import { PRIVACY_NOTE, ROLE_LABELS, ROLE_NAMES } from './index'

/**
 * Guards the class of defect a rename actually ships.
 *
 * Renaming the demo couple broke six call sites that the compiler named
 * immediately, and five more that it could not see at all — names sitting in
 * prose rather than next to a role check. Those compile perfectly and say the
 * wrong name on screen, which makes a green build the least informative signal
 * there is on this kind of change. The frontend found its five by driving the
 * running app; this is the same check for content, run at commit.
 *
 * The plumbing was verified by injection, not assumed — a walker that reaches
 * less than it looks like it does passes for the same reason a clean codebase
 * does. A retired name was injected into a notification, a coach `say` message,
 * a coach summary's sendable message, a day's `why`, an onboarding prompt and
 * STARTER_NOTE, and a *current* name into coach copy for the second rule. All
 * seven failed the guard, and the tree was restored after each.
 *
 * Known limit: the walk skips functions, so copy generated at render time
 * rather than stored in an export escapes it. Nothing does that today.
 */
function contentStrings(): { path: string; value: string }[] {
  const out: { path: string; value: string }[] = []
  const seen = new WeakSet<object>()

  const walk = (node: unknown, path: string): void => {
    if (typeof node === 'string') {
      out.push({ path, value: node })
      return
    }
    // Functions are exported helpers here, not copy — calling them would only
    // re-walk data already reached through DAYS and COACH_NODES.
    if (typeof node !== 'object' || node === null || seen.has(node)) return
    seen.add(node)
    if (Array.isArray(node)) {
      node.forEach((item, i) => walk(item, `${path}[${i}]`))
      return
    }
    for (const [key, value] of Object.entries(node)) walk(value, `${path}.${key}`)
  }

  for (const [name, value] of Object.entries(content)) walk(value, name)
  return out
}

const RETIRED_NAMES = ['Alex', 'Sam']

describe('the demo couple in content', () => {
  it('walks a non-trivial number of strings', () => {
    // Guards against passing because the walk found nothing.
    expect(contentStrings().length).toBeGreaterThan(200)
  })

  it.each(RETIRED_NAMES)('no longer says %s anywhere', (name) => {
    const pattern = new RegExp(`\\b${name}\\b`)
    const hits = contentStrings().filter((s) => pattern.test(s.value))
    expect(hits.map((h) => `${h.path}: ${JSON.stringify(h.value)}`)).toEqual([])
  })

  it('hardcodes a current name in exactly one place, and that place derives it', () => {
    // Everything else refers to "your partner" or "they". Keeping the count at
    // one is what makes the next rename a single-file change; if a new string
    // legitimately needs a name, it should come from ROLE_NAMES and this
    // expectation should be updated deliberately rather than by accident.
    const pattern = new RegExp(`\\b(${ROLE_NAMES.shanice}|${ROLE_NAMES.darnell})\\b`)
    const hits = contentStrings()
      .filter((s) => pattern.test(s.value))
      .map((h) => h.path)
      .filter((path) => !path.startsWith('ROLE_NAMES') && !path.startsWith('ROLE_LABELS'))

    expect(hits).toEqual(['PRIVACY_NOTE'])
    expect(PRIVACY_NOTE).toContain(ROLE_NAMES.darnell)
  })

  it('labels both roles distinctly for the demo bar', () => {
    expect(ROLE_LABELS.shanice).not.toBe(ROLE_LABELS.darnell)
    for (const role of ['shanice', 'darnell'] as const) {
      expect(ROLE_LABELS[role]).toContain(ROLE_NAMES[role])
    }
  })
})
