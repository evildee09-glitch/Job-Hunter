import { useState } from 'react';
import { IonButton, IonCard, IonCardContent } from '@ionic/react';
import PageShell from '../../components/PageShell';
import VerificationBadge from '../../components/VerificationBadge';
import { mockEmployment } from '../../mock/resume';

export default function EmploymentHistory() {
  const [jobs, setJobs] = useState(mockEmployment);

  const update = (id: string, i: number, action: 'confirm' | 'remove') =>
    setJobs((prev) => prev.map((j) => j.id !== id ? j : {
      ...j,
      bullets: action === 'remove'
        ? j.bullets.filter((_, k) => k !== i)
        : j.bullets.map((b, k) => (k === i ? { ...b, v: 'verified' as const } : b)),
    }));

  return (
    <PageShell title="Employment History" backHref="/resume">
      {jobs.map((j) => (
        <IonCard key={j.id}>
          <IonCardContent>
            <h2>{j.title}</h2>
            <div>{j.company} · {j.start} to {j.end}</div>
            {j.bullets.map((b, i) => (
              <div key={i} style={{ marginTop: 10 }}>
                <div>{b.text}</div>
                <VerificationBadge v={b.v} />
                {b.v !== 'verified' && (
                  <>
                    <IonButton size="small" fill="outline" onClick={() => update(j.id, i, 'confirm')}>Confirm as accurate</IonButton>
                    {b.v === 'ai_suggested' && (
                      <IonButton size="small" fill="clear" color="danger" onClick={() => update(j.id, i, 'remove')}>Reject</IonButton>
                    )}
                  </>
                )}
              </div>
            ))}
          </IonCardContent>
        </IonCard>
      ))}
    </PageShell>
  );
}
