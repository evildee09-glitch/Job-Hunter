import { IonBadge, IonItem, IonLabel, IonList } from '@ionic/react';
import PageShell from '../../components/PageShell';
import { mockDocuments } from '../../mock/resume';

export default function DocumentLibrary() {
  return (
    <PageShell title="Document Library" backHref="/resume">
      <IonList>
        {mockDocuments.map((d) => (
          <IonItem key={d.id}>
            <IonLabel><h3>{d.name}</h3><p>{d.sizeKB} KB · {d.createdAt}</p></IonLabel>
            <IonBadge color="medium">{d.type}</IonBadge>
          </IonItem>
        ))}
      </IonList>
    </PageShell>
  );
}
