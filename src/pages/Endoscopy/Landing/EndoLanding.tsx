import React from 'react';
import { 
  IonContent, 
  IonPage, 
  IonButton, 
  IonGrid, 
  IonRow, 
  IonCol, 
  IonText, 
  IonIcon,
  IonCard,
  IonCardContent
} from '@ionic/react';
import { addCircleOutline, syncOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import Header from '../../../components/Header';

export default function EndoscopyLanding() {
  const history = useHistory();

  return (
    <IonPage>
      <style>{`
        .bordered-card {
          border: 2px solid #e0e0e0; /* Strong structural border */
          background: #ffffff;
          margin-bottom: 24px;
          border-radius: 16px;
          box-shadow: none;
        }
        .icon-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px auto;
          border: 1px solid #f0f0f0;
        }
      `}</style>

      <IonContent fullscreen className="ion-padding" style={{ '--background': '#f8f9fa' }}>
        <Header title='Endoscopy'/>
        
        {/* Main Grid: Centers the column vertically and horizontally */}
        <IonGrid style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
          <IonRow className="ion-justify-content-center" style={{ width: '100%' }}>
            
            {/* Constrained width for the centered "Mobile Menu" look */}
            <IonCol size="12" sizeSm="8" sizeMd="6" sizeLg="5" sizeXl="4">
            

              {/* OPTION 1: NEW ENDOSCOPY */}
              <IonCard mode="ios" className="bordered-card">
                <IonCardContent className="ion-text-center" style={{ padding: '32px 24px' }}>
                  
                  {/* Icon */}
                  <div className="icon-circle" style={{ background: '#F0F4FF' }}>
                    <IonIcon icon={addCircleOutline} color="primary" style={{ fontSize: '32px' }} />
                  </div>

                  {/* Title */}
                  <h2 style={{ fontWeight: '700', fontSize: '20px', color: '#222', marginBottom: '12px' }}>
                    New Procedure
                  </h2>

                  {/* Descriptive Text */}
                  <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', marginBottom: '24px' }}>
                    Start here to document a <strong>new endoscopy</strong> procedure. This will open a blank form for patient details and initial findings.
                  </p>

                  {/* Button */}
                  <IonButton 
                    expand="block" 
                    shape="round" 
                    color="primary"
                    onClick={() => history.push('/new-endo')}
                    style={{ fontWeight: '600', height: '48px' }}
                  >
                    Start New Entry
                  </IonButton>

                </IonCardContent>
              </IonCard>

              {/* OPTION 2: UPDATE EXISTING */}
              <IonCard mode="ios" className="bordered-card">
                <IonCardContent className="ion-text-center" style={{ padding: '32px 24px' }}>
                  
                  {/* Icon */}
                  <div className="icon-circle" style={{ background: '#F0FDF4' }}>
                    <IonIcon icon={syncOutline} color="success" style={{ fontSize: '32px' }} />
                  </div>

                  {/* Title */}
                  <h2 style={{ fontWeight: '700', fontSize: '20px', color: '#222', marginBottom: '12px' }}>
                    Update Report
                  </h2>

                  {/* Descriptive Text */}
                  <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', marginBottom: '24px' }}>
                    Use this to edit notes for an endoscopy that has already been performed and registered.
                  </p>

                  {/* Button */}
                  <IonButton 
                    expand="block" 
                    shape="round" 
                    color="success" 
                    fill="outline"
                    onClick={() => history.push('/update-endo')}
                    style={{ fontWeight: '600', height: '48px', borderWidth: '2px' }}
                  >
                    Update Existing
                  </IonButton>

                </IonCardContent>
              </IonCard>

            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
}