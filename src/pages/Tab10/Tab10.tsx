import { IonAlert, IonContent, IonPage } from "@ionic/react";
import Header from "../../components/Header";
import { Link, useLocation } from "react-router-dom";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";

export default function Tab10() {
    const location = useLocation();
    const [id, setId] = useState<string | null>('');
    const [editFlag, setEditFlag] = useState(false);
    const searchParams = new URLSearchParams(location.search);
    const [alert, setAlert] = useState({
        show: false,
        header: "",
        message: "",
    });

    useEffect(() => {
        setId(searchParams?.get('id'));
        setEditFlag(searchParams?.get('edit') === 'YES');
    }, [location.pathname])


    return (
        <IonPage>
            <Header title={0 ? "Edit Food Recall" : "Food Recall"} />
            <IonContent class='' fullscreen>
                <main className="p-2">
                    <IonAlert
                        isOpen={alert.show}
                        onDidDismiss={() => setAlert((a) => ({ ...a, show: false }))}
                        header={alert.header}
                        message={alert.message}
                        buttons={["OK"]}
                    />
                    <div className='flex justify-end pb-5 pr-2'>
                        <Link to={`/tab11?id=someid&edit=no`}>
                            <Button label='NEXT' className='px-10 py-2' />
                        </Link>

                    </div>
                </main>

            </IonContent>
        </IonPage>
    )
}
