import { IonCard, IonCardContent, IonChip, IonLabel } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import type { Job } from '../domain/types';
import ScoreBadge from './ScoreBadge';

export default function JobCard({ job }: { job: Job }) {
  const history = useHistory();
  const snippet = job.description.replace(/\s+/g, ' ').slice(0, 160);
  return (
    <IonCard button onClick={() => history.push(`/jobs/${job.id}`)}>
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
          {job.employmentType && <IonChip><IonLabel>{job.employmentType}</IonLabel></IonChip>}
          {job.salaryText && <IonChip color="success"><IonLabel>{job.salaryText}</IonLabel></IonChip>}
          {job.listingStatus === 'expired' && <IonChip color="danger"><IonLabel>Expired</IonLabel></IonChip>}
        </div>
        {snippet && <p style={{ margin: '6px 0', opacity: 0.8 }}>{snippet}{job.description.length > 160 ? '...' : ''}</p>}
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          {job.source} · posted {new Date(job.postedAt).toLocaleDateString()} · tap for full details
        </div>
      </IonCardContent>
    </IonCard>
  );
}
