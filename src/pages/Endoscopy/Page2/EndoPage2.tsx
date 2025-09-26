import { IonAlert, IonContent, IonPage } from "@ionic/react";
import Header from "../../../components/Header";
import { Button } from "primereact/button";
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSQLite } from "../../../utils/Sqlite";
import ShortUUID from 'short-uuid';
import { format } from "date-fns";
export default function EndoPage2() {
    const [barcodeData, setBarCodeData] = useState('');
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const [id, setId] = useState('');
    const { db, sqlite } = useSQLite();
    const [participant, setParticipants] = useState<any | null>(null);
    const [endoId, setEndoId] = useState('');

    const [alert, setAlert] = useState({
        show: false,
        header: "",
        message: "",
    });

    useEffect(() => {
        const curId = searchParams.get('id') || ''
        setId(curId);
        const endoIdd = searchParams.get('endoId') || ''
        setEndoId(searchParams.get('endoId') || '')
        async function fetchCurrentUser() {
            try {
                const query = `
                    select * from patients where id = '${curId}'
                `
                const query2 = `
                 select * from endoscopy where id = '${endoIdd}'
                `
                const res = await db?.query(query);
                const res2 = await db?.query(query2);
                setParticipants(res?.values?.[0]);
                setBarCodeData(res2?.values?.[0]?.vial_code);
                console.log(res2)
            } catch (error) {
                console.log(error);
            }
        }
        fetchCurrentUser();
    }, [location.pathname, db])
    useEffect(() => {
        let buffer = '';
        const keydown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                console.log('Scanned:', buffer);
                setBarCodeData(buffer);
                buffer = '';
            }
            else {
                buffer += e.key;
            }
        }
        document.addEventListener('keydown', keydown);
        return () => document.removeEventListener('keydown', keydown);
    }, [location.pathname])
    const handleSaveEndocode = async () => {
        try {
            if (!barcodeData) {
                setAlert({
                    header: 'Error',
                    message: 'Barcode data is missing!',
                    show: true
                })
                return;
            }

            const translator = ShortUUID();
            const uid = translator.generate();
            const query = `
                    INSERT INTO ENDOSCOPY (id , vial_code , user_id , date) 
                    values ('${uid}' , '${barcodeData}' , '${id}' , '${format(new Date(), 'yyyy-dd-MM')}') 
                `
            await db?.execute(query);
            await sqlite?.saveToStore('patientdb');
            setEndoId(uid);
            setAlert({
                header: 'Success',
                message: 'Vial linked successfully!',
                show: true
            })

        } catch (error) {
            console.log(error);
        }
    }
    return (
        <>
            <IonPage>
                <Header title={"Collect Endoscopy Vial "} />
                <IonContent class='' fullscreen>
                    <main className="p-2 space-y-10">

                        <div className="p-2 border rounded text-slate-600">
                            <p className="text-lg  font-semibold">Participant's details</p>
                            <div>
                                <span className="font-semibold">ID: </span> <span>{participant?.id}</span>
                            </div>
                            <div>
                                <span className="font-semibold">Name: </span> <span>{participant?.name}</span>
                            </div>
                        </div>
                        <div className="border rounded p-2">
                            <h1 className="my-5 text-slate-500 font-semibold ">Collect Vial Data</h1>
                            <div className="">
                                <div className="flex gap-2">
                                    <input type="text" autoFocus className="hidden" />
                                    <p className="text-sm w-[300px] text-slate-500 p-2 border rounded">
                                        {
                                            barcodeData || 'YOUR BARCODE WILL SHOW UP HERE'
                                        }

                                    </p>
                                    <Button
                                        label="Save"
                                        className="rounded px-2"
                                        severity="help"
                                        onClick={() => handleSaveEndocode()}
                                    />
                                </div>
                            </div>
                        </div>


                        <div className="mt-10 flex justify-end gap-2 ">
                            <Link to='/endo1'>
                                <Button
                                    label="PREV"
                                    className="px-5 py-2 rounded"
                                />
                            </Link>
                            {
                                endoId &&
                                <Link to={`/endo3?id=${id}&endoId=${endoId}`}>
                                    <Button
                                        label="NEXT"
                                        className="px-5 py-2 rounded"
                                    />
                                </Link>
                            }


                        </div>
                    </main>
                    <IonAlert
                        isOpen={alert.show}
                        onDidDismiss={() => setAlert((a) => ({ ...a, show: false }))}
                        header={alert.header}
                        message={alert.message}
                        buttons={["OK"]}
                    />
                </IonContent>
            </IonPage>
        </>
    )
}
