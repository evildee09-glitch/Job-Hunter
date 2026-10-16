import type { Job } from '../../domain/types';
import { clip, stripHtml } from './remotive';

/** We Work Remotely public RSS feed. They ask that links point back to We Work Remotely. */
export interface WwrFields {
  title: string; link: string; pubDate: string; description: string; category: string;
  type: string; region: string; country: string; skills: string; expires_at: string;
}

function hash(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return `${(h >>> 0).toString(16).padStart(8, '0')}${s.length.toString(16)}`;
}

const validDate = (s: string) => { const d = new Date(s); return isNaN(d.getTime()) ? undefined : d.toISOString(); };

/** Pure mapper (no DOM) so it can be unit tested. Titles are published as "Company: Job title". */
export function mapWwrItem(f: WwrFields): Job | null {
  const link = f.link.trim();
  if (!f.title.trim() || !link.startsWith('https://')) return null;
  const idx = f.title.indexOf(': ');
  const company = idx > 0 ? f.title.slice(0, idx).trim() : 'Unknown company';
  const title = idx > 0 ? f.title.slice(idx + 2).trim() : f.title.trim();
  const place = [f.country, f.region].map((x) => x.trim()).filter(Boolean).join(' / ');
  return {
    id: `wwr-${hash(link)}`,
    title,
    company,
    location: place || 'Remote',
    arrangement: 'remote',
    postedAt: validDate(f.pubDate) ?? new Date(0).toISOString(),
    expiresAt: validDate(f.expires_at),
    source: 'We Work Remotely',
    url: link,
    description: clip(stripHtml(f.description)),
    requiredSkills: f.skills.split(',').map((x) => x.trim()).filter(Boolean).slice(0, 12),
    preferredSkills: [],
    employmentType: f.type.trim() || undefined,
    category: f.category.trim() || undefined,
    eligibility: f.region.trim() ? `Eligible region: ${f.region.trim()}` : 'Location restriction not stated',
    listingStatus: 'active',
    mandatoryUnmet: [],
    saved: false,
    shortlisted: false,
  };
}

export function parseWwrFeed(xml: string): Job[] {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new Error('Invalid feed from We Work Remotely');
  const text = (el: Element, tag: string) => el.getElementsByTagName(tag)[0]?.textContent?.trim() ?? '';
  return Array.from(doc.getElementsByTagName('item'))
    .map((el) => mapWwrItem({
      title: text(el, 'title'), link: text(el, 'link'), pubDate: text(el, 'pubDate'), description: text(el, 'description'),
      category: text(el, 'category'), type: text(el, 'type'), region: text(el, 'region'), country: text(el, 'country'),
      skills: text(el, 'skills'), expires_at: text(el, 'expires_at'),
    }))
    .filter((j): j is Job => j !== null)
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}

export async function fetchWwr(): Promise<Job[]> {
  const url = import.meta.env.DEV ? '/api/wwr' : 'https://weworkremotely.com/remote-jobs.rss';
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20_000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`We Work Remotely returned HTTP ${res.status}`);
    return parseWwrFeed(await res.text());
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw new Error('We Work Remotely request timed out');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
