import { IonContent, IonPage } from "@ionic/react";
import Header from "../../components/Header";
import { useLocation } from "react-router";
import { useEffect, useState } from "react";
import data from "./data.json"
import PMHInput from "./PMHInput";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";
export interface PERSONAL_MEDICAL_HISTORY {
    condition: string,
    condition_status: number,
    age_first_diagnosis?: number,
    year_of_first_diagnosis?: string,
    treatment_received?: number,
    mode_of_treatment?: string,
    mode_of_diagnosis?: string
    user_id?:string
}
export default function Tab6() {
    const location = useLocation();
    const [id, setId] = useState<string | null>('');
    const [editFlag, setEditFlag] = useState(false);
    const searchParams = new URLSearchParams(location.search);
    useEffect(() => {
        setId(searchParams?.get('id'));
        setEditFlag(searchParams?.get('edit') === 'YES');
    }, [location.pathname])

    return (
        <div>
            <IonPage>
                <Header title={0 ? "Edit Personal Medical History" : "Personal Medical History"} />
                <IonContent class='' fullscreen>
                    <main className="p-2 space-y-2">
                        {
                            data.map((d, index) => (

                                <PMHInput
                                    condition={d.condition}
                                    mode_of_diagnosis={d.mode_of_diagnosis}
                                    mode_of_treatment={d.mode_of_treatment}
                                    key={index}
                                />

                            ))
                        }
                        <div className='flex justify-end gap-2 '>
                            <Button className='px-10 py-2' label='SAVE' severity='success' />
                            <Link 
                             to={'/tab7'}
                            >
                                <Button className='px-10 py-2' label='NEXT' />
                            </Link>
                        </div>
                    </main>
                </IonContent>
            </IonPage>
        </div>
    )
}
