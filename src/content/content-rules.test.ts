/**
 * Content-rule lint + graph integrity for the scripted demo content.
 *
 * The 7-day guidance the spec supplies is verbatim-mandated and safe. The
 * exposure is everything the spec does NOT supply — `why`, `reassurance`,
 * `partnerActions`, plans, the unscripted coach chips and all notification copy
 * — which is most of the words a demo viewer reads. This makes the hard content
 * rules enforceable rather than aspirational, and catches them again whenever
 * copy is remixed per day type.
 *
 * Named `content-rules.test.ts` to leave `content.test.ts` free.
 */

import { describe, expect, it } from 'vitest'
import type { ChipId, CoachNode } from './types'
import { DAYS, getDay } from './days'
import { COACH_CHIPS, COACH_NODES, getCoachEntry, getCoachNode } from './coach'

const BANNED = [
  'hormone', 'hormonal', 'menstrual', 'ovulat', 'luteal', 'follicular', 'pms',
  'symptom', 'diagnos', 'medical', 'clinical', 'therapy', 'treatment', 'disorder',
  'chart', 'graph', 'score',
  'streak', 'badge', 'you missed', "don't forget", 'keep it up',
]

/** Spec-mandated verbatim copy. Editing any of these is a spec violation. */
const VERBATIM: Array<[number, 'todayGuidance' | 'partnerGuidance', string]> = [
  [1, 'todayGuidance', 'Today may feel neutral or slightly changeable — keep plans flexible.'],
  [1, 'partnerGuidance', 'Good day for light conversation rather than heavy topics. A short check-in works better than long discussions.'],
  [2, 'todayGuidance', 'Energy may dip earlier this evening — consider a relaxed night.'],
  [2, 'partnerGuidance', 'Short reassurance will feel supportive today.'],
  [3, 'todayGuidance', 'Higher tolerance today — easier for social plans or going out.'],
  [3, 'partnerGuidance', 'A good time to enjoy time together outside routine.'],
  [4, 'todayGuidance', 'Emotional sensitivity slightly higher — gentle communication recommended.'],
  [4, 'partnerGuidance', 'Small misunderstandings may feel bigger than intended — patience will help today.'],
  [5, 'todayGuidance', 'Better focus and decision-making today.'],
  [5, 'partnerGuidance', 'Suitable for planning conversations or organising upcoming tasks.'],
  [6, 'todayGuidance', 'Lower energy window approaching — lighter plans recommended.'],
  [6, 'partnerGuidance', 'Quiet evening or shared activity at home may feel best. Suggest one simple option, then give space.'],
  [7, 'todayGuidance', 'Stable and calm day — communication should feel easier.'],
  [7, 'partnerGuidance', 'Good opportunity for connection or a relaxed date night.'],
]

interface Found {
  path: string
  value: string
}

function collect(root: unknown, path: string, out: Found[] = []): Found[] {
  if (typeof root === 'string') {
    out.push({ path, value: root })
  } else if (Array.isArray(root)) {
    root.forEach((v, i) => collect(v, `${path}[${i}]`, out))
  } else if (root && typeof root === 'object') {
    for (const [k, v] of Object.entries(root)) collect(v, `${path}.${k}`, out)
  }
  return out
}

const strings = [
  ...collect(DAYS, 'DAYS'),
  ...collect(Object.values(COACH_NODES), 'COACH_NODES'),
]

const show = (hits: Found[]) => hits.map((h) => `${h.path}: ${JSON.stringify(h.value)}`)

describe('content rules', () => {
  it('walks a non-trivial number of strings', () => {
    // Guards against the lint passing because the walk found nothing.
    expect(strings.length).toBeGreaterThan(200)
  })

  it.each(BANNED)('never uses %j', (term) => {
    expect(show(strings.filter((s) => s.value.toLowerCase().includes(term)))).toEqual([])
  })

  it('never references the cycle outside onboarding', () => {
    expect(show(strings.filter((s) => /\bcycle/i.test(s.value)))).toEqual([])
  })

  it('shows no numbers as data', () => {
    // Percentages and "N days"-style counters read as raw data on surfaces the
    // spec says must stay human. Prose numbers are fine.
    const re = /\d+\s*%|\b\d+\s*(days?|times?|nights?)\b/i
    expect(show(strings.filter((s) => re.test(s.value)))).toEqual([])
  })
})

