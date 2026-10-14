/** Default weights from the spec. Configurable in a later stage. */
export const weights = {
  technical: 0.3,
  experience: 0.25,
  responsibilities: 0.2,
  qualifications: 0.15,
  workArrangement: 0.1,
} as const;

export type Criteria = Record<keyof typeof weights, number>;

export const criteriaLabel: Record<keyof typeof weights, string> = {
  technical: 'Technical skills',
  experience: 'Relevant experience',
  responsibilities: 'Role alignment',
  qualifications: 'Required qualifications',
  workArrangement: 'Work arrangement',
};

export function weightedScore(c: Criteria): number {
  const total = (Object.keys(weights) as Array<keyof typeof weights>).reduce((s, k) => s + c[k] * weights[k], 0);
  return Math.round(total * 10) / 10;
}
