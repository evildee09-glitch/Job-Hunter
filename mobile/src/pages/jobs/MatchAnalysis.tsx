import { RouteComponentProps } from 'react-router-dom';
import { IonCard, IonCardContent, IonChip, IonLabel, IonProgressBar } from '@ionic/react';
import PageShell from '../../components/PageShell';
import ScoreBadge from '../../components/ScoreBadge';
import { EmptyState, ErrorRetry, SkeletonList } from '../../components/StateViews';
import { useJob } from '../../hooks/useJobs';
import { splitSkills } from '../../domain/resume';
import { mockSkills } from '../../mock/resume';
import { criteriaLabel, weightedScore, weights, type Criteria } from '../../domain/match';

export default function MatchAnalysis({ match }: RouteComponentProps<{ id: string }>) {
  const q = useJob(match.params.id);
  const job = q.data;
  const back = `/jobs/${match.params.id}`;

  if (q.isLoading) return <PageShell title="Match Analysis" backHref={back}><SkeletonList rows={4} /></PageShell>;
  if (q.isError) return <PageShell title="Match Analysis" backHref={back}><ErrorRetry message="Could not load." onRetry={() => q.refetch()} /></PageShell>;
  if (!job) return <PageShell title="Match Analysis" backHref="/jobs"><EmptyState title="Job not found" /></PageShell>;

  const s = job.score ?? 0;
  const criteria: Criteria = {
    technical: s, experience: Math.max(1, s - 1), responsibilities: s,
    qualifications: Math.max(1, s - 2 * job.mandatoryUnmet.length), workArrangement: 8,
  };
  const skills = splitSkills(job.requiredSkills, mockSkills);

  return (
    <PageShell title="Match Analysis" backHref={back}>
      {job.mandatoryUnmet.length > 0 && (
        <IonCard color="danger">
          <IonCardContent>
            <strong>Mandatory requirements not met:</strong> {job.mandatoryUnmet.join('; ')}. A high score does not offset these.
          </IonCardContent>
        </IonCard>
      )}
      <IonCard>
        <IonCardContent>
          <h2>{job.title}</h2>
          <p>Overall (mock criteria, weighted): <ScoreBadge score={Math.round(weightedScore(criteria))} /> {weightedScore(criteria)}/10</p>
          {(Object.keys(weights) as Array<keyof typeof weights>).map((k) => (
            <div key={k} style={{ marginBottom: 8 }}>
              {criteriaLabel[k]} ({Math.round(weights[k] * 100)}%): {criteria[k]}/10
              <IonProgressBar value={criteria[k] / 10} />
            </div>
          ))}
        </IonCardContent>
      </IonCard>
      <IonCard>
        <IonCardContent>
          <h3>Matching skills (verified)</h3>
          {skills.supported.length === 0 && <p>None verified.</p>}
          {skills.supported.map((x) => <IonChip key={x} color="success"><IonLabel>{x}</IonLabel></IonChip>)}
          <h3>Missing or unverified</h3>
          {skills.unsupported.length === 0 && <p>None.</p>}
          {skills.unsupported.map((x) => <IonChip key={x} color="warning"><IonLabel>{x}</IonLabel></IonChip>)}
          <p style={{ opacity: 0.7 }}>Scores here are placeholders. Real AI analysis, confidence, and explanations arrive in Stage 6.</p>
        </IonCardContent>
      </IonCard>
    </PageShell>
  );
}
