import { useState } from 'react';
import { IonBadge, IonButton, IonCard, IonCardContent, IonInput, IonItem, IonLabel, IonList, IonListHeader } from '@ionic/react';
import PageShell from '../../components/PageShell';
import { mockOllamaModels } from '../../mock/providers';

export default function OllamaManager() {
  const [endpoint, setEndpoint] = useState('http://192.168.1.50:11434');
  const [result, setResult] = useState<string | null>(null);
  return (
    <PageShell title="Ollama Models" backHref="/settings">
      <IonCard>
        <IonCardContent>
          <IonInput label="Ollama endpoint (as seen by the backend)" labelPlacement="stacked" value={endpoint}
            onIonInput={(e) => setEndpoint(String(e.detail.value ?? ''))} />
          <IonButton onClick={() => setResult('Mock result: connection OK. Real test arrives with the backend (Stage 4).')}>Test connection</IonButton>
          {result && <p>{result}</p>}
        </IonCardContent>
      </IonCard>
      <IonList inset>
        <IonListHeader><IonLabel>Models</IonLabel></IonListHeader>
        {mockOllamaModels.map((m) => (
          <IonItem key={m.name}>
            <IonLabel><h3>{m.name}</h3><p>{m.sizeGB} GB</p></IonLabel>
            <IonBadge color={m.installed ? 'success' : 'medium'}>{m.installed ? 'Installed' : 'Not installed'}</IonBadge>
          </IonItem>
        ))}
      </IonList>
      <IonCard>
        <IonCardContent>
          <strong>Troubleshooting</strong>
          <p>Your phone cannot reach the laptop's localhost. The backend talks to Ollama, not the phone.</p>
          <p>Do not expose Ollama to the public internet. Keep it on a trusted network.</p>
          <p>Install a model with: <code>ollama pull llama3.1:8b</code></p>
        </IonCardContent>
      </IonCard>
    </PageShell>
  );
}
