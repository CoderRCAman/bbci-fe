import { IonContent, IonPage } from "@ionic/react";
import Header from "../../../components/Header";
import { Button } from "primereact/button";
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
export default function EndoPage2() {
    const [barcodeData, setBarCodeData] = useState('');
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const [id, setId] = useState('');
    useEffect(() => {
        setId(searchParams.get('id') || '')
    }, [location.pathname])
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
    return (
        <>
            <IonPage>
                <Header title={"Collect Vial "} />
                <IonContent class='' fullscreen>
                    <main className="p-2">
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
                                />
                            </div>
                        </div>
                        <div className="mt-10 flex gap-2 ">
                            <Link to='/endo1'>
                                <Button
                                    label="PREV"
                                    className="px-5 py-2 rounded"
                                />
                            </Link>

                            <Link to={`/endo3?id=${id}`}>
                                <Button
                                    label="NEXT"
                                    className="px-5 py-2 rounded"
                                />
                            </Link>

                        </div>
                    </main>
                </IonContent>
            </IonPage>
        </>
    )
}
