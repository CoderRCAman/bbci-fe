import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useSQLite } from "../../../utils/Sqlite";
import { IonContent, IonPage } from "@ionic/react";
import Header from "../../../components/Header";
import { DataTable } from "primereact/datatable";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import shortUUID from "short-uuid";
import { Dropdown } from "primereact/dropdown";
import { Link } from "react-router-dom";
export interface RFTType {
    test_name: string,
    result: number,
    hl_flag: string,
    unit: string,
    bio_ref_interval: string,
    id: string,
}
export default function BloodPage3() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const [id, setId] = useState("");
    const [sampleId, setSampleId] = useState('');
    const { db, sqlite } = useSQLite();
    const [participant, setParticipants] = useState<any | null>(null);
    const [rfts, setRfts] = useState<RFTType[]>([
        {
            test_name: 'Serum Urea',
            result: 0,
            hl_flag: '',
            unit: '',
            bio_ref_interval: '',
            id: shortUUID().generate(),
        },
        {
            test_name: 'Serum Creatinine',
            result: 0,
            hl_flag: '',
            unit: '',
            bio_ref_interval: '',
            id: shortUUID().generate(),

        }
    ])
    const [alert, setAlert] = useState({
        show: false,
        header: "",
        message: "",
    });
    useEffect(() => {
        const curId = searchParams.get("id") || "";
        const sampleId = searchParams.get("sampleId") || "";
        setSampleId(sampleId)
        if (!db) return;
        async function fetchCurrentUser() {
            try {
                console.log(sampleId)
                const query = `
                            select * from patients where id = '${curId}'
                        `;
                const res = await db?.query(query);
                setParticipants(res?.values?.[0]);
                console.log(res,curId)
            } catch (error) {
                console.log(error);
            }
        }
        fetchCurrentUser();
    }, [location.pathname, db]);
    const handleSave = async () => {

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
                            <DataTable value={rfts}
                                tableStyle={{ minWidth: '60rem' }}
                                // tableClassName="p-datatable-gridlines"         
                                showGridlines
                                size='normal'
                                className="border !border-b-0"

                            >

                                <Column style={{ fontSize: '0.8rem' }} bodyClassName="border-b border-gray-300 " field="test_name" header="Test Name"></Column>
                                <Column style={{ fontSize: '0.8rem' }} bodyClassName="border-b border-gray-300 " field="result" header="Result"
                                    body={(rowData) =>

                                        <InputText
                                            placeholder="Modify"
                                            keyfilter="int"
                                            value={rowData.result}
                                            className="border p-2 "
                                            onChange={e => setRfts(prev =>
                                                prev.map(item => item.id === rowData.id ? ({ ...item, result: parseInt(e.target.value) }) : item)
                                            )}
                                        />

                                    }
                                ></Column>
                                <Column style={{ fontSize: '0.8rem' }} bodyClassName="border-b border-gray-300" field="h_l_flag" header="H/L Flag"
                                    body={rowData =>
                                        <Dropdown
                                            onChange={e => setRfts(prev =>
                                                prev.map(item => item.id === rowData.id ? ({ ...item, hl_flag: (e.target.value) }) : item)
                                            )}
                                            optionLabel="name"
                                            optionValue="value"
                                            className="border-1 "
                                            placeholder="Select"
                                            value={rowData.hl_flag}
                                            options={[
                                                { name: "L", value: "L" },
                                                { name: "N", value: "N" },
                                            ]}
                                        />

                                    }
                                ></Column>
                                <Column style={{ fontSize: '0.8rem' }} bodyClassName="border-b border-gray-300" field="unit" header="Unit"
                                    body={rowData =>
                                        <Dropdown
                                            onChange={e => setRfts(prev =>
                                                prev.map(item => item.id === rowData.id ? ({ ...item, unit: (e.target.value) }) : item)
                                            )}
                                            value={rowData.unit}
                                            optionLabel="name"
                                            optionValue="value"
                                            className="border-1"
                                            placeholder="Select"
                                            options={[
                                                { name: "mg/dL", value: "mg/dL" },
                                                { name: "mg/dL", value: "mg/dL" },
                                            ]}
                                        />

                                    }
                                ></Column>
                                <Column style={{ fontSize: '0.8rem' }} bodyClassName="border-b border-gray-300" field="bio_ref_interval" header="Biological Reference interval"
                                    body={rowData =>
                                        <InputText
                                            placeholder="Modify"
                                            keyfilter="int"
                                            value={rowData.bio_ref_interval}
                                            className="border p-2 "
                                            onChange={e => setRfts(prev =>
                                                prev.map(item => item.id === rowData.id ? ({ ...item, result: parseInt(e.target.value) }) : item)
                                            )}
                                        />
                                    }
                                ></Column>

                            </DataTable>
                        </div>

                        <div className="mt-5">
                            <Button
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
                </IonContent>
            </IonPage>
        </div>
    )
}
