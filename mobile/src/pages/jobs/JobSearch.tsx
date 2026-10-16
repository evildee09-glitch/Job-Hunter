import { useMemo, useState } from 'react';
import {
  IonButton, IonButtons, IonContent, IonHeader, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonModal, IonPage,
  IonRefresher, IonRefresherContent, IonSearchbar, IonSegment, IonSegmentButton, IonSelect, IonSelectOption, IonTitle, IonToggle, IonToolbar,
} from '@ionic/react';
import { useJobs } from '../../hooks/useJobs';
import { useMatcher } from '../../hooks/useProfile';
import JobCard from '../../components/JobCard';
import { EmptyState, ErrorRetry, SkeletonList } from '../../components/StateViews';
import type { JobSource } from '../../domain/types';

const SOURCES: Record<JobSource, { name: string; site: string; note: string }> = {
  remotive: { name: 'Remotive', site: 'https://remotive.com', note: 'Remote roles, delayed ~24h, cached 6 h to respect their limits.' },
  himalayas: { name: 'Himalayas', site: 'https://himalayas.app', note: 'Remote roles, refreshed daily, cached 24 h to respect their limits.' },
  wwr: { name: 'We Work Remotely', site: 'https://weworkremotely.com', note: 'Remote roles from their public feed, cached 6 h.' },
};

export default function JobSearch() {
  const [query, setQuery] = useState('');
  const [sheet, setSheet] = useState(false);
  const [source, setSource] = useState<JobSource>('remotive');
  const [ph, setPh] = useState(true);
  const [best, setBest] = useState(true);
  const [minScore, setMinScore] = useState(0);
  const q = useJobs(query, source, ph);
  const matcher = useMatcher();
  const s = SOURCES[source];

  const jobs = useMemo(() => {
    const all = q.data?.pages.flatMap((p) => p.items) ?? [];
    if (!matcher.ready) return all;
    const scored = all.map((j) => ({ j, score: matcher.match(j).score ?? 0 })).filter((x) => x.score >= minScore);
    if (best) scored.sort((a, b) => b.score - a.score);
    return scored.map((x) => x.j);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.data, matcher.ready, best, minScore]);

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
            <IonSegmentButton value="wwr"><IonLabel>WWR</IonLabel></IonSegmentButton>
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
        <p className="ion-padding-horizontal" style={{ fontSize: 12 }}>
          {matcher.ready
            ? 'Scores are a keyword match against your verified skills, not an AI assessment.'
            : matcher.hasBackend
              ? 'Confirm your skills under Resume > Import existing resume to rank jobs by match.'
              : 'Connect your backend and import your resume to rank jobs by match.'}
        </p>
        {q.isLoading && <SkeletonList />}
        {q.isError && <ErrorRetry message={`Could not load jobs. ${q.error instanceof Error ? q.error.message : ''}`} onRetry={() => q.refetch()} />}
        {!q.isLoading && !q.isError && jobs.length === 0 && <EmptyState title="No jobs match" hint="Try a different keyword, source, or lower the minimum match." />}
        {jobs.map((j) => <JobCard key={j.id} job={j} />)}
        <IonInfiniteScroll disabled={!q.hasNextPage} onIonInfinite={async (e) => { await q.fetchNextPage(); e.target.complete(); }}>
          <IonInfiniteScrollContent />
        </IonInfiniteScroll>

        <IonModal isOpen={sheet} initialBreakpoint={0.5} breakpoints={[0, 0.5, 0.9]} onDidDismiss={() => setSheet(false)}>
          <div className="ion-padding">
            <h3>Filters</h3>
            <IonItem lines="none">
              <IonToggle checked={ph} onIonChange={(e) => setPh(e.detail.checked)}>Likely open to the Philippines</IonToggle>
            </IonItem>
            <IonItem lines="none">
              <IonToggle checked={best} disabled={!matcher.ready} onIonChange={(e) => setBest(e.detail.checked)}>Best matches first</IonToggle>
            </IonItem>
            <IonSelect label="Minimum match" labelPlacement="stacked" disabled={!matcher.ready} value={minScore} onIonChange={(e) => setMinScore(Number(e.detail.value))}>
              {[0, 3, 5, 7].map((n) => <IonSelectOption key={n} value={n}>{n === 0 ? 'Any' : `${n}+`}</IonSelectOption>)}
            </IonSelect>
            <p style={{ opacity: 0.7 }}>Match sorting applies to the jobs loaded so far. Himalayas filters by country; Remotive and WWR use a text check on the location, so confirm on the listing.</p>
            <IonButton expand="block" onClick={() => setSheet(false)}>Done</IonButton>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
}
