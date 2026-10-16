import { IonButton, IonItem, IonLabel, IonList } from '@ionic/react';
import { useQueryClient } from '@tanstack/react-query';
import PageShell from '../../components/PageShell';
import NeedsBackend from '../../components/NeedsBackend';
import { EmptyState } from '../../components/StateViews';
import { apiFetch, getBackend } from '../../data/api';
import { useApplications } from '../../hooks/useApplications';

export default function InterviewCalendar() {
  const q = useApplications();
  const qc = useQueryClient();
  const rows = (q.data ?? []).flatMap((a) => a.interviews.map((i) => ({ i, a }))).sort((x, y) => x.i.at.localeCompare(y.i.at));
  return (
    <PageShell title="Interviews" backHref="/applications">
      {!getBackend() && <NeedsBackend />}
      {q.data && rows.length === 0 && <EmptyState title="No interviews scheduled" hint='Use "Add interview" on a tracked application.' />}
      <IonList>
        {rows.map(({ i, a }) => (
          <IonItem key={i.id}>
            <IonLabel className="ion-text-wrap">
              <h3>{new Date(i.at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</h3>
              <p>{a.company} · {a.title}</p>
              {i.kind && <p>{i.kind}</p>}
            </IonLabel>
            <IonButton fill="clear" color="danger" onClick={async () => { await apiFetch(`/interviews/${i.id}`, { method: 'DELETE' }); qc.invalidateQueries({ queryKey: ['applications'] }); }}>Delete</IonButton>
          </IonItem>
        ))}
      </IonList>
    </PageShell>
  );
}
