import { IonBadge } from '@ionic/react';
import { verificationLabel, type Verification } from '../domain/resume';

const color = { verified: 'success', unverified: 'warning', ai_suggested: 'tertiary' } as const;

export default function VerificationBadge({ v }: { v: Verification }) {
  return <IonBadge color={color[v]}>{verificationLabel[v]}</IonBadge>;
}
