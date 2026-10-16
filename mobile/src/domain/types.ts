export type WorkArrangement = 'remote' | 'hybrid' | 'onsite';
export type ListingStatus = 'active' | 'expired';
export type JobSource = 'remotive' | 'himalayas' | 'wwr';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  arrangement: WorkArrangement;
  salary?: { min: number; max: number; currency: string };
  /** Salary as published by the source, formatted for display. */
  salaryText?: string;
  postedAt: string; // ISO date
  expiresAt?: string;
  source: string;
  url: string;
  /** Plain text only. External content is untrusted and never rendered as HTML. */
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  employmentType?: string;
  category?: string;
  seniority?: string;
  /** Who may apply (e.g. "Worldwide" or "Must be based in: ..."). Check before applying. */
  eligibility?: string;
  listingStatus: ListingStatus;
  lastVerifiedAt?: string;
  /** 1-10; undefined means not analyzed yet. */
  score?: number;
  /** Mandatory requirements the verified resume does not satisfy. */
  mandatoryUnmet: string[];
  saved: boolean;
  shortlisted: boolean;
}

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

export interface ListJobsOptions {
  query?: string;
  cursor?: string;
  limit?: number;
  source?: JobSource;
  philippinesOnly?: boolean;
}
