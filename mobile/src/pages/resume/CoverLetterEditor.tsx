import { useState } from 'react';
import { IonButton, IonCard, IonCardContent, IonSelect, IonSelectOption, IonTextarea } from '@ionic/react';
import PageShell from '../../components/PageShell';

const styles = ['Formal', 'Concise', 'Conversational', 'Technical'];

export default function CoverLetterEditor() {
  const [style, setStyle] = useState('Concise');
  const [text, setText] = useState('Dear Hiring Team,\n\n(Sample draft. AI-generated drafts arrive in Stage 7 and use only verified profile facts.)\n\nSincerely,\nSample Candidate');
  const [approved, setApproved] = useState(false);
  return (
    <PageShell title="Cover Letter" backHref="/resume">
      <IonCard>
        <IonCardContent>
          <IonSelect label="Style" labelPlacement="stacked" value={style} onIonChange={(e) => setStyle(e.detail.value)}>
            {styles.map((s) => <IonSelectOption key={s} value={s}>{s}</IonSelectOption>)}
          </IonSelect>
          <IonTextarea label="Letter" labelPlacement="stacked" autoGrow rows={10} value={text}
            onIonInput={(e) => { setText(String(e.detail.value ?? '')); setApproved(false); }} />
          <IonButton expand="block" disabled={approved} onClick={() => setApproved(true)}>
            {approved ? 'Approved' : 'Approve this version'}
          </IonButton>
          <p style={{ opacity: 0.7 }}>Editing after approval resets approval. Export to DOCX/PDF comes in Stage 7.</p>
        </IonCardContent>
      </IonCard>
    </PageShell>
  );
}
