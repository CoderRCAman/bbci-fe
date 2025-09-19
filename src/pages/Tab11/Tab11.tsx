import { IonAlert, IonContent, IonPage } from "@ionic/react";
import Header from "../../components/Header";
import SmokingTobacco from "./SmokingTobacco";
import ChewingTobacco from "./ChewingTobacco";
import ChewingWithoutTobacco from "./ChewingWithoutTobacco";
import Alcohol from "./Alcohol";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";

export interface TOBACCO_ALCOHOL_CONSUMPION {
    id: string,
    user_id: string,
    type: 'smoking_tobacco' | 'chewing_tobacco' | 'chewing_without_tobacco' | 'alcohol',
    product?: string,
    consumes?: number,
    from_age?: number,
    to_age?: number,
    number_per_day?: number,
    days_in_week?: number,
    duration_placement_hr?: number,
    duration_placement_min?: number,
    site_of_placement_L?: number, //0 or 1 
    site_of_placement_R?: number, //0 or 1 
    site_of_placement_F?: number, //0 or 1 
    site_of_placement_NA?: number, //0 or 1 
    without_tobacco?: number // 0 or 1 
    consumption_unit_per_day?: number // for alcohol

}
export default function Tab11() {
    const [alert, setAlert] = useState({
        show: false,
        header: "",
        message: "",
    });

    return (
        <IonPage>
            <Header title={0 ? "Edit Tobacco and Alcohol Consumption" :
                "Tobacco and Alcohol Consumption"} />
            <IonContent class='' fullscreen>
                <main className="p-2 space-y-20">
                    <Accordion className="space-y-2 outline-none" activeIndex={0}>
                        <AccordionTab className="border-1 rounded  border-slate-200" header="Smoking tobacco" >
                            <SmokingTobacco />
                        </AccordionTab>
                        <AccordionTab className="border-1 rounded  border-slate-200" header="Chewing tobacco" >
                            <ChewingTobacco />
                        </AccordionTab>
                        <AccordionTab className="border-1 rounded  border-slate-200" header="Chewing without tobacco" >
                            <ChewingWithoutTobacco />
                        </AccordionTab>
                        <AccordionTab className="border-1 rounded  border-slate-200" header="Alcohol" >
                            <Alcohol />
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
