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
import Tab1 from './pages/Registration/Tab1/Tab1';
import Tab2 from './pages/Registration/Tab2/Tab2';
import Tab3 from './pages/Registration/Tab3/Tab3';

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
import Tab4 from './pages/Registration/Tab4/Tab4';
import Tab5 from './pages/Registration/Tab5/Tab5';
import Tab6 from './pages/Registration/Tab6/Tab6';
import Tab7 from './pages/Registration/Tab7/Tab7';
import Tab8 from './pages/Registration/Tab8/Tab8';
import Tab9 from './pages/Registration/Tab9/Tab9';
import Tab10 from './pages/Registration/Tab10/Tab10';
import Tab11 from './pages/Registration/Tab11/Tab11';
import Tab12 from './pages/Registration/Tab12/Tab12';
import EndoPage1 from './pages/Endoscopy/Page1/EndoPage1';
import EndoPage2 from './pages/Endoscopy/Page2/EndoPage2';

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
              <Route path="/tab6">
                <Tab6 />
              </Route>
              <Route path="/tab7">
                <Tab7 />
              </Route>
              <Route path="/tab8">
                <Tab8 />
              </Route>
              <Route path="/tab9">
                <Tab9 />
              </Route>
              <Route path="/tab10">
                <Tab10 />
              </Route>
              <Route path="/tab11">
                <Tab11 />
              </Route>
              <Route path="/tab12">
                <Tab12 />
              </Route>

              {/* ENDOSCOPY PAGES STARTS FROM HERE  */}
              <Route path="/endo1">
                <EndoPage1 />
              </Route>
              <Route path="/endo2">
                <EndoPage2 />
              </Route>

            </IonRouterOutlet>

          </IonTabs>
        </IonReactRouter>
      </IonApp>
    </SQLiteProvider>
  )
}



export default App;
