export type AppStatus =
  | 'discovered' | 'analyzed' | 'shortlisted' | 'documents_prepared' | 'ready_for_review'
  | 'submitted' | 'interview' | 'offer' | 'rejected' | 'withdrawn';

export const statusOrder: AppStatus[] = [
  'ready_for_review', 'documents_prepared', 'shortlisted', 'analyzed', 'discovered',
  'submitted', 'interview', 'offer', 'rejected', 'withdrawn',
];

export const statusLabel: Record<AppStatus, string> = {
  discovered: 'Discovered', analyzed: 'Analyzed', shortlisted: 'Shortlisted',
  documents_prepared: 'Documents prepared', ready_for_review: 'Ready for review',
  submitted: 'Submitted (confirmed)', interview: 'Interview', offer: 'Offer',
  rejected: 'Rejected', withdrawn: 'Withdrawn',
};

export interface Application {
  id: string;
  company: string;
  title: string;
  url: string;
  score?: number;
  status: AppStatus;
  resumeVersion?: string;
  coverLetterVersion?: string;
  appliedAt?: string;
}

export interface Interview { id: string; company: string; title: string; at: string; kind: string }
export interface FollowUp { id: string; company: string; task: string; due: string; done: boolean }

/** Same company + title (case-insensitive) counts as a potential duplicate. */
export function findDuplicates(apps: Application[]): string[] {
  const seen = new Map<string, number>();
  for (const a of apps) {
    const k = `${a.company}|${a.title}`.toLowerCase();
    seen.set(k, (seen.get(k) ?? 0) + 1);
  }
  return [...seen.entries()].filter(([, n]) => n > 1).map(([k]) => k.replace('|', ' - '));
}
