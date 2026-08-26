import { describe, expect, it } from 'vitest'
import { guidanceFor } from './phaseGuidance'

describe('guidanceFor', () => {
  it.each(['period', 'follicular', 'ovulatory', 'luteal'] as const)(
    'returns safe shared guidance for %s',
    (phase) => {
      const guidance = guidanceFor({ kind: 'predicted', phase })
      expect(guidance.kind).toBe('phase')
      expect(guidance.todayGuidance).not.toBe('')
      expect(guidance.partnerGuidance).not.toBe('')
      expect(guidance.actions.length).toBeGreaterThan(0)
    },
  )

  it('returns trait guidance when the cycle is unavailable', () => {
    expect(guidanceFor({ kind: 'unavailable' }).kind).toBe('trait')
  })
})
