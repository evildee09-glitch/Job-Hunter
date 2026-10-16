import { IonButton, IonItem, IonLabel, IonList, IonListHeader } from '@ionic/react';
import PageShell from './PageShell';
import VerificationBadge from './VerificationBadge';
import NeedsBackend from './NeedsBackend';
import { ErrorRetry, SkeletonList } from './StateViews';
import { SECTIONS, type Kind } from './ProfileReview';
import { useProfile } from '../hooks/useProfile';
import { getBackend } from '../data/api';

export default function ProfileSections({ title, kinds }: { title: string; kinds: Kind[] }) {
  const q = useProfile();
  const p = q.data;
  return (
    <PageShell title={title} backHref="/resume">
      {!getBackend() && <NeedsBackend />}
      {getBackend() && q.isLoading && <SkeletonList rows={3} />}
      {q.isError && <ErrorRetry message={`Could not load your profile. ${q.error instanceof Error ? q.error.message : ''}`} onRetry={() => q.refetch()} />}
      {p && kinds.map((k) => {
        const s = SECTIONS.find((x) => x.kind === k)!;
        const items = p[k];
        return (
          <IonList inset key={k}>
            <IonListHeader><IonLabel>{s.label} ({items.length})</IonLabel></IonListHeader>
            {items.length === 0 && <IonItem><IonLabel>Nothing yet. Import your resume or add entries.</IonLabel></IonItem>}
            {items.map((i) => (
              <IonItem key={i.id}>
                <IonLabel className="ion-text-wrap"><h3>{s.title(i)}</h3><p>{s.sub(i)}</p></IonLabel>
                <VerificationBadge v={i.verification} />
              </IonItem>
            ))}
          </IonList>
        );
      })}
      <div className="ion-padding"><IonButton expand="block" routerLink="/resume/import">Edit in Import and Review</IonButton></div>
    </PageShell>
  );
}
