import type { Job } from '../domain/types';
import { cacheGet, cacheSet } from './idbCache';
import { fetchRemotive } from './sources/remotive';
import { fetchWwr } from './sources/wwr';

/** Full-list sources are cached for 6 hours (Remotive asks for at most ~4 fetches per day). */
const TTL_MS = 6 * 60 * 60 * 1000;

export interface ListResult { jobs: Job[]; fetchedAt: number; stale: boolean; error?: string }

function makeLoader(key: string, fetcher: () => Promise<Job[]>) {
  let inflight: Promise<ListResult> | null = null;
  return (): Promise<ListResult> => {
    if (inflight) return inflight;
    inflight = (async (): Promise<ListResult> => {
      const cached = await cacheGet<Job[]>(key);
      if (cached && Date.now() - cached.savedAt < TTL_MS) return { jobs: cached.value, fetchedAt: cached.savedAt, stale: false };
      try {
        const jobs = await fetcher();
        await cacheSet(key, jobs);
        return { jobs, fetchedAt: Date.now(), stale: false };
      } catch (e) {
        if (cached) return { jobs: cached.value, fetchedAt: cached.savedAt, stale: true, error: e instanceof Error ? e.message : 'Fetch failed' };
        throw e;
      }
    })().finally(() => { inflight = null; });
    return inflight;
  };
}

export const loadRemotive = makeLoader('remotive:all', fetchRemotive);
export const loadWwr = makeLoader('wwr:all', fetchWwr);
