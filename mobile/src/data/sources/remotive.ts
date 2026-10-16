import type { Job } from '../../domain/types';

const MAX_DESC = 20000;
const ENTITIES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };

/** Converts untrusted HTML to readable plain text (bullets and paragraphs kept). Only ever rendered as text. */
export function stripHtml(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<\/(p|div|li|ul|ol|h[1-6])>|<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (m) => ENTITIES[m] ?? m)
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function clip(s: string): string {
  return s.length > MAX_DESC ? `${s.slice(0, MAX_DESC)}...` : s;
}

/** Heuristic: does a free-text location restriction plausibly include the Philippines? */
export function likelyOpenToPH(location: string): boolean {
  const l = location.trim().toLowerCase();
  return l === '' || l === 'remote' || /worldwide|anywhere|global|world|philippines|asia|apac|southeast/.test(l);
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');

export function mapRemotiveJob(raw: unknown): Job | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const id = typeof r.id === 'number' || typeof r.id === 'string' ? String(r.id) : '';
  const title = str(r.title);
  const url = str(r.url);
  if (!id || !title || !url.startsWith('https://')) return null;
  const tags = Array.isArray(r.tags) ? r.tags.filter((t): t is string => typeof t === 'string') : [];
  const posted = new Date(str(r.publication_date));
  const loc = str(r.candidate_required_location);
  return {
    id: `remotive-${id}`,
    title,
    company: str(r.company_name) || 'Unknown company',
    location: loc || 'Remote',
    arrangement: 'remote',
    salaryText: str(r.salary) || undefined,
    postedAt: isNaN(posted.getTime()) ? new Date(0).toISOString() : posted.toISOString(),
    source: 'Remotive',
    url,
    description: clip(stripHtml(str(r.description))),
    requiredSkills: tags.slice(0, 12),
    preferredSkills: [],
    employmentType: str(r.job_type).replace(/_/g, ' ') || undefined,
    category: str(r.category) || undefined,
    eligibility: loc ? `Eligible locations: ${loc}` : 'Location restriction not stated',
    listingStatus: 'active',
    mandatoryUnmet: [],
    saved: false,
    shortlisted: false,
  };
}

export async function fetchRemotive(): Promise<Job[]> {
  const url = import.meta.env.DEV ? '/api/remotive' : 'https://remotive.com/api/remote-jobs';
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20_000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`Remotive returned HTTP ${res.status}`);
    const data: unknown = await res.json();
    const list = (data as { jobs?: unknown })?.jobs;
    if (!Array.isArray(list)) throw new Error('Unexpected response format from Remotive');
    return list.map(mapRemotiveJob).filter((j): j is Job => j !== null).sort((a, b) => b.postedAt.localeCompare(a.postedAt));
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw new Error('Remotive request timed out');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
