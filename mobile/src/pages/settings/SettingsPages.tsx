import { useState } from 'react';
import { IonAlert, IonButton, IonCard, IonCardContent } from '@ionic/react';
import PageShell from '../../components/PageShell';
import NeedsBackend from '../../components/NeedsBackend';
import StageNotice from '../../components/StageNotice';
import { apiFetch, getBackend } from '../../data/api';
import { useProfile } from '../../hooks/useProfile';

const B = '/settings';

export const ProviderHealth = () => <StageNotice title="Provider Health" backHref={B} text="No providers to check yet. Health monitoring arrives in Stage 11." />;
export const UsageCost = () => <StageNotice title="Usage and Cost" backHref={B} text="No AI usage recorded. Usage and cost tracking arrive in Stage 11." />;
export const SearchSchedules = () => <StageNotice title="Search Schedules" backHref={B} text="Scheduled searches need background tasks on the backend (Stage 10). For now, searches run when you open Find Jobs." />;
export const Notifications = () => <StageNotice title="Notifications" backHref={B} text="No notifications yet. In-app notifications arrive in Stage 10." />;
export const SystemLogs = () => <StageNotice title="System Logs" backHref={B} text="Backend logs are in your Render dashboard. In-app logs arrive later. Secrets and full prompts are never logged." />;

export function Profile() {
  const q = useProfile();
  const p = q.data;
  return (
    <PageShell title="Profile" backHref={B}>
      {!getBackend() && <NeedsBackend />}
      {p && (
        <IonCard><IonCardContent>
          <p>{p.name || '(no name)'} · {p.email || 'no email'} · {p.phone || 'no phone'}</p>
          <IonButton routerLink="/resume/import">Edit in Import and Review</IonButton>
        </IonCardContent></IonCard>
      )}
    </PageShell>
  );
}

export function Privacy() {
  const [alert, setAlert] = useState(false);
  const [msg, setMsg] = useState('');
  const exportData = async () => {
    setMsg('');
    try {
      const data = await apiFetch<unknown>('/export');
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ai-job-hunter-export.json';
      a.click();
      URL.revokeObjectURL(url);
      setMsg('Export created. On some Android versions downloads from the app may be blocked; tell me if so.');
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Export failed'); }
  };
  const deleteAll = async () => {
    try {
      const r = await apiFetch<{ deleted_applications: number; deleted_files: number }>('/data?confirm=DELETE', { method: 'DELETE' });
      setMsg(`Deleted your profile, ${r.deleted_applications} tracked applications and ${r.deleted_files} uploaded files from the backend.`);
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Delete failed'); }
  };
  return (
    <PageShell title="Privacy and Data" backHref={B}>
      {!getBackend() && <NeedsBackend />}
      {getBackend() && (
        <IonCard><IonCardContent>
          <p>Your resume, profile, and tracked applications are stored in your backend's database. Job sources are contacted directly from this device; your resume is never sent to them.</p>
          <IonButton expand="block" fill="outline" onClick={exportData}>Export my data (JSON)</IonButton>
          <IonButton expand="block" color="danger" onClick={() => setAlert(true)}>Delete all backend data</IonButton>
          {msg && <p>{msg}</p>}
          <p style={{ opacity: 0.7 }}>Saved jobs and caches stay on this device; clear the app's storage to remove them.</p>
        </IonCardContent></IonCard>
      )}
      <IonAlert isOpen={alert} header="Delete all backend data?" message="This permanently deletes your profile, imported resumes, and tracked applications. Type DELETE to confirm."
        inputs={[{ name: 'confirm', type: 'text', placeholder: 'DELETE' }]}
        buttons={[{ text: 'Cancel', role: 'cancel' }, { text: 'Delete', role: 'destructive', handler: (d: { confirm?: string }) => { if (d.confirm !== 'DELETE') return false; deleteAll(); } }]}
        onDidDismiss={() => setAlert(false)} />
    </PageShell>
  );
}

export function Help() {
  return (
    <PageShell title="Help" backHref={B}>
      <IonCard><IonCardContent>
        <p><strong>You always apply.</strong> The app finds and ranks jobs and tracks your applications. You click Submit yourself on the employer's site, and you mark an application as submitted yourself.</p>
        <p><strong>Verified facts only.</strong> Matching and tailoring use only entries you confirmed.</p>
        <p><strong>Matching is keyword-based</strong> until AI analysis arrives. Always read the listing and check eligibility.</p>
        <p><strong>Sources.</strong> Remotive, Himalayas, and We Work Remotely via their public feeds. Other boards do not offer open APIs.</p>
      </IonCardContent></IonCard>
    </PageShell>
  );
}
