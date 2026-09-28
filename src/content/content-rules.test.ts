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
import { ONBOARDING_STEPS, PARTNER_STEPS, PARTNERED, rhythmSummary, visibleSteps } from './onboarding'
import { PHASE_GUIDANCE, TRAIT_GUIDANCE } from './phaseGuidance'
import { SCORE_BANDS } from './score'

const BANNED_EVERYWHERE = [
  'bad day', 'low compatibility', 'relationship risk', 'difficult phase',
  'hormonal behaviour', 'she may be emotional', 'avoid her today',
  'streak', 'badge', 'you missed', "don't forget", 'keep it up',
]

const BANNED_IN_SHARED = [
  'hormone', 'hormonal', 'menstrual', 'ovulat', 'luteal', 'follicular', 'pms',
  'symptom', 'diagnos', 'medical', 'clinical', 'therapy', 'treatment', 'disorder',
  'chart', 'graph',
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

const sharedStrings = [
  ...collect(DAYS, 'DAYS'),
  ...collect(Object.values(COACH_NODES), 'COACH_NODES'),
  ...collect(PHASE_GUIDANCE, 'PHASE_GUIDANCE'),
  ...collect(TRAIT_GUIDANCE, 'TRAIT_GUIDANCE'),
  ...collect(SCORE_BANDS, 'SCORE_BANDS'),
]

const show = (hits: Found[]) => hits.map((h) => `${h.path}: ${JSON.stringify(h.value)}`)

describe('content rules', () => {
  it('walks a non-trivial number of strings', () => {
    // Guards against the lint passing because the walk found nothing.
    expect(sharedStrings.length).toBeGreaterThan(200)
  })

  it.each(BANNED_EVERYWHERE)('never uses %j on any current content surface', (term) => {
    expect(show(sharedStrings.filter((s) => s.value.toLowerCase().includes(term)))).toEqual([])
  })

  it.each(BANNED_IN_SHARED)('never uses %j on a shared surface', (term) => {
    expect(show(sharedStrings.filter((s) => s.value.toLowerCase().includes(term)))).toEqual([])
  })

  it('never references cycle language on a shared surface', () => {
    expect(show(sharedStrings.filter((s) => /\bcycle/i.test(s.value)))).toEqual([])
  })

  it('shows no numbers as data', () => {
    // Percentages and "N days"-style counters read as raw data on surfaces the
    // spec says must stay human. Prose numbers are fine.
    const re = /\d+\s*%|\b\d+\s*(days?|times?|nights?)\b/i
    expect(show(sharedStrings.filter((s) => re.test(s.value)))).toEqual([])
  })
})

describe('day content structure', () => {
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

describe('conversational onboarding content', () => {
  const ids = (steps: typeof ONBOARDING_STEPS) => steps.map((step) => step.id)

  it('asks about the relationship before the body', () => {
    const order = ids(ONBOARDING_STEPS)
    expect(order.indexOf('intent')).toBe(0)
    expect(order.indexOf('usage')).toBeLessThan(order.indexOf('cycleStart'))
    expect(order.indexOf('moreOf')).toBeLessThan(order.indexOf('cycleStart'))
  })

  it('keeps the Phase 1 cycle seed the forecast reads', () => {
    expect(ONBOARDING_STEPS.find((step) => step.id === 'cycleStart')?.kind).toBe('date')
    const length = ONBOARDING_STEPS.find((step) => step.id === 'cycleLength')
    expect(length?.kind === 'single' && length.options).toEqual(['~28 days', 'Shorter', 'Longer', 'Varies', 'Not sure'])
  })

  it('ends on privacy and then the commitment, in both flows', () => {
    for (const steps of [ONBOARDING_STEPS, PARTNER_STEPS]) {
      expect(steps.slice(-2).map((step) => step.kind)).toEqual(['privacy', 'commitment'])
    }
  })

  it('does not ask someone using Cyncd alone about the relationship', () => {
    const solo = ids(visibleSteps(ONBOARDING_STEPS, { usage: 'By myself for now' }))
    expect(solo).not.toContain('together')
    expect(solo).not.toContain('moreOf')
    const partnered = ids(visibleSteps(ONBOARDING_STEPS, { usage: PARTNERED }))
    expect(partnered).toContain('together')
    expect(partnered).toContain('moreOf')
  })

  it('gives the partner a short setup of their own, not the same one', () => {
    const questions = PARTNER_STEPS.filter((step) => step.kind !== 'privacy' && step.kind !== 'commitment')
    expect(questions.length).toBeGreaterThanOrEqual(5)
    expect(questions.length).toBeLessThanOrEqual(7)
    expect(PARTNER_STEPS.some((step) => step.id === 'cycleStart')).toBe(false)
  })

  it('uses unique step ids', () => {
    for (const steps of [ONBOARDING_STEPS, PARTNER_STEPS]) {
      expect(new Set(ids(steps)).size).toBe(steps.length)
    }
  })

  it('reflects back what changes, and never reports "nothing" as a change', () => {
    expect(rhythmSummary({ changes: ['Energy', 'Mood', 'Affection'] })).toBe(
      'From what you’ve told us, your energy, mood and need for affection can change throughout the month.',
    )
    expect(rhythmSummary({ changes: ["Nothing I've noticed"] })).toContain('still noticing')
  })

  it('keeps onboarding copy free of the banned phrases', () => {
    const copy = [...collect(ONBOARDING_STEPS, 'ONBOARDING_STEPS'), ...collect(PARTNER_STEPS, 'PARTNER_STEPS')]
    for (const term of BANNED_EVERYWHERE) {
      expect(show(copy.filter((s) => s.value.toLowerCase().includes(term)))).toEqual([])
    }
  })
})

describe('score bands', () => {
  it('always pairs a score band with a practical action', () => {
    for (const band of Object.values(SCORE_BANDS)) {
      expect(band.action).not.toBe('')
    }
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
