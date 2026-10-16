import { IonButton, IonItem, IonLabel, IonList } from '@ionic/react';
import { useQueryClient } from '@tanstack/react-query';
import PageShell from '../../components/PageShell';
import NeedsBackend from '../../components/NeedsBackend';
import { EmptyState } from '../../components/StateViews';
import { apiFetch, getBackend, jsonInit } from '../../data/api';
import { useApplications } from '../../hooks/useApplications';

export default function FollowUps() {
  const q = useApplications();
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const rows = (q.data ?? []).filter((a) => a.follow_up_on).sort((a, b) => a.follow_up_on.localeCompare(b.follow_up_on));
  return (
    <PageShell title="Follow-up Reminders" backHref="/applications">
      {!getBackend() && <NeedsBackend />}
      {q.data && rows.length === 0 && <EmptyState title="No follow-ups set" hint="Set a follow-up date on a tracked application." />}
      <IonList>
        {rows.map((a) => (
          <IonItem key={a.id}>
            <IonLabel className="ion-text-wrap">
              <h3>{a.company}: {a.title}</h3>
              <p style={{ color: a.follow_up_on < today ? 'var(--ajh-warn)' : undefined }}>Due {a.follow_up_on}{a.follow_up_on < today ? ' (overdue)' : ''}</p>
            </IonLabel>
            <IonButton fill="clear" onClick={async () => { await apiFetch(`/applications/${a.id}`, jsonInit('PATCH', { follow_up_on: '' })); qc.invalidateQueries({ queryKey: ['applications'] }); }}>Done</IonButton>
          </IonItem>
        ))}
      </IonList>
    </PageShell>
  );
}
