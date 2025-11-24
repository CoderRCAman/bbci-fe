import { IonButtons, IonHeader, IonMenuButton, IonTitle, IonToolbar } from '@ionic/react'
import React from 'react'
import { useSQLite } from '../utils/Sqlite'
import { Tag } from 'primereact/tag';

export default function Header({ title }: { title: string }) {
    const { tabId } = useSQLite();
    return (
        <IonHeader  style={{ "--padding-top": "20px" }} >
            <IonToolbar >
                <IonButtons slot="start">
                    <IonMenuButton></IonMenuButton>
                </IonButtons>
                <IonTitle>
                    <div className='flex justify-between items-center'>
                        <p>
                            {title}
                        </p>
                        <div className='text-slate-600 flex  items-center gap-1 p-2 rounded border-1 border-cyan-300'>
                            <p className='text-sm font-semibold'>Your Tab Id:</p>
                            <Tag value={tabId}></Tag>
                        </div>
                    </div>
                </IonTitle>

            </IonToolbar>
        </IonHeader>
    )
}
