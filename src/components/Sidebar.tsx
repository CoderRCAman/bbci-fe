import { IonButtons, IonContent, IonHeader, IonMenu, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react'
import "./Sidebar.css"
import { Link } from 'react-router-dom';
export default function Sidebar() {
    return (
        <>
            <IonMenu
                contentId="main-content">
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>BBCI</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    <ul>
                        <li>
                            <Link
                                to={{
                                    pathname: '/tab1',
                                    search: ''
                                }}
                            >
                                Add new patient
                            </Link>
                        </li>
                        <li>

                            <Link
                                to={'/tab2'}
                            >
                                Patient list
                            </Link>

                        </li>
                        <li>
                            <Link to={'/tab3'}>
                                Synch To Database
                            </Link>
                        </li>
                    </ul>
                </IonContent>
            </IonMenu>
            <IonPage id="main-content">
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonMenuButton></IonMenuButton>
                        </IonButtons>
                        <IonTitle>Menu</IonTitle>
                    </IonToolbar>
                </IonHeader>

            </IonPage>
        </>
    );
}
