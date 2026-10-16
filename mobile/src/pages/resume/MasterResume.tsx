import { IonButton, IonCard, IonCardContent, IonItem, IonLabel, IonList } from '@ionic/react';
import PageShell from '../../components/PageShell';
import NeedsBackend from '../../components/NeedsBackend';
import { getBackend } from '../../data/api';
import { useProfile } from '../../hooks/useProfile';

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
  const q = useProfile();
  const p = q.data;
  const all = p ? [...p.employment, ...p.skills, ...p.education, ...p.certifications, ...p.projects] : [];
  const verified = all.filter((i) => i.verification === 'verified').length;
  return (
    <PageShell title="Master Resume">
      <div className="ion-padding">
        <IonButton expand="block" routerLink="/resume/import">Import existing resume</IonButton>
      </div>
      {!getBackend() && <NeedsBackend />}
      {p && (
        <IonCard>
          <IonCardContent>
            <h2>{p.name || '(no name yet)'}</h2>
            <div>{p.email || 'no email'} · {p.phone || 'no phone'}</div>
            <p>{verified} of {all.length} entries verified. Profile version {p.version}.</p>
            <p style={{ opacity: 0.7 }}>Job matching and tailoring use verified entries only.</p>
          </IonCardContent>
        </IonCard>
      )}
      <IonList inset>
        {links.map(([label, href]) => (
          <IonItem key={href} routerLink={href} detail><IonLabel>{label}</IonLabel></IonItem>
        ))}
      </IonList>
    </PageShell>
  );
}
