import { describe, expect, it } from 'vitest'
import { ONBOARDING_STEPS, PARTNER_STEPS } from './onboarding'
import { confirmationFor, understand } from './understand'

describe('understand', () => {
  it('turns the notes’ example sentence into the four signals it promises', () => {
    const result = understand(
      'Before my period I get really emotional, don’t want to go out, get spots and usually want more reassurance from my partner.',
    )
    expect(result.timing).toBe('before')
    expect(result.signals).toEqual([
      'Mood sensitivity',
      'Lower social energy',
      'Skin changes',
      'More need for reassurance',
    ])
    expect(confirmationFor(result)).toEqual({
      title: 'I’ve got you.',
      lead: 'Before your period you tend to notice:',
    })
  })

  it('confirms in their own words when nothing matches, rather than inventing a signal', () => {
    const result = understand('Honestly, not much to add.')
    expect(result).toEqual({ timing: null, signals: [] })
    expect(confirmationFor(result).lead).toBe('Cyncd has saved that in your words.')
  })

  it('finds at least one signal in every scripted Speak sample', () => {
    const samples = [...ONBOARDING_STEPS, ...PARTNER_STEPS].flatMap((step) =>
      step.kind === 'tell' ? [step.sample] : 'tellMore' in step && step.tellMore ? [step.tellMore.sample] : [],
    )
    expect(samples.length).toBeGreaterThanOrEqual(4)
    for (const sample of samples) {
      expect(understand(sample).signals, sample).not.toEqual([])
    }
  })
})
