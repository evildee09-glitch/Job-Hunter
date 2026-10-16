import type { JobsRepo } from './repos';
import type { Job } from '../domain/types';
import { loadRemotive, loadWwr } from './jobCache';
import { getFlags } from './jobFlags';
import { fetchHimalayasPage, getHimalayasJob } from './sources/himalayas';
import { likelyOpenToPH } from './sources/remotive';

function filterList(jobs: Job[], query: string | undefined, ph: boolean | undefined): Job[] {
  const q = query?.trim().toLowerCase();
  let out = q ? jobs.filter((j) => [j.title, j.company, j.location, ...j.requiredSkills].some((s) => s.toLowerCase().includes(q))) : jobs;
  if (ph) out = out.filter((j) => likelyOpenToPH(j.location));
  return out;
}

export const jobsRepo: JobsRepo = {
  async list({ query, cursor, limit = 10, source = 'remotive', philippinesOnly }) {
    if (source === 'himalayas') {
      const page = cursor ? parseInt(cursor, 10) : 1;
      const { jobs, hasMore } = await fetchHimalayasPage(query ?? '', !!philippinesOnly, page);
      return { items: jobs, nextCursor: hasMore ? String(page + 1) : null };
    }
    const { jobs } = await (source === 'wwr' ? loadWwr() : loadRemotive());
    const filtered = filterList(jobs, query, philippinesOnly);
    const start = cursor ? parseInt(cursor, 10) : 0;
    const next = start + limit;
    return { items: filtered.slice(start, next), nextCursor: next < filtered.length ? String(next) : null };
  },

  async get(id) {
    const f = getFlags();
    const flagged = [...f.saved, ...f.shortlisted].find((j) => j.id === id);
    if (flagged) return flagged;
    if (id.startsWith('himalayas-')) return getHimalayasJob(id);
    const { jobs } = await (id.startsWith('wwr-') ? loadWwr() : loadRemotive());
    return jobs.find((j) => j.id === id);
  },
};
