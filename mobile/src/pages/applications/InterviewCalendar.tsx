import { IonItem, IonLabel, IonList } from '@ionic/react';
import PageShell from '../../components/PageShell';
import { EmptyState } from '../../components/StateViews';
import { mockInterviews } from '../../mock/applications';

export default function InterviewCalendar() {
  const sorted = [...mockInterviews].sort((a, b) => a.at.localeCompare(b.at));
  return (
    <PageShell title="Interviews" backHref="/applications">
      {sorted.length === 0 && <EmptyState title="No interviews scheduled" />}
      <IonList>
        {sorted.map((i) => (
          <IonItem key={i.id}>
            <IonLabel>
              <h3>{new Date(i.at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</h3>
              <p>{i.company} · {i.title}</p>
              <p>{i.kind}</p>
            </IonLabel>
          </IonItem>
        ))}
      </IonList>
    </PageShell>
  );
}
