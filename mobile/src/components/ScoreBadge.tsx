import { IonBadge } from '@ionic/react';
import { scoreBand, bandLabel } from '../domain/scoring';

const color = { excellent: 'success', strong: 'primary', consider: 'warning', low: 'medium', unscored: 'light' } as const;

export default function ScoreBadge({ score }: { score?: number }) {
  const band = scoreBand(score);
  return (
    <IonBadge className="score-badge" color={color[band]} aria-label={`${bandLabel[band]}${score ? `, score ${score} of 10` : ''}`}>
      {score !== undefined ? `${score}/10` : 'N/A'}
    </IonBadge>
  );
}
