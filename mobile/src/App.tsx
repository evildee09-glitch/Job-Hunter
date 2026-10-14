import { IonApp, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './data/queryClient';
import TabsShell from './navigation/TabsShell';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';
import './theme/variables.css';

setupIonicReact();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <IonApp>
        <IonReactRouter>
          <TabsShell />
        </IonReactRouter>
      </IonApp>
    </QueryClientProvider>
  );
}
