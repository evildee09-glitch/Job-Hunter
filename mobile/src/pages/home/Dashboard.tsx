import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useJobFlags } from '../../data/jobFlags';
import { getBackend } from '../../data/api';
import { useApplications } from '../../hooks/useApplications';
import NeedsBackend from '../../components/NeedsBackend';

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
  const q = useApplications();
  const apps = q.data ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const count = (s: string) => apps.filter((a) => a.status === s).length;
  return (
    <IonPage>
      <IonHeader><IonToolbar><IonTitle>Home</IonTitle></IonToolbar></IonHeader>
      <IonContent>
        <h4 className="ion-padding-horizontal">Jobs</h4>
        <Tiles items={[['Saved', flags.saved.length], ['Shortlisted', flags.shortlisted.length]]} />
        <h4 className="ion-padding-horizontal">Applications</h4>
        {!getBackend() && <NeedsBackend />}
        {getBackend() && (
          <Tiles items={[
            ['Tracked', apps.length],
            ['Awaiting review', count('ready_for_review')],
            ['Confirmed submissions', count('submitted')],
            ['Interviews', apps.reduce((n, a) => n + a.interviews.length, 0)],
            ['Offers', count('offer')],
            ['Follow-ups due', apps.filter((a) => a.follow_up_on && a.follow_up_on <= today).length],
          ]} />
        )}
        <p className="ion-padding" style={{ opacity: 0.7 }}>
          "Confirmed submissions" only counts applications you marked as submitted yourself.
        </p>
      </IonContent>
    </IonPage>
  );
}
