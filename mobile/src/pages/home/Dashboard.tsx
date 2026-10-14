import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { mockJobs } from '../../mock/jobs';

const stats: Array<[string, number]> = [
  ['Jobs discovered', mockJobs.length],
  ['Jobs analyzed', mockJobs.filter((j) => j.score !== undefined).length],
  ['High-match (7+)', mockJobs.filter((j) => (j.score ?? 0) >= 7).length],
  ['Shortlisted', mockJobs.filter((j) => j.shortlisted).length],
  ['Awaiting review', 2],
  ['Confirmed submissions', 4],
  ['Interviews', 1],
  ['Follow-ups due', 3],
];

export default function Dashboard() {
  return (
    <IonPage>
      <IonHeader><IonToolbar><IonTitle>Home</IonTitle></IonToolbar></IonHeader>
      <IonContent>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4, padding: 4 }}>
          {stats.map(([label, n]) => (
            <IonCard key={label} style={{ margin: 8 }}>
              <IonCardHeader><IonCardTitle>{n}</IonCardTitle></IonCardHeader>
              <IonCardContent>{label}</IonCardContent>
            </IonCard>
          ))}
        </div>
        <p className="ion-padding" style={{ opacity: 0.7 }}>
          AI-prepared forms will be counted separately from confirmed submissions. All data here is mock data.
        </p>
      </IonContent>
    </IonPage>
  );
}
