import { useState } from 'react';
import { IonButton, IonCard, IonCardContent, IonChip, IonLabel, IonSelect, IonSelectOption } from '@ionic/react';
import PageShell from '../../components/PageShell';
import { mockJobs } from '../../mock/jobs';
import { mockSkills } from '../../mock/resume';
import { splitSkills } from '../../domain/resume';

export default function ResumeTailoring() {
  const [jobId, setJobId] = useState<string>('');
  const [ran, setRan] = useState(false);
  const job = mockJobs.find((j) => j.id === jobId);
  const split = job ? splitSkills(job.requiredSkills, mockSkills) : null;

  return (
    <PageShell title="Tailor Resume" backHref="/resume">
      <IonCard>
        <IonCardContent>
          <IonSelect label="Target job" labelPlacement="stacked" placeholder="Choose a job" value={jobId}
            onIonChange={(e) => { setJobId(e.detail.value); setRan(false); }}>
            {mockJobs.slice(0, 6).map((j) => <IonSelectOption key={j.id} value={j.id}>{j.title} - {j.company}</IonSelectOption>)}
          </IonSelect>
          <IonButton expand="block" disabled={!job} onClick={() => setRan(true)}>Preview tailoring</IonButton>
          <p style={{ opacity: 0.7 }}>Preview only. Real AI generation arrives in Stage 7; this checks keywords against your verified skills.</p>
        </IonCardContent>
      </IonCard>
      {ran && split && (
        <IonCard>
          <IonCardContent>
            <h3>Will highlight (verified)</h3>
            {split.supported.length === 0 && <p>None of this job's required skills are verified in your profile.</p>}
            {split.supported.map((s) => <IonChip key={s} color="success"><IonLabel>{s}</IonLabel></IonChip>)}
            <h3>Will NOT add (not verified)</h3>
            {split.unsupported.length === 0 && <p>Nothing excluded.</p>}
            {split.unsupported.map((s) => <IonChip key={s} color="danger"><IonLabel>{s}</IonLabel></IonChip>)}
            <p>Unverified skills are never inserted. Confirm them on the Skills screen if they are accurate.</p>
          </IonCardContent>
        </IonCard>
      )}
    </PageShell>
  );
}
