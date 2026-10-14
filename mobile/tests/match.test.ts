import { describe, expect, it } from 'vitest';
import { weightedScore, weights } from '../src/domain/match';

describe('weightedScore', () => {
  it('weights sum to 1', () => {
    expect(Object.values(weights).reduce((a, b) => a + b, 0)).toBeCloseTo(1);
  });
  it('computes the weighted average', () => {
    expect(weightedScore({ technical: 10, experience: 10, responsibilities: 10, qualifications: 10, workArrangement: 10 })).toBe(10);
    expect(weightedScore({ technical: 8, experience: 6, responsibilities: 4, qualifications: 2, workArrangement: 10 })).toBe(6);
  });
});
