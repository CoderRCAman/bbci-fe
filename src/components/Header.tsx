import { IonButtons, IonHeader, IonMenuButton, IonTitle, IonToolbar } from '@ionic/react'
import React from 'react'

export default function Header({ title }: { title: string }) {
    return (
        <IonHeader>
            <IonToolbar >
                <IonButtons slot="start">
                    <IonMenuButton></IonMenuButton>
                </IonButtons>
                <IonTitle>
                    <div className='flex justify-between items-center'>
                        {title}
                    </div>
                </IonTitle>

            </IonToolbar>
        </IonHeader>
    )
}
