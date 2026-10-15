import { useState, type ChangeEvent } from 'react';
import { IonButton, IonCard, IonCardContent, IonInput } from '@ionic/react';
import { useQueryClient } from '@tanstack/react-query';
import PageShell from '../../components/PageShell';
import ProfileReview from '../../components/ProfileReview';
import { apiFetch, getBackend, saveBackend, testBackend } from '../../data/api';

const MAX_MB = 5;
const ALLOWED = ['.pdf', '.docx', '.txt'];

interface ImportResult { counts: Record<string, number>; sections_found: string[]; note: string }

export default function ImportResume() {
  const qc = useQueryClient();
  const saved = getBackend();
  const [url, setUrl] = useState(saved?.url ?? 'http://192.168.1.50:8000');
  const [token, setToken] = useState(saved?.token ?? '');
  const [configured, setConfigured] = useState(!!saved);
  const [status, setStatus] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const connect = async () => {
    setBusy(true);
    setStatus('');
    try {
      const msg = await testBackend(url, token);
      saveBackend({ url, token });
      setConfigured(true);
      setStatus(msg);
      qc.invalidateQueries({ queryKey: ['profile'] });
    } catch (e) {
      setConfigured(false);
      setStatus(`${e instanceof Error ? e.message : 'Failed'}. Check the address (use your laptop's IP, not localhost), the token, and that the backend is running.`);
    } finally { setBusy(false); }
  };

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(null); setError(''); setResult(null);
    if (!f) return;
    const ext = f.name.slice(f.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED.includes(ext)) return setError(`Unsupported type. Use ${ALLOWED.join(', ')}.`);
    if (f.size > MAX_MB * 1024 * 1024) return setError(`File is larger than ${MAX_MB} MB.`);
    setFile(f);
  };

  const upload = async () => {
    if (!file) return;
    setBusy(true); setError(''); setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      setResult(await apiFetch<ImportResult>('/resume/import', { method: 'POST', body: fd }));
      qc.invalidateQueries({ queryKey: ['profile'] });
    } catch (e) { setError(e instanceof Error ? e.message : 'Upload failed'); }
    finally { setBusy(false); }
  };

  return (
    <PageShell title="Import and Review" backHref="/resume">
      <IonCard>
        <IonCardContent>
          <strong>1. Connect to your backend</strong>
          <IonInput label="Backend address" labelPlacement="stacked" value={url} onIonInput={(e) => setUrl(String(e.detail.value ?? ''))} />
          <IonInput label="API token (from backend .env)" labelPlacement="stacked" type="password" value={token} onIonInput={(e) => setToken(String(e.detail.value ?? ''))} />
          <IonButton expand="block" disabled={busy || !url || !token} onClick={connect}>Test and save</IonButton>
          {status && <p>{status}</p>}
        </IonCardContent>
      </IonCard>

      {configured && (
        <>
          <IonCard>
            <IonCardContent>
              <strong>2. Upload your resume</strong>
              <p>{ALLOWED.join(', ')}, up to {MAX_MB} MB. Scanned (image-only) PDFs are not supported yet.</p>
              <input type="file" accept={ALLOWED.join(',')} onChange={onPick} aria-label="Resume file" />
              {error && <p style={{ color: 'var(--ajh-warn)' }}>{error}</p>}
              {file && <p>Selected: {file.name} ({Math.round(file.size / 1024)} KB)</p>}
              <IonButton expand="block" disabled={!file || busy} onClick={upload}>Upload and extract</IonButton>
              {result && (
                <p>
                  Imported: {Object.entries(result.counts).map(([k, n]) => `${n} ${k}`).join(', ')}. {result.note}
                </p>
              )}
            </IonCardContent>
          </IonCard>
          <h4 className="ion-padding-horizontal">3. Review and confirm</h4>
          <p className="ion-padding-horizontal" style={{ opacity: 0.8 }}>
            Extraction is automatic and imperfect. Nothing counts as part of your master resume until you confirm it.
          </p>
          <ProfileReview />
        </>
      )}
    </PageShell>
  );
}
