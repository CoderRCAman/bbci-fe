import { IonAlert, IonContent, IonPage } from "@ionic/react";
import Header from "../../../components/Header";
import { useEffect, useState } from "react";
import { useSQLite } from "../../../utils/Sqlite";
import { useLocation } from "react-router";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";

export default function EndoPage3() {
    const location = useLocation();
    const [videoFileName, setVideoFileName] = useState('')
    const [pdfFileName, setPdfFileName] = useState('')
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
        const endoIdd = searchParams.get('endoId') || ''
        setId(curId);
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
                const val = res2?.values?.[0];
                console.log(val)
                setVideoFileName(val?.endoscopy_video_filename || '');
                setPdfFileName(val?.endoscopy_pdf_filename || '');
            } catch (error) {
                console.log(error);
            }
        }
        fetchCurrentUser();
    }, [location.pathname, db])
    const AddMediaReportFilenames = async () => {
        try {
            console.log(videoFileName)
            if (!videoFileName?.trim() && !pdfFileName?.trim()) {
                setAlert({
                    header: 'Error',
                    message: 'Missing video or pdf report!',
                    show: true
                })
                return;
            }
            const query = `
                UPDATE ENDOSCOPY SET endoscopy_video_filename = '${videoFileName}' , 
                endoscopy_pdf_filename = '${pdfFileName}' 
                WHERE id = '${endoId}';
            `
            await db?.execute(query);
            await sqlite?.saveToStore('patientdb');
            setAlert({
                header: 'Success',
                message: 'Endoscopy report updated successfully!',
                show: true
            })
        } catch (error) {
            console.log(error);
        }
    }
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
                                        value={videoFileName}
                                        className="border-1 p-2 w-[400px]"
                                        onChange={e => setVideoFileName(e.target.value)}
                                    />
                                    <label>Endoscopy video footage filename</label>
                                </FloatLabel>
                                <FloatLabel>
                                    <InputText
                                        value={pdfFileName}
                                        className="border-1 p-2 w-[400px]"
                                        onChange={e => setPdfFileName(e.target.value)}
                                    />
                                    <label>Endoscopy pdf     footage filename</label>
                                </FloatLabel>
                            </div>
                            <Button
                                label="SAVE"
                                severity="success"
                                className="px-10 py-2 mt-2 rounded-full"
                                onClick={() => AddMediaReportFilenames()}
                            />
                        </div>
                        <div className="flex justify-end mt-2">
                            <Link to={`/endo2?id=${id}&endoId=${endoId}`}>
                                <Button label="PREV" className="px-10 py-2 rounded" />
                            </Link>
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
