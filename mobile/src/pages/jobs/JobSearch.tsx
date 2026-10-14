import { useState } from 'react';
import {
  IonButton, IonButtons, IonContent, IonHeader, IonInfiniteScroll, IonInfiniteScrollContent, IonModal, IonPage,
  IonRefresher, IonRefresherContent, IonSearchbar, IonSelect, IonSelectOption, IonTitle, IonToolbar,
} from '@ionic/react';
import { useJobs } from '../../hooks/useJobs';
import JobCard from '../../components/JobCard';
import { EmptyState, ErrorRetry, SkeletonList } from '../../components/StateViews';

export default function JobSearch() {
  const [query, setQuery] = useState('');
  const [sheet, setSheet] = useState(false);
  const [arrangement, setArrangement] = useState('any');
  const [minScore, setMinScore] = useState(0);
  const q = useJobs(query);
  // Stage 1: filters apply to loaded results on the client. Stage 5 moves them server-side.
  const jobs = (q.data?.pages.flatMap((p) => p.items) ?? []).filter(
    (j) => (arrangement === 'any' || j.arrangement === arrangement) && (j.score ?? 0) >= minScore
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Find Jobs</IonTitle>
          <IonButtons slot="end"><IonButton onClick={() => setSheet(true)}>Filters</IonButton></IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar debounce={300} placeholder="Title, company, skill, location"
            onIonInput={(e) => setQuery(e.detail.value ?? '')} />
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
        {q.isLoading && <SkeletonList />}
        {q.isError && <ErrorRetry message="Could not load jobs." onRetry={() => q.refetch()} />}
        {!q.isLoading && !q.isError && jobs.length === 0 && (
          <EmptyState title="No jobs match" hint="Try a different keyword or reset the filters." />
        )}
        {jobs.map((j) => <JobCard key={j.id} job={j} />)}
        <IonInfiniteScroll disabled={!q.hasNextPage}
          onIonInfinite={async (e) => { await q.fetchNextPage(); e.target.complete(); }}>
          <IonInfiniteScrollContent />
        </IonInfiniteScroll>

        <IonModal isOpen={sheet} initialBreakpoint={0.5} breakpoints={[0, 0.5, 0.9]} onDidDismiss={() => setSheet(false)}>
          <div className="ion-padding">
            <h3>Filters</h3>
            <IonSelect label="Work arrangement" labelPlacement="stacked" value={arrangement}
              onIonChange={(e) => setArrangement(e.detail.value)}>
              {['any', 'remote', 'hybrid', 'onsite'].map((a) => <IonSelectOption key={a} value={a}>{a}</IonSelectOption>)}
            </IonSelect>
            <IonSelect label="Minimum match score" labelPlacement="stacked" value={minScore}
              onIonChange={(e) => setMinScore(Number(e.detail.value))}>
              {[0, 5, 7, 9].map((n) => <IonSelectOption key={n} value={n}>{n === 0 ? 'Any' : `${n}+`}</IonSelectOption>)}
            </IonSelect>
            <IonButton expand="block" onClick={() => setSheet(false)}>Done</IonButton>
            <IonButton expand="block" fill="clear" onClick={() => { setArrangement('any'); setMinScore(0); }}>Reset</IonButton>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
}
