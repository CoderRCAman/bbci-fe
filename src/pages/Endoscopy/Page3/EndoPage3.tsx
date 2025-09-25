import { IonContent, IonPage } from "@ionic/react";
import Header from "../../../components/Header";
import { useEffect, useState } from "react";
import { useSQLite } from "../../../utils/Sqlite";
import { useLocation } from "react-router";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

export default function EndoPage3() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const [id, setId] = useState('');
    const { db, sqlite } = useSQLite();
    const [participant, setParticipants] = useState<any | null>(null);
    useEffect(() => {
        const curId = searchParams.get('id') || ''
        setId(curId);
        async function fetchCurrentUser() {
            try {
                const query = `
                        select * from patients where id = '${curId}'
                    `
                const res = await db?.query(query);
                setParticipants(res?.values?.[0]);

            } catch (error) {
                console.log(error);
            }
        }
        fetchCurrentUser();
    }, [location.pathname, db])
    return (
        <>
            <IonPage>
                <Header title={"Collect VIDEO report / PDF report"} />
                <IonContent class='' fullscreen>
                    <main className="p-2">
                        <div className="shadow p-2 border rounded text-slate-600">
                            <p className="text-lg  font-semibold">Participant's details</p>
                            <div>
                                <span className="font-semibold">ID: </span> <span>{participant?.id}</span>
                            </div>
                            <div>
                                <span className="font-semibold">Name: </span> <span>{participant?.name}</span>
                            </div>
                        </div>
                        <div className="mt-10 border shadow rounded p-2">
                            <div className="mt-5 space-y-7">
                                <FloatLabel>
                                    <InputText
                                        className="border-1 p-2 w-[400px]"
                                    />
                                    <label>Endoscopy video footage filename</label>
                                </FloatLabel>
                                <FloatLabel>
                                    <InputText
                                        className="border-1 p-2 w-[400px]"
                                    />
                                    <label>Endoscopy pdf footage filename</label>
                                </FloatLabel>
                            </div>
                            <Button
                                label="SAVE"
                                severity="success"
                                className="px-10 py-2 mt-2 rounded-full"
                            />
                        </div>
                    </main>
                </IonContent>
            </IonPage>
        </>
    )
}
