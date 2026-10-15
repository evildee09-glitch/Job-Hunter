import { RouteComponentProps } from 'react-router-dom';
import { IonCard, IonCardContent, IonChip, IonLabel } from '@ionic/react';
import PageShell from '../../components/PageShell';
import { EmptyState, ErrorRetry, SkeletonList } from '../../components/StateViews';
import { useJob } from '../../hooks/useJobs';
import { splitSkills } from '../../domain/resume';
import { mockSkills } from '../../mock/resume';

export default function MatchAnalysis({ match }: RouteComponentProps<{ id: string }>) {
  const q = useJob(match.params.id);
  const job = q.data;
  const back = `/jobs/${match.params.id}`;

  if (q.isLoading) return <PageShell title="Match Analysis" backHref={back}><SkeletonList rows={4} /></PageShell>;
  if (q.isError) return <PageShell title="Match Analysis" backHref={back}><ErrorRetry message="Could not load." onRetry={() => q.refetch()} /></PageShell>;
  if (!job) return <PageShell title="Match Analysis" backHref="/jobs"><EmptyState title="Job not found" /></PageShell>;

  const skills = splitSkills(job.requiredSkills, mockSkills);
  return (
    <PageShell title="Match Analysis" backHref={back}>
      <IonCard color="light">
        <IonCardContent>
          <h2>{job.title}</h2>
          <p><strong>Not analyzed yet.</strong> The 1-10 score, confidence, and explanation come from AI analysis in Stage 6.
          Mandatory-requirement checks need your real master resume (Stage 2).</p>
        </IonCardContent>
      </IonCard>
      <IonCard>
        <IonCardContent>
          <h3>Tag comparison (against SAMPLE skills)</h3>
          <p style={{ opacity: 0.7 }}>The job's tags compared with the sample profile. This becomes meaningful once your real profile is imported.</p>
          <h4>Matches verified skills</h4>
          {skills.supported.length === 0 && <p>None.</p>}
          {skills.supported.map((x) => <IonChip key={x} color="success"><IonLabel>{x}</IonLabel></IonChip>)}
          <h4>Not matched</h4>
          {skills.unsupported.length === 0 && <p>None.</p>}
          {skills.unsupported.map((x) => <IonChip key={x} color="warning"><IonLabel>{x}</IonLabel></IonChip>)}
        </IonCardContent>
      </IonCard>
    </PageShell>
  );
}
