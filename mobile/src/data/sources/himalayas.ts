import type { Job } from '../../domain/types';
import { cacheGet, cacheSet } from '../idbCache';
import { clip, stripHtml } from './remotive';

/** Himalayas public API: data refreshes every 24h, so responses are cached for 24h. Attribution is shown in the UI. */
const TTL_MS = 24 * 60 * 60 * 1000;
const INDEX_KEY = 'himalayas:index';
const INDEX_MAX = 600;
const MAX_PAGE = 10;

function hash(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `${(h >>> 0).toString(16).padStart(8, '0')}${s.length.toString(16)}`;
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const num = (v: unknown) => (typeof v === 'number' && isFinite(v) ? v : undefined);
const strArr = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
const iso = (ms: unknown) => { const n = num(ms); return n === undefined ? undefined : new Date(n).toISOString(); };
const fmt = (n: number) => n.toLocaleString('en-US');

export function mapHimalayasJob(raw: unknown): Job | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const guid = str(r.guid) || str(r.applicationLink);
  const title = str(r.title);
  const link = str(r.applicationLink);
  if (!guid || !title || !link.startsWith('https://')) return null;

  const places = Array.isArray(r.locationRestrictions)
    ? r.locationRestrictions.map((x) => (typeof x === 'object' && x ? str((x as { name?: unknown }).name) : '')).filter(Boolean)
    : [];
  const tz = strArr(r.timezoneRestrictions);
  const min = num(r.minSalary);
  const max = num(r.maxSalary);
  const cur = str(r.currency);
  const period = str(r.salaryPeriod) || 'annual';
  const salaryText = min !== undefined || max !== undefined
    ? `${cur} ${min !== undefined ? fmt(min) : '?'}${max !== undefined && max !== min ? `-${fmt(max)}` : ''} (${period})`.trim()
    : undefined;
  const expires = iso(r.expiryDate);
  const cats = strArr(r.categories);
  const seniority = strArr(r.seniority).join(', ');

  return {
    id: `himalayas-${hash(guid)}`,
    title,
    company: str(r.companyName) || 'Unknown company',
    location: places.length ? `${places.slice(0, 3).join(', ')}${places.length > 3 ? ` +${places.length - 3}` : ''}` : 'Worldwide',
    arrangement: 'remote',
    salaryText,
    postedAt: iso(r.pubDate) ?? new Date(0).toISOString(),
    expiresAt: expires,
    source: 'Himalayas',
    url: link,
    description: clip(stripHtml(str(r.description)) || str(r.excerpt)),
    requiredSkills: cats.slice(0, 12),
    preferredSkills: [],
    employmentType: str(r.employmentType) || undefined,
    category: cats[0],
    seniority: seniority || undefined,
    eligibility: (places.length ? `Must be based in: ${places.join(', ')}` : 'Open to applicants worldwide')
      + (tz.length ? ` · Timezones: ${tz.join(', ')}` : ''),
    listingStatus: expires && new Date(expires).getTime() < Date.now() ? 'expired' : 'active',
    mandatoryUnmet: [],
    saved: false,
    shortlisted: false,
  };
}

async function remember(jobs: Job[]) {
  const cur = (await cacheGet<Record<string, Job>>(INDEX_KEY))?.value ?? {};
  const next: Record<string, Job> = { ...cur };
  for (const j of jobs) { delete next[j.id]; next[j.id] = j; }
  const keys = Object.keys(next);
  for (const k of keys.slice(0, Math.max(0, keys.length - INDEX_MAX))) delete next[k];
  await cacheSet(INDEX_KEY, next);
}

export async function getHimalayasJob(id: string): Promise<Job | undefined> {
  return (await cacheGet<Record<string, Job>>(INDEX_KEY))?.value[id];
}

export async function fetchHimalayasPage(q: string, philippinesOnly: boolean, page: number): Promise<{ jobs: Job[]; hasMore: boolean }> {
  const params = new URLSearchParams({ sort: 'recent', page: String(page) });
  if (q.trim()) params.set('q', q.trim());
  if (philippinesOnly) params.set('country', 'PH');
  const key = `himalayas:${params.toString()}`;

  const cached = await cacheGet<Job[]>(key);
  if (cached && Date.now() - cached.savedAt < TTL_MS) {
    return { jobs: cached.value, hasMore: cached.value.length > 0 && page < MAX_PAGE };
  }

  const base = import.meta.env.DEV ? '/api/himalayas' : 'https://himalayas.app/jobs/api';
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20_000);
  try {
    const res = await fetch(`${base}/search?${params.toString()}`, { signal: ctrl.signal });
    if (res.status === 429) throw new Error('Himalayas rate limit reached. Wait a minute and try again.');
    if (!res.ok) throw new Error(`Himalayas returned HTTP ${res.status}`);
    const data: unknown = await res.json();
    const list = (data as { jobs?: unknown })?.jobs;
    if (!Array.isArray(list)) throw new Error('Unexpected response format from Himalayas');
    const jobs = list.map(mapHimalayasJob).filter((j): j is Job => j !== null);
    await cacheSet(key, jobs);
    await remember(jobs);
    return { jobs, hasMore: jobs.length > 0 && page < MAX_PAGE };
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw new Error('Himalayas request timed out');
    if (cached) return { jobs: cached.value, hasMore: false }; // stale fallback
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
