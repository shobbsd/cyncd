import { describe, expect, it } from 'vitest'
import { COACH_CHIPS, DAYS, getCoachEntry, getCoachNode } from './index'
import type { ChipId, CoachNode } from './types'

/**
 * Gendered copy must only ever be shown to the partner.
 *
 * Three coach nodes say "her" about the primary user, and all three live under
 * `supportTip`, which is the one chip gated to Darnell. Every surface both roles
 * see — guidance, `why`, `reassurance`, partner actions, notifications — is free
 * of gendered pronouns.
 *
 * That containment was a property of how the copy happened to be written, and
 * nothing enforced it. Adding a gendered line to an ungated chip, or removing
 * the gate from `supportTip`, would start telling Shanice what to do about
 * "her" — silently, and only inside the coach sheet, which is the surface least
 * likely to be re-read.
 *
 * So the check is reachability, not grep: a node is safe if every chip that can
 * reach it is role-gated.
 */
const GENDERED = /\b(she|her|hers|he|him|his)\b/i

function textOf(node: CoachNode): string {
  if (node.kind === 'say') return node.messages.join(' ')
  if (node.kind === 'choice') return [node.prompt ?? '', ...node.options.map((o) => o.label)].join(' ')
  return [node.title, ...node.lines, node.sendableMessage ?? '', node.planTitle ?? ''].join(' ')
}

/** Every node reachable by walking the graph forward from an entry. */
function reachableFrom(entryId: string): Set<string> {
  const seen = new Set<string>()
  const queue = [entryId]
  while (queue.length > 0) {
    const id = queue.shift()!
    if (seen.has(id)) continue
    seen.add(id)
    const node = getCoachNode(id)
    if (node === null) continue
    if (node.kind === 'say') queue.push(node.next)
    if (node.kind === 'choice') queue.push(...node.options.map((option) => option.next))
  }
  return seen
}

/** node id -> the chips that can reach it, on any day. */
function chipsReachingEachNode(): Map<string, Set<ChipId>> {
  const map = new Map<string, Set<ChipId>>()
  for (const chip of COACH_CHIPS) {
    for (const day of DAYS) {
      for (const id of reachableFrom(getCoachEntry(chip.id, day))) {
        const chips = map.get(id) ?? new Set<ChipId>()
        chips.add(chip.id)
        map.set(id, chips)
      }
    }
  }
  return map
}

const GATED_CHIPS = new Set(COACH_CHIPS.filter((chip) => chip.role !== undefined).map((c) => c.id))

describe('gendered copy stays with the partner', () => {
  it('reaches the whole graph, so a pass means checked rather than not looked', () => {
    const reached = chipsReachingEachNode()
    // Every chip contributes, and the walk gets past entry nodes into summaries.
    expect(new Set([...reached.values()].flatMap((chips) => [...chips])).size).toBe(
      COACH_CHIPS.length,
    )
    expect([...reached.keys()].filter((id) => getCoachNode(id)?.kind === 'summary').length)
      .toBeGreaterThan(20)
  })

  it('is only reachable from a role-gated chip', () => {
    const offenders: string[] = []
    for (const [id, chips] of chipsReachingEachNode()) {
      const node = getCoachNode(id)
      if (node === null || !GENDERED.test(textOf(node))) continue
      const ungated = [...chips].filter((chip) => !GATED_CHIPS.has(chip))
      if (ungated.length > 0) {
        offenders.push(`${id} reachable from ungated ${ungated.join(', ')}`)
      }
    }
    expect(offenders).toEqual([])
  })

  it('keeps every shared surface free of gendered pronouns', () => {
    // These are the strings both roles see. The coach sheet is not one of them.
    for (const day of DAYS) {
      const shared = [
        day.todayGuidance,
        day.partnerGuidance,
        day.why,
        day.reassurance,
        day.notification.text,
        ...day.partnerActions,
        ...day.plans.flatMap((plan) => [plan.title, plan.detail]),
      ]
      for (const text of shared) {
        expect(GENDERED.test(text), `day ${day.day}: ${JSON.stringify(text)}`).toBe(false)
      }
    }
  })

  it('still has a gate to enforce', () => {
    // If supportTip ever stops being role-gated, the reachability check above
    // silently becomes vacuous rather than failing.
    expect(GATED_CHIPS.has('supportTip')).toBe(true)
  })
})
