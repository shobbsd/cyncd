import { describe, expect, it } from 'vitest'
import { calculateScore, scoreBandFor } from './score'

describe('scoreBandFor', () => {
  it.each([
    [80, 'Naturally aligned'],
    [79, 'Gently connected'],
    [60, 'Gently connected'],
    [59, 'Different rhythms'],
    [40, 'Different rhythms'],
    [39, 'Extra-care day'],
  ] as const)('labels %i as %s', (percentage, label) => {
    const band = scoreBandFor(percentage)
    expect(band.label).toBe(label)
    expect(band.action).not.toBe('')
  })
})

describe('calculateScore', () => {
  it('stays neutral and communicates uncertainty without cycle data', () => {
    const score = calculateScore({
      primaryAnswers: {},
      partnerAnswers: {},
      cycle: { kind: 'unavailable' },
      completedAction: false,
    })

    expect(score.percentage).toBe(50)
    expect(score.confidence).toBe(
      'Still learning — this becomes more personal as you both share feedback.',
    )
  })

  it('raises the behaviour component when the shared action is completed', () => {
    const input = {
      primaryAnswers: {
        support: 'Space',
        communication: 'Need time first',
        energy: 'Fairly steady',
        social: 'At home',
      },
      partnerAnswers: {
        support: 'Space',
        communication: 'Need time first',
        energy: 'Moderate',
        social: 'At home',
      },
      cycle: { kind: 'unavailable' } as const,
    }

    const pending = calculateScore({ ...input, completedAction: false })
    const complete = calculateScore({ ...input, completedAction: true })

    expect(complete.components.completedAction).toBe(100)
    expect(complete.percentage).toBeGreaterThan(pending.percentage)
  })
})
