import { IonItem, IonLabel, IonList, IonListHeader } from '@ionic/react';
import PageShell from '../../components/PageShell';
import VerificationBadge from '../../components/VerificationBadge';
import { mockEducation, mockProjects } from '../../mock/resume';

export default function EducationProjects() {
  return (
    <PageShell title="Education and Projects" backHref="/resume">
      <IonList inset>
        <IonListHeader><IonLabel>Education</IonLabel></IonListHeader>
        {mockEducation.map((e) => (
          <IonItem key={e.school}>
            <IonLabel><h3>{e.degree}</h3><p>{e.school} · {e.years}</p></IonLabel>
            <VerificationBadge v={e.v} />
          </IonItem>
        ))}
      </IonList>
      <IonList inset>
        <IonListHeader><IonLabel>Projects</IonLabel></IonListHeader>
        {mockProjects.map((p) => (
          <IonItem key={p.name}>
            <IonLabel className="ion-text-wrap"><h3>{p.name}</h3><p>{p.summary}</p></IonLabel>
            <VerificationBadge v={p.v} />
          </IonItem>
        ))}
      </IonList>
    </PageShell>
  );
}
