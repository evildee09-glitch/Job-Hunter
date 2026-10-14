import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import type { ReactNode } from 'react';

export default function PageShell({ title, backHref, children }: { title: string; backHref?: string; children: ReactNode }) {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          {backHref && <IonButtons slot="start"><IonBackButton defaultHref={backHref} /></IonButtons>}
          <IonTitle>{title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>{children}</IonContent>
    </IonPage>
  );
}
