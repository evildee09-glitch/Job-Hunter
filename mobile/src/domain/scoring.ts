export type ScoreBand = 'excellent' | 'strong' | 'consider' | 'low' | 'unscored';

/** Default thresholds from the spec: 9-10, 7-8, 5-6, 1-4. Configurable later. */
export function scoreBand(score?: number): ScoreBand {
  if (score === undefined) return 'unscored';
  if (score >= 9) return 'excellent';
  if (score >= 7) return 'strong';
  if (score >= 5) return 'consider';
  return 'low';
}

export const bandLabel: Record<ScoreBand, string> = {
  excellent: 'Excellent match',
  strong: 'Strong match',
  consider: 'Consider after review',
  low: 'Low priority',
  unscored: 'Not analyzed',
};
