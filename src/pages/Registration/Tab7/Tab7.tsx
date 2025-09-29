import { IonContent, IonPage } from "@ionic/react";
import Header from "../../../components/Header";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "primereact/button";
import FamilyTree from "./FamilyTree";


export default function Tab7() {
    const [id, setId] = useState<string | null>('');
    const [editFlag, setEditFlag] = useState(false);
    const searchParams = new URLSearchParams(location.search);

    useEffect(() => {
        setId(searchParams?.get('id'));
        setEditFlag(searchParams?.get('edit') === 'YES');
    }, [location.pathname])

    return (
        <IonPage>
            <Header title={0 ? "Edit Family History of Cancer" : "Family History of Cancer"} />
            <IonContent class='' fullscreen>
                <main className="p-2">
                    <h1 className="text-center">WORK IN PROGRESS</h1>
                    <div className='flex justify-end gap-2 '>

                        <Button className='px-10 py-2' label='SAVE' severity='success' />

                    </div>
                    <div className="pt-10 flex justify-end gap-2">
                        <Link
                            to={'/tab6'}
                        >
                            <Button className='px-10 py-2 rounded' label='PREV' />
                        </Link>
                        <Link
                            to={'/tab8'}
                        >
                            <Button className='px-10 py-2 rounded' label='NEXT' />
                        </Link>
                    </div>
                </main>

            </IonContent>
        </IonPage>
    )
}
