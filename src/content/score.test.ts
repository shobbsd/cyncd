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
        support: 'Give me space',
        communication: 'Need time first',
        changes: ['Mood'],
        connection: ['Talking', 'Quality time'],
      },
      partnerAnswers: {
        struggling: 'Give them space',
        communication: 'Take some time first',
        connection: ['Talking'],
      },
      cycle: { kind: 'unavailable' } as const,
    }

    const pending = calculateScore({ ...input, completedAction: false })
    const complete = calculateScore({ ...input, completedAction: true })

    expect(complete.components.completedAction).toBe(100)
    expect(complete.percentage).toBeGreaterThan(pending.percentage)
  })
})

describe('compatibility across the two onboarding vocabularies', () => {
  const base = { cycle: { kind: 'unavailable' } as const, completedAction: false }

  it('matches "Give me space" with "Give them space" rather than by string', () => {
    const matched = calculateScore({
      ...base,
      primaryAnswers: { support: 'Give me space', communication: 'Need time first' },
      partnerAnswers: { struggling: 'Give them space', communication: 'Take some time first' },
    })
    const mismatched = calculateScore({
      ...base,
      primaryAnswers: { support: 'Give me space', communication: 'Talk about it straight away' },
      partnerAnswers: { struggling: 'Practical help', communication: 'Take some time first' },
    })
    expect(matched.components.communication).toBe(100)
    expect(mismatched.components.communication).toBeLessThan(matched.components.communication)
  })

  it('scores shared connection preferences above none in common', () => {
    const shared = calculateScore({
      ...base,
      primaryAnswers: { connection: ['Talking', 'Quality time'] },
      partnerAnswers: { connection: ['Talking', 'Quality time'] },
    })
    const apart = calculateScore({
      ...base,
      primaryAnswers: { connection: ['Talking'] },
      partnerAnswers: { connection: ['Acts of care'] },
    })
    expect(shared.components.energyAndCapacity).toBeGreaterThan(apart.components.energyAndCapacity)
  })
})
