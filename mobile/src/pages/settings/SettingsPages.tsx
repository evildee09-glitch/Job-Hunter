import { useState } from 'react';
import {
  IonAlert, IonBadge, IonButton, IonCard, IonCardContent, IonItem, IonLabel, IonList, IonProgressBar, IonToggle,
} from '@ionic/react';
import PageShell from '../../components/PageShell';
import { tasks } from '../../domain/providers';

const B = '/settings';

export function ProviderHealth() {
  const rows = [
    ['Ollama (local)', 'Healthy', '1.8 s', 'today 09:12'],
    ['OpenAI', 'Disabled', '-', '-'],
    ['Google Gemini', 'Disabled', '-', '-'],
    ['Anthropic Claude', 'Disabled', '-', '-'],
  ];
  return (
    <PageShell title="Provider Health" backHref={B}>
      <IonList inset>
        {rows.map(([n, s, l, t]) => (
          <IonItem key={n}>
            <IonLabel><h3>{n}</h3><p>Latency {l} · last success {t}</p></IonLabel>
            <IonBadge color={s === 'Healthy' ? 'success' : 'medium'}>{s}</IonBadge>
          </IonItem>
        ))}
      </IonList>
      <p className="ion-padding">Mock data. Real checks arrive in Stage 11.</p>
    </PageShell>
  );
}

export function UsageCost() {
  return (
    <PageShell title="Usage and Cost" backHref={B}>
      <IonCard>
        <IonCardContent>
          <strong>Monthly cloud budget (mock)</strong>
          <IonProgressBar value={0.35} />
          <p>35% used. You are warned before the limit is reached.</p>
        </IonCardContent>
      </IonCard>
      <IonList inset>
        <IonItem><IonLabel><h3>Ollama / llama3.1:8b</h3><p>42 requests · local, no API cost · avg speed shown when reported</p></IonLabel></IonItem>
        <IonItem><IonLabel><h3>Cloud models</h3><p>No cloud requests yet. Costs are estimates and labeled as such.</p></IonLabel></IonItem>
      </IonList>
    </PageShell>
  );
}

export function SearchSchedules() {
  const [on, setOn] = useState([true, false]);
  const rows = ['Every morning, 8:00 · Backend roles', 'Weekdays, twice daily · Mobile roles'];
  return (
    <PageShell title="Search Schedules" backHref={B}>
      <IonList inset>
        {rows.map((r, i) => (
          <IonItem key={r}>
            <IonToggle checked={on[i]} onIonChange={(e) => setOn((p) => p.map((v, k) => (k === i ? e.detail.checked : v)))}>{r}</IonToggle>
          </IonItem>
        ))}
      </IonList>
      <p className="ion-padding">Mock only. Scheduled runs need the backend (Stage 10).</p>
    </PageShell>
  );
}

export function Notifications() {
  const rows = ['High-match job: Senior Backend Engineer (9/10)', 'Follow-up due: Helix Cloud', 'Interview in 3 days: Orbit Retail'];
  return (
    <PageShell title="Notifications" backHref={B}>
      <IonList>{rows.map((r) => <IonItem key={r}><IonLabel className="ion-text-wrap">{r}</IonLabel></IonItem>)}</IonList>
    </PageShell>
  );
}

export function Profile() {
  return (
    <PageShell title="Profile" backHref={B}>
      <IonCard><IonCardContent>
        <p>Name: Sample Candidate</p>
        <p>Preferences: remote or hybrid · notice period and salary range not set</p>
        <p style={{ opacity: 0.7 }}>Sample data. Editable fields arrive with the master resume database in Stage 2.</p>
      </IonCardContent></IonCard>
    </PageShell>
  );
}

export function Privacy() {
  const [local, setLocal] = useState<Record<string, boolean>>(Object.fromEntries(tasks.map((t) => [t, true])));
  const [alert, setAlert] = useState<'export' | 'delete' | null>(null);
  return (
    <PageShell title="Privacy and Data" backHref={B}>
      <IonList inset>
        {tasks.map((t) => (
          <IonItem key={t}>
            <IonToggle checked={local[t]} onIonChange={(e) => setLocal((p) => ({ ...p, [t]: e.detail.checked }))}>
              {t}: local only
            </IonToggle>
          </IonItem>
        ))}
      </IonList>
      <div className="ion-padding">
        <IonButton expand="block" fill="outline" onClick={() => setAlert('export')}>Export my data</IonButton>
        <IonButton expand="block" color="danger" onClick={() => setAlert('delete')}>Delete all my data</IonButton>
      </div>
      <IonAlert isOpen={alert !== null} header={alert === 'delete' ? 'Delete all data?' : 'Export data'}
        message={alert === 'delete' ? 'This cannot be undone. (Mock: nothing is deleted in Stage 1.)' : 'Mock: export arrives with the backend.'}
        buttons={['OK']} onDidDismiss={() => setAlert(null)} />
    </PageShell>
  );
}

export function SystemLogs() {
  const rows = ['09:12 provider.ollama health check ok', '09:10 search.run manual started', '09:10 search.run finished (0 new)'];
  return (
    <PageShell title="System Logs" backHref={B}>
      <IonList>{rows.map((r) => <IonItem key={r}><IonLabel className="ion-text-wrap"><code>{r}</code></IonLabel></IonItem>)}</IonList>
      <p className="ion-padding">Secrets, tokens, and full prompts are never written to logs.</p>
    </PageShell>
  );
}

export function Help() {
  return (
    <PageShell title="Help" backHref={B}>
      <IonCard><IonCardContent>
        <p><strong>You always submit.</strong> The app prepares applications, but you click the final Submit yourself.</p>
        <p><strong>Verified facts only.</strong> Resumes and letters use only details you confirmed.</p>
        <p><strong>Local vs cloud.</strong> Each task shows where it runs; local-only is available.</p>
      </IonCardContent></IonCard>
    </PageShell>
  );
}
