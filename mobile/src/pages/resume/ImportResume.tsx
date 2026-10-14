import { useState, type ChangeEvent } from 'react';
import { IonButton, IonCard, IonCardContent } from '@ionic/react';
import PageShell from '../../components/PageShell';

const MAX_MB = 5;
const ALLOWED = ['.pdf', '.docx', '.txt'];

export default function ImportResume() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(null);
    setError(null);
    if (!f) return;
    const ext = f.name.slice(f.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED.includes(ext)) return setError(`Unsupported type. Use ${ALLOWED.join(', ')}.`);
    if (f.size > MAX_MB * 1024 * 1024) return setError(`File is larger than ${MAX_MB} MB.`);
    setFile(f);
  };

  return (
    <PageShell title="Import Resume" backHref="/resume">
      <IonCard>
        <IonCardContent>
          <p>Choose your existing resume ({ALLOWED.join(', ')}, up to {MAX_MB} MB).</p>
          <input type="file" accept={ALLOWED.join(',')} onChange={onPick} aria-label="Resume file" />
          {error && <p style={{ color: 'var(--ajh-warn)' }}>{error}</p>}
          {file && <p>Selected: {file.name} ({Math.round(file.size / 1024)} KB)</p>}
          <IonButton expand="block" disabled>Extract and review (Stage 2)</IonButton>
        </IonCardContent>
      </IonCard>
      <IonCard color="light">
        <IonCardContent>
          <strong>What works today:</strong> choosing and validating the file only. Nothing is uploaded or saved yet.
          <p><strong>Stage 2:</strong> the file goes to your backend, text is extracted, and every extracted field arrives as
          Unverified so you can confirm or correct it. Nothing becomes part of your master resume without your confirmation.</p>
        </IonCardContent>
      </IonCard>
    </PageShell>
  );
}
