import { useState } from 'react';
import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonModal, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';

export interface EditorState {
  title: string;
  fields: string[];
  values: Record<string, string>;
  onSave: (values: Record<string, string>) => Promise<void>;
}

const LONG = new Set(['description', 'summary']);

function Body({ state, onClose }: { state: EditorState; onClose: () => void }) {
  const [vals, setVals] = useState(state.values);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const save = async () => {
    setBusy(true);
    setErr('');
    try { await state.onSave(vals); onClose(); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Save failed'); }
    finally { setBusy(false); }
  };
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonButton onClick={onClose}>Cancel</IonButton></IonButtons>
          <IonTitle>{state.title}</IonTitle>
          <IonButtons slot="end"><IonButton strong disabled={busy} onClick={save}>Save</IonButton></IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {state.fields.map((f) => LONG.has(f)
          ? <IonTextarea key={f} label={f} labelPlacement="stacked" autoGrow rows={4} value={vals[f] ?? ''} onIonInput={(e) => setVals((v) => ({ ...v, [f]: String(e.detail.value ?? '') }))} />
          : <IonInput key={f} label={f} labelPlacement="stacked" value={vals[f] ?? ''} onIonInput={(e) => setVals((v) => ({ ...v, [f]: String(e.detail.value ?? '') }))} />)}
        <p style={{ opacity: 0.7 }}>Saving marks this entry as verified, meaning you confirm it is accurate.</p>
        {err && <p style={{ color: 'var(--ajh-warn)' }}>{err}</p>}
      </IonContent>
    </>
  );
}

export default function ItemEditor({ state, onClose }: { state: EditorState | null; onClose: () => void }) {
  return (
    <IonModal isOpen={!!state} onDidDismiss={onClose}>
      {state && <Body key={state.title} state={state} onClose={onClose} />}
    </IonModal>
  );
}
