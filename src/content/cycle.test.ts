import { describe, expect, it } from 'vitest'
import { predictCycle } from './cycle'

describe('predictCycle', () => {
  it('returns unavailable without a valid period date', () => {
    expect(predictCycle({}, '2026-08-25')).toEqual({ kind: 'unavailable' })
    expect(
      predictCycle(
        { lastPeriodStart: 'not-a-date', cycleLength: 28 },
        '2026-08-25',
      ),
    ).toEqual({ kind: 'unavailable' })
  })

  it('returns unavailable for an invalid cycle length', () => {
    expect(
      predictCycle(
        { lastPeriodStart: '2026-08-01', cycleLength: 19 },
        '2026-08-25',
      ),
    ).toEqual({ kind: 'unavailable' })
  })

  it('defaults a missing cycle length to 28 days', () => {
    expect(
      predictCycle({ lastPeriodStart: '2026-08-01' }, '2026-08-25'),
    ).toMatchObject({
      kind: 'predicted',
      cycleDay: 25,
      nextPeriodStart: '2026-08-29',
    })
  })

  it('derives a one-based cycle day and seven-day outlook', () => {
    const prediction = predictCycle(
      { lastPeriodStart: '2026-08-01', cycleLength: 28 },
      '2026-08-25',
    )

    expect(prediction).toMatchObject({
      kind: 'predicted',
      cycleDay: 25,
      phase: 'luteal',
      nextPeriodStart: '2026-08-29',
    })
    expect(prediction.kind === 'predicted' && prediction.outlook).toHaveLength(7)
  })

  it('normalises predictions into a new shorter cycle', () => {
    expect(
      predictCycle(
        { lastPeriodStart: '2026-08-01', cycleLength: 24 },
        '2026-08-25',
      ),
    ).toMatchObject({
      kind: 'predicted',
      cycleDay: 1,
      nextPeriodStart: '2026-09-18',
    })
  })

  it('keeps a longer cycle on its final day', () => {
    expect(
      predictCycle(
        { lastPeriodStart: '2026-08-01', cycleLength: 32 },
        '2026-09-01',
      ),
    ).toMatchObject({
      kind: 'predicted',
      cycleDay: 32,
      nextPeriodStart: '2026-09-02',
    })
  })

  it('prefers a more recent logged period start over the onboarding seed', () => {
    expect(
      predictCycle(
        { lastPeriodStart: '2026-08-01', cycleLength: 28 },
        '2026-08-25',
        [{ id: 'cycle-1', date: '2026-08-20', period: 'start' }],
      ),
    ).toMatchObject({ kind: 'predicted', cycleDay: 6 })
  })
})
