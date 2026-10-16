import type { Job } from './types';

export interface MatchResult {
  score?: number;
  matched: string[];
  missing: string[];
  reason: string;
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const has = (text: string, term: string) => new RegExp(`(^|[^a-z0-9+#.])${esc(term)}($|[^a-z0-9+#])`, 'i').test(text);

/**
 * Transparent keyword match against VERIFIED skills and job titles only.
 * It is not an AI assessment and cannot judge mandatory requirements; it ranks, it does not decide.
 */
export function matchJob(job: Job, skills: string[], pastTitles: string[]): MatchResult {
  const names = [...new Set(skills.map((s) => s.trim()).filter((s) => s.length >= 2))];
  if (names.length === 0) return { matched: [], missing: [], reason: 'No verified skills yet. Confirm your skills to enable matching.' };

  const tags = job.requiredSkills.map((t) => t.toLowerCase());
  const body = `${tags.join(' ')} ${job.description}`;
  let points = 0;
  const matched: string[] = [];
  for (const s of names) {
    const exactTag = tags.includes(s.toLowerCase());
    if (s.length === 2 && !exactTag) continue; // too ambiguous to match inside free text
    if (has(job.title, s)) { points += 2; matched.push(s); }
    else if (exactTag || has(body, s)) { points += 1; matched.push(s); }
  }
  if (pastTitles.some((t) => t.trim().split(/\s+/).length >= 2 && has(job.title, t.trim()))) points += 2;

  const lowerMatched = matched.map((m) => m.toLowerCase());
  const missing = job.requiredSkills.filter((t) => !lowerMatched.includes(t.toLowerCase())).slice(0, 8);
  const score = Math.max(1, Math.min(10, Math.round(1 + (9 * Math.min(1, points / 8)))));
  return { score, matched, missing, reason: 'Keyword match against your verified skills and past job titles. Not an AI assessment.' };
}
