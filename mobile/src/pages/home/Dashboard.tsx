import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useJobFlags } from '../../data/jobFlags';
import { mockApplications, mockFollowUps } from '../../mock/applications';

function Tiles({ items }: { items: Array<[string, number | string]> }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4, padding: 4 }}>
      {items.map(([label, n]) => (
        <IonCard key={label} style={{ margin: 8 }}>
          <IonCardHeader><IonCardTitle>{n}</IonCardTitle></IonCardHeader>
          <IonCardContent>{label}</IonCardContent>
        </IonCard>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const flags = useJobFlags();
  const count = (s: string) => mockApplications.filter((a) => a.status === s).length;
  return (
    <IonPage>
      <IonHeader><IonToolbar><IonTitle>Home</IonTitle></IonToolbar></IonHeader>
      <IonContent>
        <h4 className="ion-padding-horizontal">Your jobs (live)</h4>
        <Tiles items={[['Saved', flags.saved.length], ['Shortlisted', flags.shortlisted.length], ['Analyzed', 0]]} />
        <h4 className="ion-padding-horizontal">Applications (sample data)</h4>
        <Tiles items={[
          ['Awaiting review', count('ready_for_review')],
          ['Confirmed submissions', count('submitted')],
          ['Interviews', count('interview')],
          ['Follow-ups due', mockFollowUps.filter((f) => !f.done).length],
        ]} />
      </IonContent>
    </IonPage>
  );
}
