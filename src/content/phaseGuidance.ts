import type { CyclePhase, PhaseGuidance } from './types';

export const PHASE_GUIDANCE: Record<CyclePhase, PhaseGuidance> = {
  period: {
    kind: 'phase', dayType: 'lowEnergy', label: 'Gentle',
    todayGuidance: 'A softer pace may make connection easier today.',
    partnerGuidance: 'A small check-in and practical care may go a long way.',
    reassurance: 'Keeping things simple can still feel close.',
    why: 'A little extra room around plans can make it easier to respond to each other with care.',
    approach: 'reassurance', actions: ['Offer one simple option.', 'Make room for a quieter evening.'],
  },
  follicular: {
    kind: 'phase', dayType: 'focused', label: 'Clear',
    todayGuidance: 'There may be more room for plans and clear conversation today.',
    partnerGuidance: 'This could be a good moment to make a plan together.',
    reassurance: 'Let the day be useful without filling every moment.',
    why: 'Shared decisions can feel easier when both of you have space to think them through.',
    approach: 'conversation', actions: ['Choose one plan to move forward.', 'Check in before adding more.'],
  },
  ovulatory: {
    kind: 'phase', dayType: 'social', label: 'Open',
    todayGuidance: 'Connection and conversation may feel more open today.',
    partnerGuidance: 'A good day to enjoy time together outside the usual routine.',
    reassurance: 'Follow what feels easy, rather than making it a big occasion.',
    why: 'A shared activity or honest conversation can be a natural way to reconnect.',
    approach: 'conversation', actions: ['Suggest something you can enjoy together.', 'Make space for a real conversation.'],
  },
  luteal: {
    kind: 'phase', dayType: 'calm', label: 'Thoughtful',
    todayGuidance: 'Clear communication and a little extra thoughtfulness may help today.',
    partnerGuidance: 'Patience and a warm check-in can help you stay connected.',
    reassurance: 'You do not need to solve everything at once.',
    why: 'Naming what each of you needs can keep small moments from becoming bigger than they are.',
    approach: 'space', actions: ['Ask what would feel supportive.', 'Keep plans flexible.'],
  },
};

export const TRAIT_GUIDANCE: PhaseGuidance = {
  kind: 'trait', dayType: 'calm', label: 'Starting point',
  todayGuidance: 'Use today as a starting point for noticing what helps you connect.',
  partnerGuidance: 'A simple check-in can help you understand what each of you needs.',
  reassurance: 'cyncd will become more personal as it learns with you.',
  why: 'Small observations over time can make the guidance feel more useful.',
  approach: 'conversation', actions: ['Ask how you can make today easier.', 'Choose one small way to connect.'],
};

export function guidanceFor(
  prediction:
    | { kind: 'unavailable' }
    | { kind: 'predicted'; phase: CyclePhase },
): PhaseGuidance {
  return prediction.kind === 'predicted'
    ? PHASE_GUIDANCE[prediction.phase]
    : TRAIT_GUIDANCE;
}
