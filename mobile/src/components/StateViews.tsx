import { IonButton, IonSkeletonText, IonList, IonItem, IonLabel } from '@ionic/react';

export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <IonList>
      {Array.from({ length: rows }).map((_, i) => (
        <IonItem key={i}>
          <IonLabel>
            <h3><IonSkeletonText animated style={{ width: '60%' }} /></h3>
            <p><IonSkeletonText animated style={{ width: '40%' }} /></p>
          </IonLabel>
        </IonItem>
      ))}
    </IonList>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="ion-padding ion-text-center">
      <h3>{title}</h3>
      {hint && <p>{hint}</p>}
    </div>
  );
}

export function ErrorRetry({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="ion-padding ion-text-center">
      <p>{message}</p>
      <IonButton onClick={onRetry}>Retry</IonButton>
    </div>
  );
}
