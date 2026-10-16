import { IonBadge, IonItem, IonLabel, IonList } from '@ionic/react';
import PageShell from '../../components/PageShell';
import NeedsBackend from '../../components/NeedsBackend';
import { EmptyState } from '../../components/StateViews';
import { getBackend } from '../../data/api';
import { useProfile } from '../../hooks/useProfile';

export default function DocumentLibrary() {
  const q = useProfile();
  const docs = q.data?.documents ?? [];
  return (
    <PageShell title="Document Library" backHref="/resume">
      {!getBackend() && <NeedsBackend />}
      {q.data && docs.length === 0 && <EmptyState title="No documents yet" hint="Imported resumes appear here." />}
      <IonList>
        {docs.map((d) => (
          <IonItem key={d.id}>
            <IonLabel><h3>{d.filename}</h3><p>{Math.round(d.size / 1024)} KB · {new Date(d.created_at).toLocaleDateString()}</p></IonLabel>
            <IonBadge color="medium">import</IonBadge>
          </IonItem>
        ))}
      </IonList>
    </PageShell>
  );
}
