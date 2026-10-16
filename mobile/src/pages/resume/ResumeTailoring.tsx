import { useState } from 'react';
import { IonButton, IonCard, IonCardContent, IonChip, IonLabel, IonSelect, IonSelectOption } from '@ionic/react';
import PageShell from '../../components/PageShell';
import NeedsBackend from '../../components/NeedsBackend';
import { getBackend } from '../../data/api';
import { useJobFlags } from '../../data/jobFlags';
import { useProfile } from '../../hooks/useProfile';
import { splitSkills, type Skill } from '../../domain/resume';

export default function ResumeTailoring() {
  const flags = useJobFlags();
  const q = useProfile();
  const [jobId, setJobId] = useState('');
  const [ran, setRan] = useState(false);
  const jobs = [...new Map([...flags.saved, ...flags.shortlisted].map((j) => [j.id, j])).values()];
  const job = jobs.find((j) => j.id === jobId);
  const skills: Skill[] = (q.data?.skills ?? []).map((s) => ({ name: String(s.name), level: 'intermediate', v: s.verification }));
  const split = job ? splitSkills(job.requiredSkills, skills) : null;

  return (
    <PageShell title="Tailor Resume" backHref="/resume">
      {!getBackend() && <NeedsBackend />}
      <IonCard>
        <IonCardContent>
          {jobs.length === 0 && <p>Save or shortlist a job first, then choose it here.</p>}
          <IonSelect label="Target job" labelPlacement="stacked" placeholder="Choose a saved job" value={jobId}
            onIonChange={(e) => { setJobId(e.detail.value); setRan(false); }}>
            {jobs.map((j) => <IonSelectOption key={j.id} value={j.id}>{j.title} - {j.company}</IonSelectOption>)}
          </IonSelect>
          <IonButton expand="block" disabled={!job || !q.data} onClick={() => setRan(true)}>Preview tailoring</IonButton>
          <p style={{ opacity: 0.7 }}>Preview only. AI generation arrives in Stage 7. This checks the job's tags against your verified skills.</p>
        </IonCardContent>
      </IonCard>
      {ran && split && (
        <IonCard>
          <IonCardContent>
            <h3>Will highlight (verified)</h3>
            {split.supported.length === 0 && <p>None of this job's tags are verified in your profile.</p>}
            {split.supported.map((s) => <IonChip key={s} color="success"><IonLabel>{s}</IonLabel></IonChip>)}
            <h3>Will NOT add (not verified)</h3>
            {split.unsupported.length === 0 && <p>Nothing excluded.</p>}
            {split.unsupported.map((s) => <IonChip key={s} color="danger"><IonLabel>{s}</IonLabel></IonChip>)}
          </IonCardContent>
        </IonCard>
      )}
    </PageShell>
  );
}
