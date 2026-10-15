import { describe, expect, it } from 'vitest';
import { likelyOpenToPH, mapRemotiveJob, stripHtml } from '../src/data/sources/remotive';

describe('stripHtml', () => {
  it('removes tags and scripts, keeps bullets, decodes entities', () => {
    const out = stripHtml('<p>Hello &amp; welcome</p><script>alert(1)</script><ul><li>One</li><li>Two</li></ul>');
    expect(out).toContain('Hello & welcome');
    expect(out).toContain('• One');
    expect(out).toContain('• Two');
    expect(out).not.toContain('alert');
    expect(out).not.toContain('<');
  });
});

describe('likelyOpenToPH', () => {
  it('accepts worldwide/asia/unknown and rejects regional restrictions', () => {
    expect(likelyOpenToPH('Worldwide')).toBe(true);
    expect(likelyOpenToPH('Asia')).toBe(true);
    expect(likelyOpenToPH('Remote')).toBe(true);
    expect(likelyOpenToPH('USA Only')).toBe(false);
    expect(likelyOpenToPH('Europe')).toBe(false);
  });
});

describe('mapRemotiveJob', () => {
  const good = {
    id: 123, url: 'https://remotive.com/remote-jobs/x/y-123', title: 'Dev', company_name: 'Acme',
    tags: ['python', 7, 'sql'], candidate_required_location: 'Worldwide', salary: '$50k', job_type: 'full_time',
    publication_date: '2026-10-10T08:00:00', description: '<p>Build things</p>',
  };
  it('maps valid records including full description and eligibility', () => {
    const j = mapRemotiveJob(good)!;
    expect(j.id).toBe('remotive-123');
    expect(j.requiredSkills).toEqual(['python', 'sql']);
    expect(j.description).toBe('Build things');
    expect(j.employmentType).toBe('full time');
    expect(j.eligibility).toContain('Worldwide');
  });
  it('does not truncate long descriptions below the cap', () => {
    const long = 'x'.repeat(5000);
    expect(mapRemotiveJob({ ...good, description: `<p>${long}</p>` })!.description.length).toBe(5000);
  });
  it('rejects bad records', () => {
    expect(mapRemotiveJob(null)).toBeNull();
    expect(mapRemotiveJob({ ...good, url: 'http://insecure' })).toBeNull();
    expect(mapRemotiveJob({ ...good, title: '' })).toBeNull();
  });
});
