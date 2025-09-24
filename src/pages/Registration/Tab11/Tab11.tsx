import { IonAlert, IonContent, IonPage } from "@ionic/react";
import Header from "../../../components/Header";
import SmokingTobacco from "./SmokingTobacco";
import ChewingTobacco from "./ChewingTobacco";
import ChewingWithoutTobacco from "./ChewingWithoutTobacco";
import Alcohol from "./Alcohol";
import { Button } from "primereact/button";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import { initialState, populateWithBackend, TOBACCO_ALCOHOL_CONSUMPION } from "./data";
import { useSQLite } from "../../../utils/Sqlite";



export default function Tab11() {
    const [alert, setAlert] = useState({
        show: false,
        header: "",
        message: "",
    });
    const location = useLocation();
    const [id, setId] = useState<string>('');
    const [editFlag, setEditFlag] = useState(false);
    const searchParams = new URLSearchParams(location.search);
    useEffect(() => {
        setId(searchParams?.get('id') || '');
        setEditFlag(searchParams?.get('edit') === 'YES');
    }, [location.pathname])
    const { db, sqlite } = useSQLite();
    const [data, setData] = useState<initialState[]>([]);
    useEffect(() => {
        async function fetchInitialData() {
            try {
                const res = await db?.query(`
                        select * from TOBACCO_ALCOHOL_CONSUMPTION where user_id = '${id}'
                    `)
                const values = res?.values as TOBACCO_ALCOHOL_CONSUMPION[];
                console.log(res)
                const result = populateWithBackend(values, id);
                setData(result);
            } catch (error) {
                console.log(error);
            }
        }
        fetchInitialData();
    }, [db, location.pathname])
    return (
        <IonPage>
            <Header title={0 ? "Edit Tobacco and Alcohol Consumption" :
                "Tobacco and Alcohol Consumption"} />
            <IonContent class='' fullscreen>
                <main className="p-2 space-y-20">
                    <Accordion className="space-y-2 outline-none" activeIndex={0}>
                        <AccordionTab className="border-1 rounded  border-slate-200" header="Smoking tobacco" >
                            <SmokingTobacco data={data?.[0]} />
                        </AccordionTab>
                        <AccordionTab className="border-1 rounded  border-slate-200" header="Chewing tobacco" >
                            <ChewingTobacco data={data?.[1]} />
                        </AccordionTab>
                        <AccordionTab className="border-1 rounded  border-slate-200" header="Chewing without tobacco" >
                            <ChewingWithoutTobacco data={data?.[2]} />
                        </AccordionTab>
                        <AccordionTab className="border-1 rounded  border-slate-200" header="Alcohol" >
                            <Alcohol data={data?.[3]} user_id={id} setData={setData} />
                        </AccordionTab>
                    </Accordion>

                </main>
                <IonAlert
                    isOpen={alert.show}
                    onDidDismiss={() => setAlert((a) => ({ ...a, show: false }))}
                    header={alert.header}
                    message={alert.message}
                    buttons={["OK"]}
                />
                <div className="pt-10 pb-2 px-2 flex justify-end gap-2">
                    <Link
                        to={'/tab10'}
                    >
                        <Button className='px-10 py-2 rounded' label='PREV' />
                    </Link>
                    <Link
                        to={'/tab12'}
                    >
                        <Button className='px-10 py-2 rounded' label='NEXT' />
                    </Link>
                </div>

            </IonContent>
        </IonPage>
    )
}
