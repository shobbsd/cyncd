import { answerList, answerText } from './onboarding';
import type {
  CyclePrediction,
  OnboardingAnswer,
  ScoreBand,
  ScoreResult,
} from './types';

export const SCORE_CONFIDENCE =
  'Still learning — this becomes more personal as you both share feedback.';

const NEUTRAL = 50;

export const SCORE_BANDS: Record<
  ScoreBand,
  { label: string; line: string; action: string }
> = {
  naturallyAligned: {
    label: 'Naturally aligned',
    line: 'Connection and communication may feel more natural today.',
    action: 'Make time for something you both enjoy.',
  },
  gentlyConnected: {
    label: 'Gently connected',
    line: 'There is good potential for connection, but thoughtfulness may make the difference.',
    action: 'Choose one small way to be present with each other.',
  },
  differentRhythms: {
    label: 'Different rhythms',
    line: 'Both users may need different things today, so clear communication will be important.',
    action: 'Ask what would feel most supportive before making plans.',
  },
  extraCare: {
    label: 'Extra-care day',
    line: 'Patience, reassurance or personal space may be especially helpful.',
    action: 'Keep plans simple and offer reassurance without pressure.',
  },
};

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * What someone wants on a hard day and what their partner reaches for, in one
 * shared vocabulary. The two onboarding flows word these differently ("Give me
 * space" / "Give them space"), so they meet here rather than by string match.
 */
const PRIMARY_SUPPORT: Record<string, string> = {
  'Give me space': 'space',
  'Check in with me': 'checkIn',
  'Reassure me': 'reassure',
  'Physical affection': 'affection',
  'Practical help': 'practical',
  'Distract me / make me laugh': 'lighten',
  'Ask me what I need': 'ask',
  'It depends': 'ask',
};

const PARTNER_SUPPORT: Record<string, string> = {
  'Give them space': 'space',
  'Check in': 'checkIn',
  'Reassure them': 'reassure',
  'Physical affection': 'affection',
  'Practical help': 'practical',
  'Try to lighten the mood': 'lighten',
  'Ask what they need': 'ask',
};

function supportCompatibility(primary?: string, partner?: string): number {
  if (primary === undefined || partner === undefined) return NEUTRAL;
  const wants = PRIMARY_SUPPORT[primary];
  const offers = PARTNER_SUPPORT[partner];
  if (wants !== undefined && wants === offers) return 100;
  // Asking is never a mismatch — it is how the right thing gets found.
  if (offers === 'ask') return 85;
  return 60;
}

const PRIMARY_COMMUNICATION: Record<string, string> = {
  'Talk about it straight away': 'talk',
  'Need time first': 'time',
  'Go quiet': 'time',
  'Try to solve it myself': 'time',
};

const PARTNER_COMMUNICATION: Record<string, string> = {
  'Talk it through straight away': 'talk',
  'Take some time first': 'time',
};

function communicationCompatibility(primary?: string, partner?: string): number {
  if (primary === undefined || partner === undefined) return NEUTRAL;
  const mine = PRIMARY_COMMUNICATION[primary];
  const theirs = PARTNER_COMMUNICATION[partner];
  if (mine === undefined || theirs === undefined) return 70;
  return mine === theirs ? 100 : 50;
}

/** How much of what makes each of them feel connected overlaps. */
function connectionCompatibility(primary: string[], partner: string[]): number {
  if (primary.length === 0 || partner.length === 0) return NEUTRAL;
  const shared = primary.filter((option) => partner.includes(option)).length;
  if (shared >= 2) return 100;
  if (shared === 1) return 80;
  return 55;
}

function primaryCapacity(changes: string[]): number {
  if (changes.length === 0) return NEUTRAL;
  if (changes.includes('Energy')) return 50;
  if (changes.includes("Nothing I've noticed")) return 75;
  return 60;
}

function phaseCapacity(cycle: CyclePrediction): number | null {
  if (cycle.kind === 'unavailable') return null;
  if (cycle.phase === 'ovulatory') return 70;
  if (cycle.phase === 'follicular') return 60;
  if (cycle.phase === 'luteal') return 50;
  return 45;
}

export function scoreBandFor(percentage: number): ScoreResult {
  const band: ScoreBand =
    percentage >= 80
      ? 'naturallyAligned'
      : percentage >= 60
        ? 'gentlyConnected'
        : percentage >= 40
          ? 'differentRhythms'
          : 'extraCare';
  const copy = SCORE_BANDS[band];
  return {
    percentage: clamp(percentage),
    band,
    ...copy,
    confidence: SCORE_CONFIDENCE,
    components: {
      communication: NEUTRAL,
      energyAndCapacity: NEUTRAL,
      completedAction: NEUTRAL,
      accuracyFeedback: NEUTRAL,
    },
  };
}

export function calculateScore({
  primaryAnswers,
  partnerAnswers,
  cycle,
  completedAction,
  accuracyFeedback = NEUTRAL,
}: {
  primaryAnswers: Record<string, OnboardingAnswer>;
  partnerAnswers: Record<string, OnboardingAnswer>;
  cycle: CyclePrediction;
  completedAction: boolean;
  accuracyFeedback?: number;
}): ScoreResult {
  const communication = clamp(
    average([
      supportCompatibility(
        answerText(primaryAnswers.support),
        answerText(partnerAnswers.struggling),
      ),
      communicationCompatibility(
        answerText(primaryAnswers.communication),
        answerText(partnerAnswers.communication),
      ),
    ]),
  );
  const capacityInputs = [
    connectionCompatibility(
      answerList(primaryAnswers.connection),
      answerList(partnerAnswers.connection),
    ),
    primaryCapacity(answerList(primaryAnswers.changes)),
  ];
  const phase = phaseCapacity(cycle);
  if (phase !== null) capacityInputs.push(phase);
  const energyAndCapacity = clamp(average(capacityInputs));
  const completedActionComponent = completedAction ? 100 : NEUTRAL;
  const accuracyFeedbackComponent = clamp(accuracyFeedback);
  const percentage = clamp(
    communication * 0.4 +
      energyAndCapacity * 0.3 +
      completedActionComponent * 0.2 +
      accuracyFeedbackComponent * 0.1,
  );
  const score = scoreBandFor(percentage);

  return {
    ...score,
    components: {
      communication,
      energyAndCapacity,
      completedAction: completedActionComponent,
      accuracyFeedback: accuracyFeedbackComponent,
    },
  };
}
