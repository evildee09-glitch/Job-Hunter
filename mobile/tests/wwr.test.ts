import { describe, expect, it } from 'vitest';
import { mapWwrItem, type WwrFields } from '../src/data/sources/wwr';

const base: WwrFields = {
  title: 'Acme Inc: Senior Backend Engineer', link: 'https://weworkremotely.com/remote-jobs/acme-senior-backend',
  pubDate: 'Fri, 09 Oct 2026 10:00:00 +0000', description: '<p>Build <b>APIs</b></p><ul><li>Python</li></ul>',
  category: 'Programming', type: 'Full-Time', region: 'Anywhere in the World', country: '', skills: 'Python, SQL', expires_at: '',
};

describe('mapWwrItem', () => {
  it('splits "Company: Title" and maps fields', () => {
    const j = mapWwrItem(base)!;
    expect(j.company).toBe('Acme Inc');
    expect(j.title).toBe('Senior Backend Engineer');
    expect(j.requiredSkills).toEqual(['Python', 'SQL']);
    expect(j.description).toContain('• Python');
    expect(j.eligibility).toBe('Eligible region: Anywhere in the World');
    expect(j.id).toMatch(/^wwr-/);
  });
  it('keeps unknown company honest', () => {
    expect(mapWwrItem({ ...base, title: 'Just a title' })!.company).toBe('Unknown company');
  });
  it('rejects non-https links and empty titles', () => {
    expect(mapWwrItem({ ...base, link: 'http://x' })).toBeNull();
    expect(mapWwrItem({ ...base, title: ' ' })).toBeNull();
  });
});
