import { IonItem, IonLabel, IonList, IonListHeader } from '@ionic/react';
import PageShell from '../../components/PageShell';

const groups: Array<[string, Array<[string, string]>]> = [
  ['AI', [
    ['AI Provider Manager', '/settings/providers'], ['Ollama Model Manager', '/settings/ollama'],
    ['Provider Health', '/settings/health'], ['Usage and Cost', '/settings/usage'],
  ]],
  ['Jobs and alerts', [['Search Schedules', '/settings/schedules'], ['Notifications', '/settings/notifications']]],
  ['Account', [['Profile', '/settings/profile'], ['Privacy and Data', '/settings/privacy']]],
  ['Support', [['System Logs', '/settings/logs'], ['Help', '/settings/help']]],
];

export default function Settings() {
  return (
    <PageShell title="Settings">
      {groups.map(([title, items]) => (
        <IonList key={title} inset>
          <IonListHeader><IonLabel>{title}</IonLabel></IonListHeader>
          {items.map(([label, href]) => (
            <IonItem key={href} routerLink={href} detail><IonLabel>{label}</IonLabel></IonItem>
          ))}
        </IonList>
      ))}
    </PageShell>
  );
}
