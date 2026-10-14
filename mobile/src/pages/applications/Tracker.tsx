import { IonBadge, IonButton, IonCard, IonCardContent, IonItem, IonLabel, IonList, IonListHeader } from '@ionic/react';
import PageShell from '../../components/PageShell';
import { findDuplicates, statusLabel, statusOrder } from '../../domain/applications';
import { mockApplications } from '../../mock/applications';
import ScoreBadge from '../../components/ScoreBadge';

export default function Tracker() {
  const dups = findDuplicates(mockApplications);
  return (
    <PageShell title="Applications">
      <div className="ion-padding" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <IonButton size="small" routerLink="/applications/review">Review queue</IonButton>
        <IonButton size="small" fill="outline" routerLink="/applications/interviews">Interviews</IonButton>
        <IonButton size="small" fill="outline" routerLink="/applications/followups">Follow-ups</IonButton>
      </div>
      {dups.length > 0 && (
        <IonCard color="warning">
          <IonCardContent>Possible duplicate: {dups.join('; ')}. Check before applying twice.</IonCardContent>
        </IonCard>
      )}
      {statusOrder.map((s) => {
        const items = mockApplications.filter((a) => a.status === s);
        if (items.length === 0) return null;
        return (
          <IonList key={s} inset>
            <IonListHeader>
              <IonLabel>{statusLabel[s]}</IonLabel>
              <IonBadge color={s === 'submitted' ? 'success' : 'medium'}>{items.length}</IonBadge>
            </IonListHeader>
            {items.map((a) => (
              <IonItem key={a.id}>
                <IonLabel>
                  <h3>{a.title}</h3>
                  <p>{a.company}{a.appliedAt ? ` · applied ${a.appliedAt}` : ''}</p>
                </IonLabel>
                <ScoreBadge score={a.score} />
              </IonItem>
            ))}
          </IonList>
        );
      })}
    </PageShell>
  );
}
