export type WorkArrangement = 'remote' | 'hybrid' | 'onsite';
export type ListingStatus = 'active' | 'expired';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  arrangement: WorkArrangement;
  salary?: { min: number; max: number; currency: string };
  postedAt: string; // ISO date
  source: string;
  url: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  listingStatus: ListingStatus;
  lastVerifiedAt?: string;
  /** 1-10; undefined means not analyzed yet. Mock data only in Stage 1. */
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
}
