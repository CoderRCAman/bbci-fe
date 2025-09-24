import { IonAlert, IonContent, IonPage } from "@ionic/react";
import Header from "../../../components/Header";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import DemoInput from "./DemoInput";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";

const data = [
    {
        type: 'Regligion',
        data: ['Hindi', 'Jain', 'Christian', 'Muslim', 'Parsi', 'Jain', 'Buddhist', 'Other']
    },
    {
        type: 'Marital status',
        data: ['Unmarried', 'Married', 'Widowed', 'Divorce/seperated', 'Other']
    },
    {
        type: 'Highest level of education received by the subject',
        data: ['Nil, illiterate', 'Literate', 'Below Primary', '1st to 4th std', '5th - 8th std', '9th - 10th std', '11th - 12th', 'Graduate and above', "Dont't know"]
    },
    {
        type: 'Highest level of education received by the spouse',
        data: ['Nil, illiterate', 'Literate', 'Below Primary', '1st to 4th std', '5th - 8th std', '9th - 10th std', '11th - 12th', 'Graduate and above', "Dont't know"]
    },
    {
        type: 'What is your household income',
        data: ['Less than 5,000', '5,000 - 14,999', '15000 - 24,999', '25,000 - 34,999', '35,000 - 44,999', '45,999 - 54,999', '55,000 or more', 'Does not know', "Deoes not want to disclose"]
    },

]

export default function Tab12() {
    const [alert, setAlert] = useState({
        show: false,
        header: "",
        message: "",
    });

    return (
        <IonPage>
            <Header title={0 ? "Edit Demographic Information" :
                "Demographic Information"} />
            <IonContent class='' fullscreen>
                <main className="p-2 space-y-5">
                    {
                        data.map((d, index) =>
                            <DemoInput
                                key={index}
                                item={d}
                            />
                        )

                    }
                    <div className="space-y-7 pt-3">
                        <div>
                            <FloatLabel>
                                <InputText
                                    className="border-1 p-2 w-[60%]"
                                />
                                <label>What is your mother tongue?</label>
                            </FloatLabel>
                        </div>
                        <div>
                            <FloatLabel>
                                <InputText
                                    className="border-1 p-2 w-[60%]"
                                />
                                <label>What is your place of birth?</label>
                            </FloatLabel>
                        </div>
                    </div>


                </main>
                <IonAlert
                    isOpen={alert.show}
                    onDidDismiss={() => setAlert((a) => ({ ...a, show: false }))}
                    header={alert.header}
                    message={alert.message}
                    buttons={["OK"]}
                />
                <div className="pt-10 pb-2 flex justify-end gap-2">
                    <Link
                        to={'/tab11'}
                    >
                        <Button className='px-10 py-2 rounded' label='PREV' />
                    </Link>

                </div>
            </IonContent>
        </IonPage>
    )
}
