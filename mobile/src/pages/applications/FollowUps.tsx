import { useState } from 'react';
import { IonCheckbox, IonItem, IonList } from '@ionic/react';
import PageShell from '../../components/PageShell';
import { mockFollowUps } from '../../mock/applications';

export default function FollowUps() {
  const [items, setItems] = useState(mockFollowUps);
  const today = '2026-10-14';
  return (
    <PageShell title="Follow-up Reminders" backHref="/applications">
      <IonList>
        {[...items].sort((a, b) => a.due.localeCompare(b.due)).map((f) => (
          <IonItem key={f.id}>
            <IonCheckbox checked={f.done} labelPlacement="end" justify="start"
              onIonChange={(e) => setItems((p) => p.map((x) => (x.id === f.id ? { ...x, done: e.detail.checked } : x)))}>
              <div style={{ textDecoration: f.done ? 'line-through' : 'none' }}>
                {f.company}: {f.task}
                <div style={{ fontSize: 12, color: !f.done && f.due < today ? 'var(--ajh-warn)' : undefined }}>
                  Due {f.due}{!f.done && f.due < today ? ' (overdue)' : ''}
                </div>
              </div>
            </IonCheckbox>
          </IonItem>
        ))}
      </IonList>
    </PageShell>
  );
}
