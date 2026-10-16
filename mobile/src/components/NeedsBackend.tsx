import { IonButton, IonCard, IonCardContent } from '@ionic/react';

export default function NeedsBackend() {
  return (
    <IonCard>
      <IonCardContent>
        <p>Connect to your backend to see your data here.</p>
        <IonButton routerLink="/resume/import">Connect backend</IonButton>
      </IonCardContent>
    </IonCard>
  );
}
