import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, square, triangle } from 'ionicons/icons';
import Tab1 from './pages/Tab1/Tab1';
import Tab2 from './pages/Tab2/Tab2';
import Tab3 from './pages/Tab3/Tab3';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import Sidebar from './components/Sidebar';
import { useEffect } from 'react';
import { SQLiteProvider } from './utils/Sqlite';
import Tab4 from './pages/Tab4/Tab4';
import Tab5 from './pages/Tab5/Tab5';

setupIonicReact();

const App: React.FC = () => {
  return (
    <SQLiteProvider >
      <IonApp>
        <IonReactRouter>
          <Sidebar />
          <IonTabs>
            <IonRouterOutlet>
              <Route exact path="/tab1">
                <Tab1 />
              </Route>
              <Route exact path="/tab2">
                <Tab2 />
              </Route>
              <Route path="/tab3">
                <Tab3 />
              </Route>
              <Route exact path="/">
                <Redirect to="/tab1" />
              </Route>
              <Route path="/tab4">
                <Tab4 />
              </Route>
              <Route path="/tab5">
                <Tab5 />
              </Route>
            </IonRouterOutlet>

          </IonTabs>
        </IonReactRouter>
      </IonApp>
    </SQLiteProvider>
  )
}



export default App;