describe('spec-mandated copy', () => {
  it.each(VERBATIM)('day %i %s is verbatim', (day, field, expected) => {
    expect(getDay(day)[field]).toBe(expected)
  })

  it('uses exactly four day types and four pill labels', () => {
    expect([...new Set(DAYS.map((d) => d.dayType))].sort()).toEqual([
      'calm', 'focused', 'lowEnergy', 'social',
    ])
    expect([...new Set(DAYS.map((d) => d.label))].sort()).toEqual([
      'Calm', 'Focused', 'Low Energy', 'Social',
    ])
  })

  it('marks only day 4 as sensitive, on a calm pill', () => {
    expect(DAYS.filter((d) => d.sensitive).map((d) => d.day)).toEqual([4])
    expect(getDay(4).dayType).toBe('calm')
  })
})

describe('coach graph integrity', () => {
  const chipIds = COACH_CHIPS.map((c) => c.id)

  it('resolves an entry node for every chip on every day', () => {
    const missing: string[] = []
    for (const chip of chipIds) {
      for (const day of DAYS) {
        const id = getCoachEntry(chip as ChipId, day)
        if (!getCoachNode(id)) missing.push(`${chip} day${day.day} -> ${id}`)
      }
    }
    expect(missing).toEqual([])
  })

  it('has no dangling next/option targets', () => {
    // A dead-end id strands the chat sheet mid-demo with no way forward.
    const dangling: string[] = []
    for (const node of Object.values(COACH_NODES) as CoachNode[]) {
      if (node.kind === 'say' && !getCoachNode(node.next)) {
        dangling.push(`${node.id}.next -> ${node.next}`)
      }
      if (node.kind === 'choice') {
        node.options.forEach((o, i) => {
          if (!getCoachNode(o.next)) dangling.push(`${node.id}.options[${i}] -> ${o.next}`)
        })
      }
    }
    expect(dangling).toEqual([])
  })

  it('reaches a summary from every chip entry on every day', () => {
    // Every conversation must terminate in a Save / Send card.
    const stuck: string[] = []
    for (const chip of chipIds) {
      for (const day of DAYS) {
        const seen = new Set<string>()
        const queue = [getCoachEntry(chip as ChipId, day)]
        let reached = false
        while (queue.length) {
          const id = queue.shift() as string
          if (seen.has(id)) continue
          seen.add(id)
          const node = getCoachNode(id)
          if (!node) continue
          if (node.kind === 'summary') { reached = true; break }
          if (node.kind === 'say') queue.push(node.next)
          if (node.kind === 'choice') queue.push(...node.options.map((o) => o.next))
        }
        if (!reached) stuck.push(`${chip} day${day.day}`)
      }
    }
    expect(stuck).toEqual([])
  })

  it('gives day 4 its own coach copy, distinct from the other calm days', () => {
    // `sensitive` exists to drive gentler copy. If entry resolution keys on
    // dayType alone, days 1, 4 and 7 collapse to the same conversation.
    const collapsed: string[] = []
    for (const chip of chipIds) {
      const d4 = getCoachEntry(chip as ChipId, getDay(4))
      const d1 = getCoachEntry(chip as ChipId, getDay(1))
      if (chip === 'quickCheckIn') continue // day-invariant by design
      if (d4 === d1) collapsed.push(`${chip}: day4 and day1 both -> ${d4}`)
    }
    expect(collapsed).toEqual([])
  })

  it('delivers as many options as the summary title promises', () => {
    const mismatched: string[] = []
    for (const node of Object.values(COACH_NODES) as CoachNode[]) {
      if (node.kind !== 'summary') continue
      if (/\bthree\b/i.test(node.title) && node.lines.length !== 3) {
        mismatched.push(`${node.id}: title says three, has ${node.lines.length}`)
      }
    }
    expect(mismatched).toEqual([])
  })
})

describe('plans and notifications', () => {
  it('gives every day at least two plan suggestions', () => {
    // Spec: "2-3 AI-suggested plans matched to the day type".
    const thin = DAYS.filter((d) => d.plans.length < 2).map((d) => `day${d.day}: ${d.plans.length}`)
    expect(thin).toEqual([])
  })

  it('uses stable unique plan ids', () => {
    const ids = DAYS.flatMap((d) => d.plans.map((p) => p.id))
    expect(ids.length).toBe(new Set(ids).size)
  })

  it('tags every plan and notification with its own day', () => {
    const wrong: string[] = []
    for (const d of DAYS) {
      d.plans.forEach((p) => { if (p.day !== d.day) wrong.push(`${p.id}.day=${p.day} on day${d.day}`) })
      if (d.notification.day !== d.day) wrong.push(`${d.notification.id}.day=${d.notification.day} on day${d.day}`)
    }
    expect(wrong).toEqual([])
  })

  it('points every notification at a real tab', () => {
    const tabs = ['today', 'partner', 'plan', 'reflect']
    expect(DAYS.filter((d) => !tabs.includes(d.notification.target)).map((d) => d.day)).toEqual([])
  })
})
