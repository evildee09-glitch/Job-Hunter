import { describe, expect, it } from 'vitest';
import { scoreBand } from '../src/domain/scoring';

describe('scoreBand', () => {
  it('maps spec thresholds', () => {
    expect(scoreBand(10)).toBe('excellent');
    expect(scoreBand(8)).toBe('strong');
    expect(scoreBand(5)).toBe('consider');
    expect(scoreBand(4)).toBe('low');
    expect(scoreBand(undefined)).toBe('unscored');
  });
});
