import PageShell from '../../components/PageShell';
import JobCard from '../../components/JobCard';
import { EmptyState } from '../../components/StateViews';
import { mockJobs } from '../../mock/jobs';

function make(title: string, pick: 'saved' | 'shortlisted') {
  return function FilteredJobs() {
    const jobs = mockJobs.filter((j) => j[pick]);
    return (
      <PageShell title={title} backHref="/jobs">
        {jobs.length === 0 && <EmptyState title={`No ${title.toLowerCase()}`} />}
        {jobs.map((j) => <JobCard key={j.id} job={j} />)}
      </PageShell>
    );
  };
}

export const SavedJobs = make('Saved Jobs', 'saved');
export const ShortlistedJobs = make('Shortlisted Jobs', 'shortlisted');
