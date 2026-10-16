import { useState } from 'react';
import { IonAlert, IonButton, IonCard, IonCardContent, IonCheckbox, IonItem } from '@ionic/react';
import { useQueryClient } from '@tanstack/react-query';
import PageShell from '../../components/PageShell';
import NeedsBackend from '../../components/NeedsBackend';
import { EmptyState } from '../../components/StateViews';
import { apiFetch, getBackend, jsonInit, type ApplicationRec } from '../../data/api';
import { useApplications } from '../../hooks/useApplications';

const checklist = [
  'Company and job title are correct',
  'I am eligible for this role (location, timezone, requirements)',
  'My resume and answers are accurate and not exaggerated',
  'No guessed answers to sensitive or legal questions',
];

function ReviewCard({ app }: { app: ApplicationRec }) {
  const qc = useQueryClient();
  const [checked, setChecked] = useState<boolean[]>(checklist.map(() => false));
  const [confirm, setConfirm] = useState(false);
  const [err, setErr] = useState('');
  const all = checked.every(Boolean);
  const markSubmitted = async () => {
    try {
      await apiFetch(`/applications/${app.id}`, jsonInit('PATCH', { status: 'submitted', applied_on: new Date().toISOString().slice(0, 10) }));
      await qc.invalidateQueries({ queryKey: ['applications'] });
    } catch (e) { setErr(e instanceof Error ? e.message : 'Failed'); }
  };
  return (
    <IonCard>
      <IonCardContent>
        <h2>{app.title}</h2>
        <div>{app.company} · {app.source}</div>
        <p style={{ wordBreak: 'break-all' }}>{app.url}</p>
        <p style={{ opacity: 0.7 }}>No resume or cover letter is attached yet (document preparation arrives in Stage 7).</p>
        {checklist.map((c, i) => (
          <IonItem key={c} lines="none">
            <IonCheckbox labelPlacement="end" checked={checked[i]} onIonChange={(e) => setChecked((p) => p.map((v, j) => (j === i ? e.detail.checked : v)))}>{c}</IonCheckbox>
          </IonItem>
        ))}
        <IonButton expand="block" disabled={!all} onClick={() => window.open(app.url, '_blank', 'noopener,noreferrer')}>Open application page</IonButton>
        <p style={{ fontSize: 12, opacity: 0.7 }}>This app never submits for you. Click the final Submit button yourself on the employer's site.</p>
        <IonButton expand="block" fill="outline" disabled={!all} onClick={() => setConfirm(true)}>I submitted it myself</IonButton>
        {err && <p style={{ color: 'var(--ajh-warn)' }}>{err}</p>}
        <IonAlert isOpen={confirm} header="Confirm submission" message="Only confirm if you clicked Submit on the employer's site."
          buttons={[{ text: 'Cancel', role: 'cancel' }, { text: 'Yes, I submitted', handler: () => { markSubmitted(); } }]}
          onDidDismiss={() => setConfirm(false)} />
      </IonCardContent>
    </IonCard>
  );
}

export default function ReviewQueue() {
  const q = useApplications();
  const queue = (q.data ?? []).filter((a) => a.status === 'ready_for_review');
  return (
    <PageShell title="Review Queue" backHref="/applications">
      {!getBackend() && <NeedsBackend />}
      {q.data && queue.length === 0 && <EmptyState title="Nothing awaiting review" hint='Set an application to "Ready for review" in the tracker.' />}
      {queue.map((a) => <ReviewCard key={a.id} app={a} />)}
    </PageShell>
  );
}
