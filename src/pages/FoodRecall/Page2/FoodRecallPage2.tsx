import { IonContent, IonPage } from '@ionic/react'
import React from 'react'
import Header from '../../../components/Header'

export default function FoodRecallPage2() {
    return (
        <>
            <IonPage>
                <Header title={"Collect Recalls"} />
                <IonContent class='' fullscreen>
                    <h1 className="text-slate-600 font-semibold">Food Record Form</h1>
                </IonContent>
            </IonPage>
        </>
    )
}
