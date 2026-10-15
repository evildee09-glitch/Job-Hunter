import { describe, expect, it } from 'vitest';
import { mapHimalayasJob } from '../src/data/sources/himalayas';

const good = {
  title: 'Senior Engineer', excerpt: 'Short', companyName: 'Acme', employmentType: 'Full Time',
  minSalary: 50000, maxSalary: 80000, currency: 'USD', salaryPeriod: 'annual', seniority: ['Senior', 'Mid-level'],
  locationRestrictions: [{ alpha2: 'PH', name: 'Philippines', slug: 'philippines' }], timezoneRestrictions: ['8'],
  categories: ['Engineering', 'Backend'], description: '<p>Do <b>work</b></p><ul><li>Python</li></ul>',
  pubDate: Date.UTC(2026, 9, 10), expiryDate: Date.UTC(2099, 0, 1),
  applicationLink: 'https://himalayas.app/companies/acme/jobs/senior-engineer', guid: 'https://himalayas.app/companies/acme/jobs/senior-engineer',
};

describe('mapHimalayasJob', () => {
  it('maps a valid record', () => {
    const j = mapHimalayasJob(good)!;
    expect(j.id).toMatch(/^himalayas-[0-9a-f]+$/);
    expect(j.company).toBe('Acme');
    expect(j.salaryText).toBe('USD 50,000-80,000 (annual)');
    expect(j.seniority).toBe('Senior, Mid-level');
    expect(j.eligibility).toContain('Must be based in: Philippines');
    expect(j.description).toContain('• Python');
    expect(j.listingStatus).toBe('active');
  });
  it('treats empty location restrictions as worldwide', () => {
    const j = mapHimalayasJob({ ...good, locationRestrictions: [], timezoneRestrictions: [] })!;
    expect(j.location).toBe('Worldwide');
    expect(j.eligibility).toBe('Open to applicants worldwide');
  });
  it('produces URL-safe stable ids', () => {
    expect(mapHimalayasJob(good)!.id).toBe(mapHimalayasJob(good)!.id);
  });
  it('rejects records without https link or title', () => {
    expect(mapHimalayasJob({ ...good, applicationLink: 'http://x' })).toBeNull();
    expect(mapHimalayasJob({ ...good, title: '' })).toBeNull();
    expect(mapHimalayasJob(undefined)).toBeNull();
  });
});
