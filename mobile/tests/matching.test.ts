import { describe, expect, it } from 'vitest';
import { matchJob } from '../src/domain/matching';
import type { Job } from '../src/domain/types';

const job = (over: Partial<Job>): Job => ({
  id: 'x', title: 'Python Developer', company: 'Acme', location: 'Worldwide', arrangement: 'remote', postedAt: '2026-01-01',
  source: 'T', url: 'https://x', description: 'Build services with SQL.', requiredSkills: ['python', 'sql', 'docker'],
  preferredSkills: [], listingStatus: 'active', mandatoryUnmet: [], saved: false, shortlisted: false, ...over,
});

describe('matchJob', () => {
  it('scores by verified skills, weighting title hits', () => {
    const r = matchJob(job({}), ['Python', 'SQL', 'Go'], []);
    expect(r.matched).toEqual(['Python', 'SQL']);
    expect(r.missing).toEqual(['docker']);
    expect(r.score).toBe(4);
  });
  it('returns no score without verified skills', () => {
    expect(matchJob(job({}), [], []).score).toBeUndefined();
  });
  it('does not match ambiguous 2-letter skills inside free text', () => {
    expect(matchJob(job({ description: 'We use go and more', requiredSkills: [] }), ['Go'], []).matched).toEqual([]);
  });
  it('handles regex characters in skill names', () => {
    expect(matchJob(job({ requiredSkills: ['c++'] }), ['C++'], []).matched).toEqual(['C++']);
  });
  it('rewards a matching past job title', () => {
    const a = matchJob(job({ requiredSkills: [] , description: ''}), ['Rust'], []).score!;
    const b = matchJob(job({ requiredSkills: [], description: '' }), ['Rust'], ['Python Developer']).score!;
    expect(b).toBeGreaterThan(a);
  });
});
