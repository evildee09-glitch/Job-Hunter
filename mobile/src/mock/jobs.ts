import type { Job } from '../domain/types';

type Seed = Omit<Job, 'id' | 'postedAt' | 'saved' | 'shortlisted' | 'listingStatus'>;

const base: Seed[] = [
  { title: 'Senior Backend Engineer', company: 'Northwind Labs', location: 'Manila, PH', arrangement: 'hybrid',
    salary: { min: 90000, max: 130000, currency: 'PHP' }, source: 'company-careers', url: 'https://example.com/jobs/1',
    description: 'Build and operate Python APIs. Own services end to end with a small team.',
    requiredSkills: ['Python', 'FastAPI', 'PostgreSQL'], preferredSkills: ['Docker', 'AWS'], score: 9, mandatoryUnmet: [] },
  { title: 'Full-Stack Developer', company: 'Kite Digital', location: 'Remote (APAC)', arrangement: 'remote',
    salary: { min: 3500, max: 5000, currency: 'USD' }, source: 'feed', url: 'https://example.com/jobs/2',
    description: 'React and Node product work for a SaaS platform.',
    requiredSkills: ['React', 'TypeScript', 'Node.js'], preferredSkills: ['GraphQL'], score: 7, mandatoryUnmet: [] },
  { title: 'Data Platform Engineer', company: 'Lumen Analytics', location: 'Cebu, PH', arrangement: 'onsite',
    source: 'manual-import', url: 'https://example.com/jobs/3',
    description: 'Maintain ETL pipelines and warehouse models.',
    requiredSkills: ['SQL', 'Airflow', 'Python'], preferredSkills: ['dbt'], score: 5, mandatoryUnmet: ['5+ years Airflow'] },
  { title: 'Mobile Engineer (Ionic)', company: 'Pocketry', location: 'Remote (PH)', arrangement: 'remote',
    source: 'feed', url: 'https://example.com/jobs/4',
    description: 'Ship an Ionic/Capacitor app on Android and iOS.',
    requiredSkills: ['Ionic', 'Capacitor', 'TypeScript'], preferredSkills: ['Swift'], score: 8, mandatoryUnmet: [] },
  { title: 'DevOps Engineer', company: 'Ardent Systems', location: 'Quezon City, PH', arrangement: 'hybrid',
    source: 'company-careers', url: 'https://example.com/jobs/5',
    description: 'CI/CD, Kubernetes, and observability.',
    requiredSkills: ['Kubernetes', 'Terraform', 'Linux'], preferredSkills: ['Go'], score: 3, mandatoryUnmet: ['CKA certification'] },
  { title: 'Junior QA Automation Engineer', company: 'Brightpath', location: 'Makati, PH', arrangement: 'onsite',
    source: 'feed', url: 'https://example.com/jobs/6',
    description: 'Write Playwright and API tests.',
    requiredSkills: ['Playwright', 'JavaScript'], preferredSkills: ['CI'], mandatoryUnmet: [] },
];

export const mockJobs: Job[] = Array.from({ length: 30 }, (_, i) => {
  const b = base[i % base.length];
  const d = new Date(Date.UTC(2026, 9, 14 - (i % 20)));
  return {
    ...b,
    id: `job-${i + 1}`,
    title: i < base.length ? b.title : `${b.title} (${Math.floor(i / base.length) + 1})`,
    postedAt: d.toISOString(),
    listingStatus: i % 11 === 10 ? 'expired' : 'active',
    saved: i % 4 === 0,
    shortlisted: i % 7 === 0,
  };
});
