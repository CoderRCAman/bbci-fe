import { IonAlert, IonContent, IonPage } from "@ionic/react";
import Header from "../../components/Header";
import { Link, useLocation } from "react-router-dom";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";

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

    // ye mene dala comment

    return (
        <IonPage>
            <Header title={0 ? "Edit Food Recall" : "Food Recall"} />
            <IonContent class='' fullscreen>
                <main className="p-2">
                    <div className="border p-2 rounded-md">
                        <div>
                            <Dropdown
                                optionLabel="name"
                                optionValue="value"
                                className="border-1"
                                placeholder="Are you vegeterian or non-vegeterian"
                                options={[
                                    { name: "Veg", value: "1" },
                                    { name: "Non-Veg", value: "2" },
                                ]}
                            />
                        </div>
                    </div>


                    <IonAlert
                        isOpen={alert.show}
                        onDidDismiss={() => setAlert((a) => ({ ...a, show: false }))}
                        header={alert.header}
                        message={alert.message}
                        buttons={["OK"]}
                    />
                    <div className="pt-10 flex justify-end gap-2">
                        <Link
                            to={'/tab9'}
                        >
                            <Button className='px-10 py-2 rounded' label='PREV' />
                        </Link>
                        <Link
                            to={'/tab11'}
                        >
                            <Button className='px-10 py-2 rounded' label='NEXT' />
                        </Link>
                    </div>
                </main>

            </IonContent>
        </IonPage>
    )
}
