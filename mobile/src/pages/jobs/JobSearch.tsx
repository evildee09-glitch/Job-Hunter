import { useState } from 'react';
import {
  IonButton, IonButtons, IonContent, IonHeader, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonModal, IonPage,
  IonRefresher, IonRefresherContent, IonSearchbar, IonSegment, IonSegmentButton, IonLabel, IonTitle, IonToggle, IonToolbar,
} from '@ionic/react';
import { useJobs } from '../../hooks/useJobs';
import JobCard from '../../components/JobCard';
import { EmptyState, ErrorRetry, SkeletonList } from '../../components/StateViews';
import type { JobSource } from '../../domain/types';

const SOURCES: Record<JobSource, { name: string; site: string; note: string }> = {
  remotive: { name: 'Remotive', site: 'https://remotive.com', note: 'Remote roles, delayed ~24h, cached 6 h to respect their limits.' },
  himalayas: { name: 'Himalayas', site: 'https://himalayas.app', note: 'Remote roles, refreshed daily, cached 24 h to respect their limits.' },
};

export default function JobSearch() {
  const [query, setQuery] = useState('');
  const [sheet, setSheet] = useState(false);
  const [source, setSource] = useState<JobSource>('remotive');
  const [ph, setPh] = useState(true);
  const q = useJobs(query, source, ph);
  const jobs = q.data?.pages.flatMap((p) => p.items) ?? [];
  const s = SOURCES[source];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Find Jobs</IonTitle>
          <IonButtons slot="end"><IonButton onClick={() => setSheet(true)}>Filters</IonButton></IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSegment value={source} onIonChange={(e) => setSource(e.detail.value as JobSource)}>
            <IonSegmentButton value="remotive"><IonLabel>Remotive</IonLabel></IonSegmentButton>
            <IonSegmentButton value="himalayas"><IonLabel>Himalayas</IonLabel></IonSegmentButton>
          </IonSegment>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar debounce={700} placeholder="Title, company, skill" onIonInput={(e) => setQuery(e.detail.value ?? '')} />
        </IonToolbar>
        <IonToolbar>
          <IonButtons>
            <IonButton routerLink="/jobs/saved">Saved</IonButton>
            <IonButton routerLink="/jobs/shortlisted">Shortlisted</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={async (e) => { await q.refetch(); e.detail.complete(); }}>
          <IonRefresherContent />
        </IonRefresher>
        <p className="ion-padding-horizontal" style={{ fontSize: 12, opacity: 0.8 }}>
          Jobs via <a href={s.site} target="_blank" rel="noopener noreferrer">{s.name}</a>. {s.note}
          {ph && ' Showing roles likely open to the Philippines; always check eligibility on each listing.'}
        </p>
        {q.isLoading && <SkeletonList />}
        {q.isError && <ErrorRetry message={`Could not load jobs. ${q.error instanceof Error ? q.error.message : ''}`} onRetry={() => q.refetch()} />}
        {!q.isLoading && !q.isError && jobs.length === 0 && <EmptyState title="No jobs match" hint="Try a different keyword." />}
        {jobs.map((j) => <JobCard key={j.id} job={j} />)}
        <IonInfiniteScroll disabled={!q.hasNextPage} onIonInfinite={async (e) => { await q.fetchNextPage(); e.target.complete(); }}>
          <IonInfiniteScrollContent />
        </IonInfiniteScroll>

        <IonModal isOpen={sheet} initialBreakpoint={0.4} breakpoints={[0, 0.4, 0.9]} onDidDismiss={() => setSheet(false)}>
          <div className="ion-padding">
            <h3>Filters</h3>
            <IonItem lines="none">
              <IonToggle checked={ph} onIonChange={(e) => setPh(e.detail.checked)}>Likely open to the Philippines</IonToggle>
            </IonItem>
            <p style={{ opacity: 0.7 }}>Himalayas filters by country; Remotive uses a text check on the location, so it can miss or include roles. Confirm on the listing.</p>
            <IonButton expand="block" onClick={() => setSheet(false)}>Done</IonButton>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
}
