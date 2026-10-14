import { useState } from 'react';
import { IonBadge, IonCard, IonCardContent, IonItem, IonLabel, IonList, IonListHeader, IonNote, IonSelect, IonSelectOption, IonToggle } from '@ionic/react';
import PageShell from '../../components/PageShell';
import { mockProviders } from '../../mock/providers';
import { tasks, type TaskName } from '../../domain/providers';

export default function ProviderManager() {
  const [providers, setProviders] = useState(mockProviders);
  const [fallback, setFallback] = useState(false);
  const enabled = providers.filter((p) => p.enabled);
  const options = enabled.flatMap((p) => p.models.map((m) => ({ key: `${p.id}:${m}`, label: `${p.name} / ${m}`, local: p.local })));
  const [routing, setRouting] = useState<Record<TaskName, string>>(
    () => Object.fromEntries(tasks.map((t) => [t, options[0]?.key ?? ''])) as Record<TaskName, string>
  );

  return (
    <PageShell title="AI Providers" backHref="/settings">
      <IonNote className="ion-padding" style={{ display: 'block' }}>
        Mock data. Keys are always masked and are never returned to the app once stored.
      </IonNote>
      <IonList inset>
        <IonListHeader><IonLabel>Providers</IonLabel></IonListHeader>
        {providers.map((p) => (
          <IonItem key={p.id}>
            <IonLabel>
              <h3>{p.name}</h3>
              <p>{p.maskedKey ?? 'No key needed'}</p>
              <IonBadge color={p.local ? 'success' : 'warning'}>{p.local ? 'Local: data stays on your machine' : 'Cloud: prompts leave your machine'}</IonBadge>
            </IonLabel>
            <IonToggle checked={p.enabled} aria-label={`Enable ${p.name}`}
              onIonChange={(e) => setProviders((prev) => prev.map((x) => (x.id === p.id ? { ...x, enabled: e.detail.checked } : x)))} />
          </IonItem>
        ))}
      </IonList>

      <IonList inset>
        <IonListHeader><IonLabel>Task routing</IonLabel></IonListHeader>
        {options.length === 0 && <IonItem><IonLabel>Enable a provider to assign tasks.</IonLabel></IonItem>}
        {options.length > 0 && tasks.map((t) => (
          <IonItem key={t}>
            <IonSelect label={t} labelPlacement="stacked" value={routing[t]}
              onIonChange={(e) => setRouting((r) => ({ ...r, [t]: e.detail.value }))}>
              {options.map((o) => <IonSelectOption key={o.key} value={o.key}>{o.label}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
        ))}
      </IonList>

      <IonCard>
        <IonCardContent>
          <IonItem lines="none">
            <IonToggle checked={fallback} onIonChange={(e) => setFallback(e.detail.checked)}>Allow fallback provider</IonToggle>
          </IonItem>
          <p>Fallback never switches to a paid provider silently. You are notified whenever it is used.</p>
        </IonCardContent>
      </IonCard>
    </PageShell>
  );
}
