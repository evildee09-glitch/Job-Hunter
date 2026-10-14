import { IonItem, IonLabel, IonList, IonListHeader } from '@ionic/react';
import PageShell from '../../components/PageShell';
import VerificationBadge from '../../components/VerificationBadge';
import { mockCerts, mockSkills } from '../../mock/resume';

export default function SkillsCerts() {
  return (
    <PageShell title="Skills and Certifications" backHref="/resume">
      <IonList inset>
        <IonListHeader><IonLabel>Skills</IonLabel></IonListHeader>
        {mockSkills.map((s) => (
          <IonItem key={s.name}>
            <IonLabel><h3>{s.name}</h3><p>{s.level}</p></IonLabel>
            <VerificationBadge v={s.v} />
          </IonItem>
        ))}
      </IonList>
      <IonList inset>
        <IonListHeader><IonLabel>Certifications</IonLabel></IonListHeader>
        {mockCerts.map((c) => (
          <IonItem key={c.name}>
            <IonLabel><h3>{c.name}</h3><p>{c.issuer} · {c.year}</p></IonLabel>
            <VerificationBadge v={c.v} />
          </IonItem>
        ))}
      </IonList>
    </PageShell>
  );
}
