import PageShell from '../../components/PageShell';
import JobCard from '../../components/JobCard';
import { EmptyState } from '../../components/StateViews';
import { useJobFlags, type FlagKind } from '../../data/jobFlags';

function make(title: string, kind: FlagKind) {
  return function FilteredJobs() {
    const jobs = useJobFlags()[kind];
    return (
      <PageShell title={title} backHref="/jobs">
        {jobs.length === 0 && <EmptyState title={`No ${title.toLowerCase()} yet`} hint="Use Save or Shortlist on a job's detail page." />}
        {jobs.map((j) => <JobCard key={j.id} job={j} />)}
      </PageShell>
    );
  };
}

export const SavedJobs = make('Saved Jobs', 'saved');
export const ShortlistedJobs = make('Shortlisted Jobs', 'shortlisted');
