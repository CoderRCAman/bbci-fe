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

export default function BloodLanding() {
  const history = useHistory();

  return (
    <IonPage>
      <style>{`
        .bordered-card {
          border: 2px solid #e0e0e0; /* Stronger border as requested */
          background: #ffffff;
          margin-bottom: 24px;
          border-radius: 16px;
          box-shadow: none; /* Removing shadow to emphasize the border look */
        }
        .icon-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px auto;
          border: 1px solid #f0f0f0; /* Subtle border around the icon too */
        }
      `}</style>

      <IonContent fullscreen className="ion-padding" style={{ '--background': '#f8f9fa' }}>
        <Header title='Blood Test'/>
        
        {/* Main Grid: Centers the column vertically and horizontally */}
        <IonGrid style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
          <IonRow className="ion-justify-content-center" style={{ width: '100%' }}>
            
            {/* Constrained width so it looks like a nice menu on desktop */}
            <IonCol size="12" sizeSm="8" sizeMd="6" sizeLg="5" sizeXl="4">
            

              {/* OPTION 1: NEW ENTRY */}
              <IonCard mode="ios" className="bordered-card">
                <IonCardContent className="ion-text-center" style={{ padding: '32px 24px' }}>
                  
                  {/* Icon */}
                  <div className="icon-circle" style={{ background: '#F0F4FF' }}>
                    <IonIcon icon={addCircleOutline} color="primary" style={{ fontSize: '32px' }} />
                  </div>

                  {/* Title */}
                  <h2 style={{ fontWeight: '700', fontSize: '20px', color: '#222', marginBottom: '12px' }}>
                    Register New Test
                  </h2>

                  {/* Descriptive Text */}
                  <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', marginBottom: '24px' }}>
                    Click this button if you are creating a <strong>brand new</strong> blood test record for a patient. This will start a blank entry form.
                  </p>

                  {/* Button */}
                  <IonButton 
                    expand="block" 
                    shape="round" 
                    color="primary"
                    onClick={() => history.push('/new-blood-test')}
                    style={{ fontWeight: '600', height: '48px' }}
                  >
                    Create New Entry
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
                    Update Existing Record
                  </h2>

                  {/* Descriptive Text */}
                  <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', marginBottom: '24px' }}>
                    Use this option if you need to <strong>modify</strong> or add results to a blood test report that has already been created in the system.
                  </p>

                  {/* Button */}
                  <IonButton 
                    expand="block" 
                    shape="round" 
                    color="success" 
                    fill="outline"
                    onClick={() => history.push('/update-blood-test')}
                    style={{ fontWeight: '600', height: '48px', borderWidth: '2px' }}
                  >
                    Update Report
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