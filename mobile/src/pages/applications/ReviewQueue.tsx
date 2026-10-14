import { useState } from 'react';
import { IonAlert, IonButton, IonCard, IonCardContent, IonCheckbox, IonItem, IonLabel } from '@ionic/react';
import PageShell from '../../components/PageShell';
import { EmptyState } from '../../components/StateViews';
import { mockApplications } from '../../mock/applications';
import type { Application } from '../../domain/applications';

const checklist = [
  'Company and job title are correct',
  'Resume version is the one I approved',
  'Cover letter version is the one I approved',
  'Form values and screening answers are accurate',
  'No missing or guessed sensitive answers',
];

function ReviewCard({ app, onSubmitted }: { app: Application; onSubmitted: (id: string) => void }) {
  const [checked, setChecked] = useState<boolean[]>(checklist.map(() => false));
  const [confirm, setConfirm] = useState(false);
  const allDone = checked.every(Boolean);

  return (
    <IonCard>
      <IonCardContent>
        <h2>{app.title}</h2>
        <div>{app.company}</div>
        <p style={{ wordBreak: 'break-all' }}>{app.url}</p>
        <p>Resume: {app.resumeVersion ?? 'none'} · Cover letter: {app.coverLetterVersion ?? 'none'}</p>
        {checklist.map((c, i) => (
          <IonItem key={c} lines="none">
            <IonCheckbox labelPlacement="end" checked={checked[i]}
              onIonChange={(e) => setChecked((p) => p.map((v, j) => (j === i ? e.detail.checked : v)))}>
              {c}
            </IonCheckbox>
          </IonItem>
        ))}
        <IonButton expand="block" disabled={!allDone} onClick={() => window.open(app.url, '_blank', 'noopener')}>
          Open application page
        </IonButton>
        <IonLabel><p>This app never submits for you. Click the final Submit button yourself on the employer's site.</p></IonLabel>
        <IonButton expand="block" fill="outline" disabled={!allDone} onClick={() => setConfirm(true)}>
          I submitted it myself
        </IonButton>
        <IonAlert isOpen={confirm} header="Confirm submission"
          message="Only confirm if you clicked Submit on the employer's site. This marks the application as submitted."
          buttons={[{ text: 'Cancel', role: 'cancel' }, { text: 'Yes, I submitted', handler: () => onSubmitted(app.id) }]}
          onDidDismiss={() => setConfirm(false)} />
      </IonCardContent>
    </IonCard>
  );
}

export default function ReviewQueue() {
  const [done, setDone] = useState<string[]>([]);
  const queue = mockApplications.filter((a) => a.status === 'ready_for_review' && !done.includes(a.id));
  return (
    <PageShell title="Review Queue" backHref="/applications">
      {queue.length === 0 && <EmptyState title="Nothing awaiting review" hint="Prepared applications appear here." />}
      {queue.map((a) => <ReviewCard key={a.id} app={a} onSubmitted={(id) => setDone((p) => [...p, id])} />)}
    </PageShell>
  );
}
