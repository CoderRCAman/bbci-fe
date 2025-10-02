import {
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonMenu,
    IonMenuButton,
    IonMenuToggle,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    personAddOutline,
    listOutline,
    medkitOutline,
    cameraOutline,
    syncOutline,
    fastFoodOutline
} from 'ionicons/icons';
import { useSQLite } from '../utils/Sqlite';

// Define the menu items in an array for easier management
const menuItems = [
    { text: 'Registration', path: '/tab1', icon: personAddOutline },
    { text: 'Participants list', path: '/tab2', icon: listOutline },
    { text: 'Blood Test / Physical', path: '/blood1', icon: medkitOutline },
    { text: 'Endoscopy', path: '/endo1', icon: cameraOutline },
    { text: 'Food Recall', path: '/food1', icon: fastFoodOutline },
    { text: 'Synch To Database', path: '/tab3', icon: syncOutline },
];

export default function Sidebar() {
    const {curTab,setCurTab} = useSQLite() ; 
    return (
        <>
            <IonMenu contentId="main-content" className="font-sans">
                <IonHeader>
                    {/* Sidebar Header */}
                    <IonToolbar >
                        <IonTitle className="font-bold text-slate-600">BBCI</IonTitle>
                    </IonToolbar>
                </IonHeader>

                <IonContent className="ion-padding [--background:theme(colors.slate.900)]">
                    <div className="flex flex-col space-y-2">
                        {menuItems.map((item, index) => {
                            // Determine if the current link is active
                            const isActive = item.path === curTab ;
                            
                            return (
                                <IonMenuToggle key={index} autoHide={true}>
                                    <Link 
                                        onClick={()=>setCurTab(item.path)}
                                        to={item.path}
                                        className={`
                                            flex items-center p-3  text-base
                                            transition-colors duration-200
                                            ${
                                                isActive
                                                    ? 'bg-blue-600 text-white font-semibold shadow-md'
                                                    : 'text-gray-500 hover:bg-slate-700 hover:text-white'
                                            }
                                        `}
                                    >
                                        <IonIcon icon={item.icon} slot="start" className="mr-4 text-xl" />
                                        {item.text}
                                    </Link>
                                </IonMenuToggle>
                            );
                        })}
                    </div>
                </IonContent>
            </IonMenu>

            {/* Main Page Content Area */}
            <IonPage id="main-content">
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonMenuButton />
                        </IonButtons>
                        <IonTitle>
                            <h1 className='font-semibold text-slate-400'>BBCI</h1>
                        </IonTitle>
                    </IonToolbar>
                </IonHeader>
            </IonPage>
        </>
    );
}