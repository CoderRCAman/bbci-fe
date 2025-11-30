import { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown } from "primereact/dropdown";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { IonAlert } from "@ionic/react";

export default function PMHInputOther({
    data,
    updateStateData,
    isDisabled,
    onRemove,
    ageLimit,
    dob
}: {
    data: any;
    updateStateData: (id: string, field: string, value: any) => void;
    isDisabled: boolean;
    ageLimit: number
    onRemove: (id: string) => void;
    dob: string
}) {
    // convert string → array utilities
    const toArr = (v: string | null | undefined) =>
        v ? v.split("|").filter((x) => x.trim() !== "") : [""];

    const toStr = (arr: string[]) =>
        arr.filter((x) => x.trim() !== "").join("|");

    const [diagnosisList, setDiagnosisList] = useState<string[]>(toArr(data.mode_of_diagnosis));
    const [treatmentList, setTreatmentList] = useState<string[]>(toArr(data.mode_of_treatment));
    const [showConfirm, setShowConfirm] = useState(false);
    useEffect(() => {
        updateStateData(data.id, "mode_of_diagnosis", toStr(diagnosisList));
    }, [diagnosisList]);

    useEffect(() => {
        updateStateData(data.id, "mode_of_treatment", toStr(treatmentList));
    }, [treatmentList]);

    const addDiagnosis = () => setDiagnosisList([...diagnosisList, ""]);
    const addTreatment = () => setTreatmentList([...treatmentList, ""]);

    const removeDiagnosis = (i: number) => {
        const arr = [...diagnosisList];
        arr.splice(i, 1);
        if (arr.length === 0) arr.push("");
        setDiagnosisList(arr);
    };

    const removeTreatment = (i: number) => {
        const arr = [...treatmentList];
        arr.splice(i, 1);
        if (arr.length === 0) arr.push("");
        setTreatmentList(arr);
    };

    const TREATMENT_OPTIONS = [
        { name: "YES", value: 1 },
        { name: "NO", value: 2 },
        { name: "DON'T KNOW", value: 8 },
        { name: "REFUSED TO ANSWER", value: 9 }
    ];

    return (
        <Card className="shadow-md border p-4">
            <div
                className="sticky top-0 -mt-10 text-center bg-white py-3"
                style={{ zIndex: 10 }}
            >
                <h1 className="font-semibold text-primary-600 dark:text-primary-300 text-lg m-0">
                    Other Diagosis
                </h1>
            </div>
            {/* REMOVE button */}
            <div className="flex justify-end mb-3">
                <Button
                    icon="pi pi-trash"
                    severity="danger"
                    text
                    onClick={() => setShowConfirm(true)}
                    disabled={isDisabled}
                />
            </div>

            {/* DIAGNOSIS NAME */}
            <FloatLabel className="mb-8">
                <InputText
                    disabled={isDisabled}
                    value={data.diagnoss || ""}
                    onChange={(e) =>
                        updateStateData(data.id, "diagnoss", e.target.value)
                    }
                    className="w-full"
                />
                <label>Diagnosis Name</label>
            </FloatLabel>

            {/* AGE AT FIRST DIAGNOSIS */}
            <FloatLabel className="mb-8">
                <InputText
                    disabled={data?.diagnosed !== 1 || isDisabled}
                    keyfilter="int"
                    type="number"

                    value={data?.age_first_diagnosis?.toString() || ""}
                    // Removed custom classes
                    onChange={(e) => {
                        const raw = e.target.value;

                        // allow clearing
                        if (raw === "") {
                            updateStateData(data.id, "age_first_diagnosis", "");
                            return;
                        }

                        let num = parseInt(raw);

                        // enforce max
                        if (num > ageLimit) num = ageLimit;

                        updateStateData(data.id, "age_first_diagnosis", num);
                        if (dob) {
                            const dobDate = new Date(dob);
                            const dobYear = dobDate.getFullYear();
                            const diagnosisYear = dobYear + num;
                            updateStateData(data.id, "year_of_first_diagnosis", diagnosisYear);
                        }
                    }
                    }
                />
                <label>Age at First Diagnosis</label>
            </FloatLabel>

            {/* YEAR OF FIRST DIAGNOSIS */}
            <FloatLabel className="mb-8">
                <InputText
                    disabled={isDisabled}
                    type="number"
                    value={data.year_of_first_diagnosis?.toString() || ""}
                    onChange={(e) =>
                        updateStateData(
                            data.id,
                            "year_of_first_diagnosis",
                            parseInt(e.target.value) || ""
                        )
                    }
                    className="w-full"
                />
                <label>Year of First Diagnosis</label>
            </FloatLabel>

            {/* TREATMENT RECEIVED */}
            <FloatLabel className="mb-8">
                <Dropdown
                    disabled={isDisabled}
                    value={data.treatment_received}
                    optionLabel="name"
                    optionValue="value"
                    options={TREATMENT_OPTIONS}
                    onChange={(e) =>
                        updateStateData(data.id, "treatment_received", e.value)
                    }
                    className="w-full"
                />
                <label>Treatment Received</label>
            </FloatLabel>

            {/* MODE OF TREATMENT */}
            <div className="mb-8">
                <p className="font-semibold text-gray-600 mb-3">Mode of Treatment</p>

                {treatmentList.map((val, index) => (
                    <div key={index} className="flex gap-3 mb-3">
                        <InputText
                            disabled={isDisabled || data.treatment_received !== 1}
                            value={val}
                            className="w-full"
                            onChange={(e) => {
                                const arr = [...treatmentList];
                                arr[index] = e.target.value;
                                setTreatmentList(arr);
                            }}
                        />
                        {/* REMOVE */}
                        <Button
                            icon="pi pi-minus"
                            severity="danger"
                            size="small"
                            disabled={isDisabled || data.treatment_received !== 1}
                            onClick={() => removeTreatment(index)}
                        />

                        {/* ADD */}
                        {index === treatmentList.length - 1 && (
                            <Button
                                icon="pi pi-plus"
                                size="small"
                                disabled={isDisabled || data.treatment_received !== 1}
                                onClick={addTreatment}
                            />
                        )}
                    </div>
                ))}
            </div>
            {/* MODE OF DIAGNOSIS (dynamic textboxes) */}
            <div className="mb-8">
                <p className="font-semibold text-gray-600 mb-3">Mode of Diagnosis</p>

                {diagnosisList.map((val, index) => (
                    <div key={index} className="flex gap-3 mb-3">
                        <InputText
                            disabled={isDisabled || data.treatment_received !== 1}
                            value={val}
                            className="w-full"
                            onChange={(e) => {
                                const arr = [...diagnosisList];
                                arr[index] = e.target.value;
                                setDiagnosisList(arr);
                            }}
                        />

                        {/* REMOVE */}
                        <Button
                            icon="pi pi-minus"
                            severity="danger"
                            size="small"
                            disabled={isDisabled || data.treatment_received !== 1}
                            onClick={() => removeDiagnosis(index)}
                        />

                        {/* ADD (only on last row) */}
                        {index === diagnosisList.length - 1 && (
                            <Button
                                icon="pi pi-plus"
                                size="small"
                                disabled={isDisabled || data.treatment_received !== 1}
                                onClick={addDiagnosis}
                            />
                        )}
                    </div>
                ))}


            </div>
            <IonAlert
                isOpen={showConfirm}
                onDidDismiss={() => setShowConfirm(false)}
                header="Confirm"
                message="Are you sure you want to delete this diagnosis ?"
                buttons={[
                    {
                        text: "Cancel",
                        role: "cancel",
                    },
                    {
                        text: "Yes",
                        handler: () => {
                            onRemove(data.id)
                            // your logic here
                        },
                    },
                ]}
            />

        </Card>
    );
}
