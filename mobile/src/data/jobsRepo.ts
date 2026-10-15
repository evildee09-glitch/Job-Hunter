import type { JobsRepo } from './repos';
import { loadRemotive } from './jobCache';
import { getFlags } from './jobFlags';
import { fetchHimalayasPage, getHimalayasJob } from './sources/himalayas';
import { likelyOpenToPH } from './sources/remotive';

export const jobsRepo: JobsRepo = {
  async list({ query, cursor, limit = 10, source = 'remotive', philippinesOnly }) {
    if (source === 'himalayas') {
      const page = cursor ? parseInt(cursor, 10) : 1;
      const { jobs, hasMore } = await fetchHimalayasPage(query ?? '', !!philippinesOnly, page);
      return { items: jobs, nextCursor: hasMore ? String(page + 1) : null };
    }
    const { jobs } = await loadRemotive();
    const q = query?.trim().toLowerCase();
    let filtered = q
      ? jobs.filter((j) => [j.title, j.company, j.location, ...j.requiredSkills].some((s) => s.toLowerCase().includes(q)))
      : jobs;
    if (philippinesOnly) filtered = filtered.filter((j) => likelyOpenToPH(j.location));
    const start = cursor ? parseInt(cursor, 10) : 0;
    const next = start + limit;
    return { items: filtered.slice(start, next), nextCursor: next < filtered.length ? String(next) : null };
  },

  async get(id) {
    const f = getFlags();
    const flagged = [...f.saved, ...f.shortlisted].find((j) => j.id === id);
    if (flagged) return flagged;
    if (id.startsWith('himalayas-')) return getHimalayasJob(id);
    const { jobs } = await loadRemotive();
    return jobs.find((j) => j.id === id);
  },
};
