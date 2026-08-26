import type { CyclePrediction, ForecastView } from './types';

const OUTLOOK_COPY = {
  period: {
    detail: 'A quieter pace may feel right for a few days.',
    mood: 'Keep expectations gentle.',
    energy: 'Make room for rest if you need it.',
  },
  follicular: {
    detail: 'Your energy may be building over the next few days.',
    mood: 'You may feel ready to take things on.',
    energy: 'A good time to notice what feels restorative.',
  },
  ovulatory: {
    detail: 'You may feel more open and connected right now.',
    mood: 'Lean into what feels easy and social.',
    energy: 'Use the lift in whatever way suits you.',
  },
  luteal: {
    detail: 'A little more space and structure may help today.',
    mood: 'Keep plans flexible and check in with yourself.',
    energy: 'Choose one useful thing, then give yourself room.',
  },
} as const;

export function forecastFor(prediction: CyclePrediction): ForecastView {
  if (prediction.kind === 'unavailable') {
    return {
      title: 'Your forecast will take shape here',
      detail: 'Log your first period to start seeing a personal outlook.',
      mood: 'Your daily guidance is still here while you get started.',
      energy: 'There is no pressure to log everything at once.',
      action: 'Log your first period',
      outlook: [],
    };
  }

  const copy = OUTLOOK_COPY[prediction.phase];
  return {
    title: `Your next period is expected ${prediction.nextPeriodStart}`,
    detail: copy.detail,
    mood: copy.mood,
    energy: copy.energy,
    action: 'Track how you feel',
    outlook: prediction.outlook,
  };
}
