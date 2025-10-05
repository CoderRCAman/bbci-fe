import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useSQLite } from "../../../utils/Sqlite";
import { IonAlert, IonContent, IonPage } from "@ionic/react";
import Header from "../../../components/Header";
import { DataTable } from "primereact/datatable";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import shortUUID from "short-uuid";
import { Dropdown } from "primereact/dropdown";
import { Link } from "react-router-dom";
import { set } from "date-fns";
import { validateRFTArray } from "../bHelper";
import { InputNumber } from "primereact/inputnumber";
import { saveToStore } from "../../../utils/helper";
export interface RFTType {
    test_name: string;
    result: number;
    unit: string;
    id: string;
    sampleId?: string;
    test_type?: string;
}
export default function BloodPage3() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const [id, setId] = useState("");
    const [sampleId, setSampleId] = useState("");
    const { db, sqlite } = useSQLite();
    const [participant, setParticipants] = useState<any | null>(null);
    const [rfts, setRfts] = useState<RFTType[]>([]);
    const [alert, setAlert] = useState({
        show: false,
        header: "",
        message: "",
    });
    useEffect(() => {
        const curId = searchParams.get("id") || "";
        const sampleId = searchParams.get("sampleId") || "";
        setRfts([
            {
                test_name: "Serum Urea",
                result: 0,
                unit: "mg/dL",
                id: shortUUID().generate(),
                sampleId: sampleId,
                test_type: "RFT",
            },
            {
                test_name: "Serum Creatinine",
                result: 0,
                unit: "mg/dL",
                id: shortUUID().generate(),
                sampleId: sampleId,
                test_type: "RFT",
            },
        ]);
        setSampleId(sampleId);
        setId(curId);
        if (!db) return;
        async function fetchCurrentUser() {
            try {
                const query = `
                            select * from patients where id = '${curId}'
                        `;
                const query2 = `
                            select * from gtgh_blood_report  where sampleId = '${sampleId}' and test_type = 'RFT'
                        `;
                const res = await db?.query(query);
                const res2 = await db?.query(query2);
                console.log(res2);
                setParticipants(res?.values?.[0]);
                setRfts(
                    res2?.values?.length
                        ? (res2?.values as RFTType[])
                        : [
                            {
                                test_name: "Serum Urea",
                                result: 0,
                                unit: "mg/dL",
                                id: shortUUID().generate(),
                                sampleId: sampleId,
                                test_type: "RFT",
                            },
                            {
                                test_name: "Serum Creatinine",
                                result: 0,
                                unit: "mg/dL",
                                id: shortUUID().generate(),
                                sampleId: sampleId,
                                test_type: "RFT",
                            },
                        ]
                );
                console.log(res, curId);
            } catch (error) {
                console.log(error);
            }
        }
        fetchCurrentUser();
    }, [location.pathname, db]);
    const handleSave = async () => {
        try {
            const error = validateRFTArray(rfts);
            if (error) {
                return setAlert({
                    show: true,
                    header: "Validation Error",
                    message: error,
                });
            }

            const query = `
        INSERT INTO gtgh_blood_report (id, sampleId, test_name, result,  unit, test_type)
        VALUES (?, ?, ?, ?, ?,  ?)   
        ON CONFLICT(id) DO UPDATE SET
          sampleId=excluded.sampleId,
          test_name=excluded.test_name,   
          result=excluded.result,         
          unit=excluded.unit,
          test_type=excluded.test_type
      `;
            const values = rfts.map((rft) => [
                rft.id,
                rft.sampleId || sampleId,
                rft.test_name,
                rft.result,
                rft.unit,
                rft.test_type || "RFT",
            ]);
            for (let i = 0; i < values.length; i++) {
                const params = values[i];
                await db?.run(query, params);
            }
            await saveToStore(sqlite)
            console.log(values);
            setAlert({
                show: true,
                header: "Success",
                message: "Renal Function Test (RFT) saved successfully",
            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div>
            <IonPage>
                <Header title={"Renal Function Test (RFT)"} />
                <IonContent fullscreen>
                    <main className="p-2">
                        <div className="p-2 shadow border rounded text-slate-600">
                            <p className="text-lg  font-semibold">Participant's details</p>
                            <div>
                                <span className="font-semibold">ID: </span>{" "}
                                <span>{participant?.id}</span>
                            </div>
                            <div>
                                <span className="font-semibold">Name: </span>{" "}
                                <span>{participant?.name}</span>
                            </div>
                        </div>

                        <div className="mt-10">
                            <DataTable
                                value={rfts}
                                tableStyle={{ minWidth: "10rem" }}
                                // tableClassName="p-datatable-gridlines"
                                showGridlines
                                size="normal"
                                className="border !border-b-0"
                            >
                                <Column
                                    style={{ fontSize: "0.8rem" }}
                                    bodyClassName="border-b border-gray-300 "
                                    field="test_name"
                                    header="Test Name"
                                ></Column>
                                <Column
                                    style={{ fontSize: "0.8rem" }}
                                    bodyClassName="border-b border-gray-300 "
                                    field="result"
                                    header="Result"
                                    body={(rowData) => (
                                        <InputNumber
                                            placeholder="Modify"
                                            value={rowData.result}
                                            minFractionDigits={0}
                                            maxFractionDigits={2}
                                            className=""
                                            id="result_blood"
                                            onChange={(e) =>
                                                setRfts((prev) =>
                                                    prev.map((item) =>
                                                        item.id === rowData.id
                                                            ? {
                                                                ...item,
                                                                result: e.value || 0,
                                                            }
                                                            : item
                                                    )
                                                )
                                            }
                                        />
                                    )}
                                ></Column>

                                <Column
                                    style={{ fontSize: "0.8rem" }}
                                    bodyClassName="border-b border-gray-300"
                                    field="unit"
                                    header="Unit"
                                    body={(rowData) => (
                                        <div>
                                            {rowData.unit}
                                        </div>
                                    )}
                                ></Column>

                            </DataTable>
                        </div>

                        <div className="mt-5">
                            <Button
                                onClick={handleSave}
                                label="Save"
                                className="px-10 py-2 rounded"
                                severity="success"
                            />
                        </div>

                        <div className="flex gap-2 mt-5 justify-end ">
                            <Link to={`/blood2?id=${id}&sampleId=${sampleId}`}>
                                <Button label="PREV" className="px-5 py-2 rounded" />
                            </Link>
                            <Link to={`/blood4?id=${id}&sampleId=${sampleId}`}>
                                <Button label="NEXT" className="px-5 py-2 rounded" />
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
        </div>
    );
}
