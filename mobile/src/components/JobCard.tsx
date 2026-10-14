import { IonCard, IonCardContent, IonChip, IonLabel, IonIcon } from '@ionic/react';
import { warningOutline } from 'ionicons/icons';
import type { Job } from '../domain/types';
import ScoreBadge from './ScoreBadge';

export default function JobCard({ job }: { job: Job }) {
  return (
    <IonCard routerLink={`/jobs/${job.id}`} button>
      <IonCardContent>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <strong>{job.title}</strong>
            <div>{job.company}</div>
          </div>
          <ScoreBadge score={job.score} />
        </div>
        <div style={{ marginTop: 6 }}>
          <IonChip><IonLabel>{job.location}</IonLabel></IonChip>
          <IonChip><IonLabel>{job.arrangement}</IonLabel></IonChip>
          {job.listingStatus === 'expired' && <IonChip color="danger"><IonLabel>Expired</IonLabel></IonChip>}
        </div>
        {job.mandatoryUnmet.length > 0 && (
          <IonChip color="danger">
            <IonIcon icon={warningOutline} />
            <IonLabel>{job.mandatoryUnmet.length} mandatory requirement(s) unmet</IonLabel>
          </IonChip>
        )}
      </IonCardContent>
    </IonCard>
  );
}
