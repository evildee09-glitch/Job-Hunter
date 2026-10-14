import type { Job, ListJobsOptions, Page } from '../domain/types';

/**
 * Data seam. Screens use hooks -> these interfaces. Stage 2 provides an HTTP
 * implementation against the FastAPI backend; no screen code should change.
 */
export interface JobsRepo {
  list(opts: ListJobsOptions): Promise<Page<Job>>;
  get(id: string): Promise<Job | undefined>;
}
