import { IonContent, IonPage } from "@ionic/react";
import Header from "../../../components/Header";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";

// dont create seperate table for this one!
export default function Tab8() {
    return (
        <div>
            <IonPage>
                <Header title={0 ? "Edit Anthropometry" : "Anthropometry"} />
                <IonContent class='' fullscreen>
                    <main className="p-2 space-y-5">
                        <div className="p-2 border rounded-md">
                            <p className="text-slate-500">Reading 1</p>
                            <div className="mt-5">
                                <FloatLabel>
                                    <InputNumber

                                        maxFractionDigits={2}
                                        minFractionDigits={2}
                                        className="p-2 border rounded"
                                    />
                                    <label>Height (in cm)</label>
                                </FloatLabel>

                            </div>
                            <div className="mt-5">
                                <FloatLabel>
                                    <InputNumber
                                        maxFractionDigits={2}
                                        minFractionDigits={2}
                                        className="p-2 border rounded"
                                    />
                                    <label>Weight (in kg)</label>
                                </FloatLabel>
                            </div>
                        </div>
                        <div className="p-2 border rounded-md">
                            <p className="text-slate-500">Reading 2</p>
                            <div className="mt-5">
                                <FloatLabel>
                                    <InputNumber
                                        disabled
                                        maxFractionDigits={2}
                                        minFractionDigits={2}
                                        className="p-2 border rounded"
                                    />
                                    <label>Height (in cm)</label>
                                </FloatLabel>

                            </div>
                            <div className="mt-5">
                                <FloatLabel>
                                    <InputNumber
                                        disabled
                                        maxFractionDigits={2}
                                        minFractionDigits={2}
                                        className="p-2 border rounded"
                                    />
                                    <label>Weight (in kg)</label>
                                </FloatLabel>
                            </div>
                        </div>
                        <div className='flex justify-end gap-2 mt-4 '>
                            <Button className='px-10 py-2' label='SAVE' severity='success' />

                        </div>
                        <div className="pt-10 flex justify-end gap-2">
                            <Link
                                to={'/tab7'}
                            >
                                <Button className='px-10 py-2 rounded' label='PREV' />
                            </Link>
                            <Link
                                to={'/tab9'}
                            >
                                <Button className='px-10 py-2 rounded' label='NEXT' />
                            </Link>
                        </div>
                    </main>
                </IonContent>
            </IonPage>
        </div>
    )
}
