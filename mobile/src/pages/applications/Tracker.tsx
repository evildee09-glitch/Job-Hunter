import { useState } from 'react';
import { IonBadge, IonButton, IonCard, IonCardContent, IonItem, IonLabel, IonList, IonListHeader, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent } from '@ionic/react';
import PageShell from '../../components/PageShell';
import { findDuplicates, statusLabel, statusOrder, type Application } from '../../domain/applications';
import { mockApplications } from '../../mock/applications';
import ScoreBadge from '../../components/ScoreBadge';

export default function Tracker() {
  const dups = findDuplicates(mockApplications);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

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
              <IonItem 
                key={a.id} 
                button 
                detail={true}
                onClick={() => setSelectedApp(a)}
              >
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

      {/* Full Information Modal */}
      <IonModal isOpen={!!selectedApp} onDidDismiss={() => setSelectedApp(null)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{selectedApp?.title}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setSelectedApp(null)}>Close</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {selectedApp && (
            <IonCard>
              <IonCardContent>
                <h2>{selectedApp.title}</h2>
                <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{selectedApp.company}</p>
                
                <div style={{ marginTop: 12, marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <ScoreBadge score={selectedApp.score} />
                  <IonBadge color="tertiary">{selectedApp.status}</IonBadge>
                </div>

                <IonList inset>
                  <IonItem lines="full">
                    <IonLabel>
                      <p>Job URL</p>
                      <a href={selectedApp.url} target="_blank" rel="noopener noreferrer">
                        {selectedApp.url}
                      </a>
                    </IonLabel>
                  </IonItem>
                  {selectedApp.appliedAt && (
                    <IonItem lines="full">
                      <IonLabel>
                        <p>Applied Date</p>
                        <h3>{selectedApp.appliedAt}</h3>
                      </IonLabel>
                    </IonItem>
                  )}
                  {selectedApp.resumeVersion && (
                    <IonItem lines="full">
                      <IonLabel>
                        <p>Resume Version</p>
                        <h3>{selectedApp.resumeVersion}</h3>
                      </IonLabel>
                    </IonItem>
                  )}
                  {selectedApp.coverLetterVersion && (
                    <IonItem lines="none">
                      <IonLabel>
                        <p>Cover Letter Version</p>
                        <h3>{selectedApp.coverLetterVersion}</h3>
                      </IonLabel>
                    </IonItem>
                  )}
                </IonList>

                <IonButton 
                  expand="block" 
                  href={selectedApp.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ marginTop: 16 }}
                >
                  Open Job Listing
                </IonButton>
              </IonCardContent>
            </IonCard>
          )}
        </IonContent>
      </IonModal>
    </PageShell>
  );
}