import { RouteComponentProps } from 'react-router-dom';
import { IonCard, IonCardContent, IonChip, IonLabel } from '@ionic/react';
import PageShell from '../../components/PageShell';
import ScoreBadge from '../../components/ScoreBadge';
import NeedsBackend from '../../components/NeedsBackend';
import { EmptyState, ErrorRetry, SkeletonList } from '../../components/StateViews';
import { useJob } from '../../hooks/useJobs';
import { useMatcher } from '../../hooks/useProfile';

export default function MatchAnalysis({ match }: RouteComponentProps<{ id: string }>) {
  const q = useJob(match.params.id);
  const matcher = useMatcher();
  const job = q.data;
  const back = `/jobs/${match.params.id}`;

  if (q.isLoading) return <PageShell title="Match Analysis" backHref={back}><SkeletonList rows={4} /></PageShell>;
  if (q.isError) return <PageShell title="Match Analysis" backHref={back}><ErrorRetry message="Could not load." onRetry={() => q.refetch()} /></PageShell>;
  if (!job) return <PageShell title="Match Analysis" backHref="/jobs"><EmptyState title="Job not found" /></PageShell>;
  if (!matcher.hasBackend) return <PageShell title="Match Analysis" backHref={back}><NeedsBackend /></PageShell>;

  const r = matcher.match(job);
  return (
    <PageShell title="Match Analysis" backHref={back}>
      <IonCard>
        <IonCardContent>
          <h2>{job.title}</h2>
          {r.score === undefined ? <p>{r.reason}</p> : (
            <>
              <p>Keyword match: <ScoreBadge score={r.score} /></p>
              <h3>Your verified skills found in this listing</h3>
              {r.matched.length === 0 && <p>None.</p>}
              {r.matched.map((x) => <IonChip key={x} color="success"><IonLabel>{x}</IonLabel></IonChip>)}
              <h3>Listing tags not in your verified skills</h3>
              {r.missing.length === 0 && <p>None.</p>}
              {r.missing.map((x) => <IonChip key={x} color="warning"><IonLabel>{x}</IonLabel></IonChip>)}
              <p style={{ opacity: 0.7 }}>{r.reason} Mandatory requirements are not assessed yet: read the full listing and check eligibility yourself. AI analysis arrives in Stage 6.</p>
            </>
          )}
        </IonCardContent>
      </IonCard>
    </PageShell>
  );
}
