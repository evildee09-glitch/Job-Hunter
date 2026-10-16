import { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { IonAlert, IonButton, IonCard, IonCardContent, IonChip, IonItem, IonLabel, IonList } from '@ionic/react';
import { useQueryClient } from '@tanstack/react-query';
import { useJob } from '../../hooks/useJobs';
import { useMatcher } from '../../hooks/useProfile';
import { apiFetch, getBackend, jsonInit } from '../../data/api';
import { isFlagged, toggleFlag, useJobFlags } from '../../data/jobFlags';
import ScoreBadge from '../../components/ScoreBadge';
import PageShell from '../../components/PageShell';
import { bandLabel, scoreBand } from '../../domain/scoring';
import { EmptyState, ErrorRetry, SkeletonList } from '../../components/StateViews';

export default function JobDetails({ match }: RouteComponentProps<{ id: string }>) {
  const q = useJob(match.params.id);
  const flags = useJobFlags();
  const qc = useQueryClient();
  const matcher = useMatcher();
  const [note, setNote] = useState('');
  const [dup, setDup] = useState<string | null>(null);
  const job = q.data;
  const m = job && matcher.ready ? matcher.match(job) : undefined;

  const track = async (force = false) => {
    if (!job) return;
    setNote('');
    try {
      await apiFetch('/applications', jsonInit('POST', {
        source: job.source.slice(0, 24), job_ref: job.id, title: job.title.slice(0, 300), company: job.company.slice(0, 200),
        url: job.url, location: job.location.slice(0, 200), match_score: m?.score ?? null, status: 'shortlisted', force,
      }));
      qc.invalidateQueries({ queryKey: ['applications'] });
      setNote('Added to Applications.');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed';
      if (msg.startsWith('Already tracked')) setDup(msg); else setNote(msg);
    }
  };

  const fact = (label: string, value?: string) => value ? (
    <IonItem key={label}><IonLabel className="ion-text-wrap"><p>{label}</p><h3>{value}</h3></IonLabel></IonItem>
  ) : null;

  return (
    <PageShell title="Job Details" backHref="/jobs">
      {q.isLoading && <SkeletonList rows={3} />}
      {q.isError && <ErrorRetry message="Could not load this job." onRetry={() => q.refetch()} />}
      {!q.isLoading && !q.isError && !job && <EmptyState title="Job not found" hint="Open it again from the list, or save it so it stays available." />}
      {job && (
        <>
          <IonCard>
            <IonCardContent>
              <h2>{job.title}</h2>
              <div>{job.company}</div>
              <p><ScoreBadge score={m?.score} /> {bandLabel[scoreBand(m?.score)]}</p>
              {m && m.matched.map((s) => <IonChip key={s} color="success"><IonLabel>{s}</IonLabel></IonChip>)}
              {m && <p style={{ fontSize: 12, opacity: 0.7 }}>{m.reason}</p>}
              <IonButton size="small" fill={isFlagged(flags, 'saved', job.id) ? 'solid' : 'outline'} onClick={() => toggleFlag('saved', job)}>
                {isFlagged(flags, 'saved', job.id) ? 'Saved' : 'Save'}
              </IonButton>
              <IonButton size="small" fill={isFlagged(flags, 'shortlisted', job.id) ? 'solid' : 'outline'} onClick={() => toggleFlag('shortlisted', job)}>
                {isFlagged(flags, 'shortlisted', job.id) ? 'Shortlisted' : 'Shortlist'}
              </IonButton>
              {getBackend() && <IonButton size="small" onClick={() => track()}>Track application</IonButton>}
              {note && <p>{note}</p>}
              <IonButton expand="block" fill="outline" routerLink={`/jobs/${job.id}/match`}>View match analysis</IonButton>
              <IonButton expand="block" onClick={() => window.open(job.url, '_blank', 'noopener,noreferrer')}>
                Open on {job.source} to apply
              </IonButton>
              <p style={{ fontSize: 12, opacity: 0.7 }}>You apply on the source site. This app never submits applications for you.</p>
            </IonCardContent>
          </IonCard>

          <IonList inset>
            {fact('Who can apply', job.eligibility)}
            {fact('Location', job.location)}
            {fact('Employment type', job.employmentType)}
            {fact('Seniority', job.seniority)}
            {fact('Category', job.category)}
            {fact('Salary', job.salaryText)}
            {fact('Posted', new Date(job.postedAt).toLocaleDateString())}
            {fact('Expires', job.expiresAt ? new Date(job.expiresAt).toLocaleDateString() : undefined)}
            {fact('Source', job.source)}
          </IonList>

          <IonCard>
            <IonCardContent>
              <h3>Full description</h3>
              <p style={{ whiteSpace: 'pre-wrap' }}>{job.description || 'No description provided.'}</p>
              {job.requiredSkills.length > 0 && <h3>Tags and categories</h3>}
              {job.requiredSkills.map((s) => <IonChip key={s}><IonLabel>{s}</IonLabel></IonChip>)}
              <p style={{ fontSize: 12, opacity: 0.7 }}>Text from the source site, shown as plain text. Use "Open on {job.source}" to see the original formatting.</p>
            </IonCardContent>
          </IonCard>
          <IonAlert isOpen={!!dup} header="Possible duplicate" message={`${dup ?? ''}. Track this one anyway?`}
            buttons={[{ text: 'Cancel', role: 'cancel' }, { text: 'Track anyway', handler: () => { track(true); } }]}
            onDidDismiss={() => setDup(null)} />
        </>
      )}
    </PageShell>
  );
}
