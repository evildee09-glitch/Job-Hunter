import { useState } from 'react';
import { IonAlert, IonBadge, IonButton, IonCard, IonCardContent, IonInput, IonLabel, IonListHeader, IonSelect, IonSelectOption, IonTextarea } from '@ionic/react';
import { useQueryClient } from '@tanstack/react-query';
import PageShell from '../../components/PageShell';
import NeedsBackend from '../../components/NeedsBackend';
import ScoreBadge from '../../components/ScoreBadge';
import { EmptyState, ErrorRetry, SkeletonList } from '../../components/StateViews';
import { statusLabel, statusOrder, type AppStatus } from '../../domain/applications';
import { apiFetch, getBackend, jsonInit, type ApplicationRec } from '../../data/api';
import { useApplications } from '../../hooks/useApplications';

export default function Tracker() {
  const q = useApplications();
  const qc = useQueryClient();
  const [err, setErr] = useState('');
  const [confirmSub, setConfirmSub] = useState<ApplicationRec | null>(null);
  const [interviewFor, setInterviewFor] = useState<ApplicationRec | null>(null);
  const [del, setDel] = useState<ApplicationRec | null>(null);

  const run = async (fn: () => Promise<unknown>) => {
    setErr('');
    try { await fn(); await qc.invalidateQueries({ queryKey: ['applications'] }); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Request failed'); }
  };
  const patch = (id: number, body: Record<string, unknown>) => run(() => apiFetch(`/applications/${id}`, jsonInit('PATCH', body)));
  const apps = q.data ?? [];

  return (
    <PageShell title="Applications">
      <div className="ion-padding" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <IonButton size="small" routerLink="/applications/review">Review queue</IonButton>
        <IonButton size="small" fill="outline" routerLink="/applications/interviews">Interviews</IonButton>
        <IonButton size="small" fill="outline" routerLink="/applications/followups">Follow-ups</IonButton>
      </div>
      {err && <p className="ion-padding-horizontal" style={{ color: 'var(--ajh-warn)' }}>{err}</p>}
      {!getBackend() && <NeedsBackend />}
      {getBackend() && q.isLoading && <SkeletonList />}
      {q.isError && <ErrorRetry message={`Could not load applications. ${q.error instanceof Error ? q.error.message : ''}`} onRetry={() => q.refetch()} />}
      {q.data && apps.length === 0 && <EmptyState title="No tracked applications" hint='Open a job and tap "Track application".' />}
      {statusOrder.map((s) => {
        const items = apps.filter((a) => a.status === s);
        if (items.length === 0) return null;
        return (
          <div key={s}>
            <IonListHeader><IonLabel>{statusLabel[s]}</IonLabel><IonBadge color={s === 'submitted' ? 'success' : 'medium'}>{items.length}</IonBadge></IonListHeader>
            {items.map((a) => (
              <IonCard key={a.id}>
                <IonCardContent>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <div><strong>{a.title}</strong><div>{a.company} · {a.source}</div></div>
                    <ScoreBadge score={a.match_score ?? undefined} />
                  </div>
                  {a.applied_on && <p>Applied on {a.applied_on}</p>}
                  <IonSelect label="Status" labelPlacement="stacked" value={a.status}
                    onIonChange={(e) => {
                      const v = e.detail.value as AppStatus;
                      if (v === a.status) return;
                      if (v === 'submitted') setConfirmSub(a); else patch(a.id, { status: v });
                    }}>
                    {statusOrder.map((x) => <IonSelectOption key={x} value={x}>{statusLabel[x]}</IonSelectOption>)}
                  </IonSelect>
                  <IonInput type="date" label="Follow-up on" labelPlacement="stacked" value={a.follow_up_on}
                    onIonChange={(e) => { const v = String(e.detail.value ?? '').slice(0, 10); if (v !== a.follow_up_on) patch(a.id, { follow_up_on: v }); }} />
                  <IonTextarea label="Notes" labelPlacement="stacked" autoGrow value={a.notes}
                    onIonChange={(e) => { const v = String(e.detail.value ?? ''); if (v !== a.notes) patch(a.id, { notes: v }); }} />
                  {a.interviews.map((i) => <p key={i.id}>Interview: {new Date(i.at).toLocaleString()} {i.kind && `(${i.kind})`}</p>)}
                  <IonButton size="small" fill="outline" onClick={() => window.open(a.url, '_blank', 'noopener,noreferrer')}>Open listing</IonButton>
                  <IonButton size="small" fill="outline" onClick={() => setInterviewFor(a)}>Add interview</IonButton>
                  <IonButton size="small" fill="clear" color="danger" onClick={() => setDel(a)}>Remove</IonButton>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        );
      })}

      <IonAlert isOpen={!!confirmSub} header="Mark as submitted?"
        message="Only confirm if you clicked Submit on the employer's site yourself. This app never submits for you."
        buttons={[{ text: 'Cancel', role: 'cancel' }, { text: 'Yes, I submitted', handler: () => { if (confirmSub) patch(confirmSub.id, { status: 'submitted', applied_on: new Date().toISOString().slice(0, 10) }); } }]}
        onDidDismiss={() => setConfirmSub(null)} />
      <IonAlert isOpen={!!interviewFor} header="Add interview"
        inputs={[{ name: 'at', type: 'datetime-local' }, { name: 'kind', type: 'text', placeholder: 'Type (e.g. phone screen)' }]}
        buttons={[{ text: 'Cancel', role: 'cancel' }, { text: 'Save', handler: (d: { at?: string; kind?: string }) => {
          if (!interviewFor || !d.at) return false;
          run(async () => {
            await apiFetch(`/applications/${interviewFor.id}/interviews`, jsonInit('POST', { at: d.at, kind: d.kind ?? '' }));
            if (interviewFor.status !== 'interview') await apiFetch(`/applications/${interviewFor.id}`, jsonInit('PATCH', { status: 'interview' }));
          });
        } }]}
        onDidDismiss={() => setInterviewFor(null)} />
      <IonAlert isOpen={!!del} header="Remove from tracker?" message={del ? `${del.title} at ${del.company}` : ''}
        buttons={[{ text: 'Cancel', role: 'cancel' }, { text: 'Remove', role: 'destructive', handler: () => { if (del) run(() => apiFetch(`/applications/${del.id}`, { method: 'DELETE' })); } }]}
        onDidDismiss={() => setDel(null)} />
    </PageShell>
  );
}
