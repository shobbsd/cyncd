import type { CyclePrediction, ScoreBand, ScoreResult } from './types';

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

function supportCompatibility(primary?: string, partner?: string): number {
  if (primary === undefined || partner === undefined) return NEUTRAL;
  return primary === partner ? 100 : 60;
}

function communicationCompatibility(primary?: string, partner?: string): number {
  if (primary === undefined || partner === undefined) return NEUTRAL;
  if (primary === 'Depends on the day') return 70;
  if (primary === 'Talk it through soon' && partner === 'Talk immediately') return 100;
  if (primary === 'Need time first' && partner === 'Need time first') return 100;
  return 50;
}

function socialCompatibility(primary?: string, partner?: string): number {
  if (primary === undefined || partner === undefined) return NEUTRAL;
  if (primary === partner) return 100;
  if (primary === 'Depends' || partner === 'Depends') return 75;
  return 55;
}

function primaryCapacity(answer?: string): number {
  if (answer === 'Fairly steady') return 75;
  if (answer === 'Some ups and downs') return 60;
  if (answer === 'Big swings') return 45;
  return NEUTRAL;
}

function partnerCapacity(answer?: string): number {
  if (answer === 'Moderate') return 65;
  if (answer === 'High') return 60;
  if (answer === 'Low') return 55;
  return NEUTRAL;
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
  primaryAnswers: Record<string, string>;
  partnerAnswers: Record<string, string>;
  cycle: CyclePrediction;
  completedAction: boolean;
  accuracyFeedback?: number;
}): ScoreResult {
  const communication = clamp(
    average([
      supportCompatibility(primaryAnswers.support, partnerAnswers.support),
      communicationCompatibility(
        primaryAnswers.communication,
        partnerAnswers.communication,
      ),
    ]),
  );
  const capacityInputs = [
    socialCompatibility(primaryAnswers.social, partnerAnswers.social),
    primaryCapacity(primaryAnswers.energy),
    partnerCapacity(partnerAnswers.energy),
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
