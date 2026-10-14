import { IonBadge, IonButton, IonCard, IonCardContent } from '@ionic/react';
import PageShell from '../../components/PageShell';
import { mockProfile, mockVersions } from '../../mock/resume';

export default function ResumeVersions() {
  return (
    <PageShell title="Resume Versions" backHref="/resume">
      {mockVersions.map((v) => (
        <IonCard key={v.id}>
          <IonCardContent>
            <h3>{v.name} <IonBadge color={v.status === 'approved' ? 'success' : 'medium'}>{v.status}</IonBadge></h3>
            <div>Target: {v.target}</div>
            <div>Generated {v.createdAt} by {v.provider} / {v.model}</div>
            <div>Built from profile v{v.profileVersion}
              {v.profileVersion < mockProfile.version && ' (master has changed since)'}</div>
          </IonCardContent>
        </IonCard>
      ))}
      <div className="ion-padding">
        <IonButton routerLink="/resume/tailor">Tailor a new version</IonButton>
      </div>
    </PageShell>
  );
}
