import { describe, expect, it } from 'vitest';
import { scoreBand } from '../src/domain/scoring';
import { mockJobsRepo, mockControls } from '../src/data/mockRepos';

mockControls.latencyMs = 0;

describe('scoreBand', () => {
  it('maps spec thresholds', () => {
    expect(scoreBand(10)).toBe('excellent');
    expect(scoreBand(8)).toBe('strong');
    expect(scoreBand(5)).toBe('consider');
    expect(scoreBand(4)).toBe('low');
    expect(scoreBand(undefined)).toBe('unscored');
  });
});

describe('mockJobsRepo', () => {
  it('paginates without repeating items', async () => {
    const a = await mockJobsRepo.list({ limit: 10 });
    const b = await mockJobsRepo.list({ limit: 10, cursor: a.nextCursor! });
    expect(a.items).toHaveLength(10);
    expect(new Set([...a.items, ...b.items].map((j) => j.id)).size).toBe(20);
  });
  it('filters by query', async () => {
    const r = await mockJobsRepo.list({ query: 'ionic', limit: 50 });
    expect(r.items.length).toBeGreaterThan(0);
    expect(r.items.every((j) => /ionic/i.test(JSON.stringify(j)))).toBe(true);
  });
});
