import { RouteComponentProps } from 'react-router-dom';
import { IonButton, IonCard, IonCardContent, IonChip, IonLabel } from '@ionic/react';
import { useJob } from '../../hooks/useJobs';
import ScoreBadge from '../../components/ScoreBadge';
import PageShell from '../../components/PageShell';
import { bandLabel, scoreBand } from '../../domain/scoring';
import { EmptyState, ErrorRetry, SkeletonList } from '../../components/StateViews';

export default function JobDetails({ match }: RouteComponentProps<{ id: string }>) {
  const q = useJob(match.params.id);
  const job = q.data;
  return (
    <PageShell title="Job Details" backHref="/jobs">
      {q.isLoading && <SkeletonList rows={3} />}
      {q.isError && <ErrorRetry message="Could not load this job." onRetry={() => q.refetch()} />}
      {!q.isLoading && !q.isError && !job && <EmptyState title="Job not found" />}
      {job && (
        <>
          <IonCard>
            <IonCardContent>
              <h2>{job.title}</h2>
              <div>{job.company} · {job.location} · {job.arrangement}</div>
              <p><ScoreBadge score={job.score} /> {bandLabel[scoreBand(job.score)]}</p>
              {job.mandatoryUnmet.map((m) => (
                <IonChip key={m} color="danger"><IonLabel>Unmet: {m}</IonLabel></IonChip>
              ))}
              <IonButton expand="block" routerLink={`/jobs/${job.id}/match`}>View match analysis</IonButton>
            </IonCardContent>
          </IonCard>
          <IonCard>
            <IonCardContent>
              <h3>Description</h3>
              <p>{job.description}</p>
              <h3>Required skills</h3>
              {job.requiredSkills.map((s) => <IonChip key={s}><IonLabel>{s}</IonLabel></IonChip>)}
              <h3>Preferred skills</h3>
              {job.preferredSkills.map((s) => <IonChip key={s}><IonLabel>{s}</IonLabel></IonChip>)}
            </IonCardContent>
          </IonCard>
        </>
      )}
    </PageShell>
  );
}
