import type { JobsRepo } from './repos';
import { mockJobs } from '../mock/jobs';

/** Dev switches for exercising loading/error UI. */
export const mockControls = { latencyMs: 400, forceError: false };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const mockJobsRepo: JobsRepo = {
  async list({ query, cursor, limit = 10 }) {
    await wait(mockControls.latencyMs);
    if (mockControls.forceError) throw new Error('Simulated network failure');
    const q = query?.trim().toLowerCase();
    const filtered = q
      ? mockJobs.filter((j) =>
          [j.title, j.company, j.location, ...j.requiredSkills].some((s) => s.toLowerCase().includes(q)))
      : mockJobs;
    const start = cursor ? parseInt(cursor, 10) : 0;
    const items = filtered.slice(start, start + limit);
    const next = start + limit;
    return { items, nextCursor: next < filtered.length ? String(next) : null };
  },
  async get(id) {
    await wait(mockControls.latencyMs);
    if (mockControls.forceError) throw new Error('Simulated network failure');
    return mockJobs.find((j) => j.id === id);
  },
};

export const jobsRepo: JobsRepo = mockJobsRepo;
