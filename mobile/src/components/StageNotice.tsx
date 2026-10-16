import { IonCard, IonCardContent } from '@ionic/react';
import PageShell from './PageShell';

export default function StageNotice({ title, backHref, text }: { title: string; backHref: string; text: string }) {
  return (
    <PageShell title={title} backHref={backHref}>
      <IonCard>
        <IonCardContent>
          <p>{text}</p>
          <p style={{ opacity: 0.7 }}>Nothing is shown here until it is real data.</p>
        </IonCardContent>
      </IonCard>
    </PageShell>
  );
}
