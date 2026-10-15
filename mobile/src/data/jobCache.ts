import type { Job } from '../domain/types';
import { cacheGet, cacheSet } from './idbCache';
import { fetchRemotive } from './sources/remotive';

/** Remotive asks for at most ~4 fetches per day, so the full list is cached for 6 hours. */
const KEY = 'remotive:all';
const TTL_MS = 6 * 60 * 60 * 1000;

export interface RemotiveResult { jobs: Job[]; fetchedAt: number; stale: boolean; error?: string }
let inflight: Promise<RemotiveResult> | null = null;

export function loadRemotive(): Promise<RemotiveResult> {
  if (inflight) return inflight;
  inflight = (async (): Promise<RemotiveResult> => {
    const cached = await cacheGet<Job[]>(KEY);
    if (cached && Date.now() - cached.savedAt < TTL_MS) return { jobs: cached.value, fetchedAt: cached.savedAt, stale: false };
    try {
      const jobs = await fetchRemotive();
      await cacheSet(KEY, jobs);
      return { jobs, fetchedAt: Date.now(), stale: false };
    } catch (e) {
      if (cached) return { jobs: cached.value, fetchedAt: cached.savedAt, stale: true, error: e instanceof Error ? e.message : 'Fetch failed' };
      throw e;
    }
  })().finally(() => { inflight = null; });
  return inflight;
}
