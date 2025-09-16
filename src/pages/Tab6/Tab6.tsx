import { IonContent, IonPage } from "@ionic/react";
import Header from "../../components/Header";
import { useLocation } from "react-router";
import { useEffect, useState } from "react";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
export interface PERSONAL_MEDICAL_HISTORY {
    condition: string,
    condition_status: number,
    age_first_diagnosis?: number,
    year_of_first_diagnosis?: string,
    treatment_received?: number,
    mode_of_treatment?: string,
    mode_of_diagnosis?: string
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
                    <main className="p-2">
                        <div className="border rounded-md p-2 shadow">
                            <div className="space-y-7">
                                <h1 className="font-semibold text-slate-500 text-lg">Diabetes</h1>
                                <div className="flex gap-4 items-center  text-md">
                                    <div className="space-x-2">
                                        <input type="radio" name="condition_status" value={1} />
                                        <span>YES </span>
                                    </div>
                                    <div className="space-x-2">
                                        <input type="radio" name="condition_status" value={2} />
                                        <span>NO </span>
                                    </div>
                                    <div className="space-x-2">
                                        <input type="radio" name="condition_status" value={2} />
                                        <span>DON'T KNOW </span>
                                    </div>
                                    <div className="space-x-2">
                                        <input type="radio" name="condition_status" value={2} />
                                        <span>REFUSED TO ANSWER</span>
                                    </div>

                                </div>
                                <div >
                                    <FloatLabel>
                                        <InputText
                                            keyfilter="int"
                                            className="border-1 p-2"
                                        />
                                        <label>Age at first diagnosis</label>
                                    </FloatLabel>

                                </div>
                                <div >
                                    <FloatLabel>
                                        <InputText
                                            className="border-1 p-2"
                                        />
                                        <label>Year of first diagnosis</label>
                                    </FloatLabel>

                                </div>
                                <div>
                                    <Dropdown
                                        optionLabel="name"
                                        optionValue="value"
                                        className="border-1"
                                        placeholder="Treatment Received"
                                        options={[
                                            { name: "YES", value: "1" },
                                            { name: "NO", value: "2" },
                                            { name: "DON'T KNOW", value: "8" },
                                            { name: "REFUSED TO ANSWER", value: "8" }
                                        ]}
                                    />
                                </div>
                            </div>


                        </div>
                    </main>
                </IonContent>
            </IonPage>
        </div>
    )
}
