import { IonButton, IonCard, IonCardContent, IonItem, IonLabel, IonList, IonNote } from '@ionic/react';
import PageShell from '../../components/PageShell';
import { mockProfile } from '../../mock/resume';

const links: Array<[string, string]> = [
  ['Employment history', '/resume/employment'],
  ['Skills and certifications', '/resume/skills'],
  ['Education and projects', '/resume/education'],
  ['Resume versions', '/resume/versions'],
  ['Tailor a resume', '/resume/tailor'],
  ['Cover letter editor', '/resume/cover-letter'],
  ['Document library', '/resume/documents'],
];

export default function MasterResume() {
  return (
    <PageShell title="Master Resume">
      <div className="ion-padding">
        <IonButton expand="block" routerLink="/resume/import">Import existing resume</IonButton>
      </div>
      <IonCard>
        <IonCardContent>
          <h2>{mockProfile.name}</h2>
          <div>{mockProfile.email} · {mockProfile.location}</div>
          <p>{mockProfile.summary}</p>
          <IonNote>Profile version {mockProfile.version}. Sample data only.</IonNote>
        </IonCardContent>
      </IonCard>
      <IonCard color="light">
        <IonCardContent>
          The master resume is the single source of truth. Tailored resumes are separate copies and never overwrite it.
        </IonCardContent>
      </IonCard>
      <IonList inset>
        {links.map(([label, href]) => (
          <IonItem key={href} routerLink={href} detail><IonLabel>{label}</IonLabel></IonItem>
        ))}
      </IonList>
    </PageShell>
  );
}
