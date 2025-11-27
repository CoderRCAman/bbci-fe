// /mnt/data/FoodRecallPage1.tsx
import { useEffect, useState } from "react";
import { useSQLite } from "../../../utils/Sqlite";
import { useLocation } from "react-router";
import { InputText } from "primereact/inputtext";
import { IonContent, IonPage } from "@ionic/react";
import Header from "../../../components/Header";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Link, useHistory } from "react-router-dom";
import { Button } from "primereact/button";

export default function FoodRecallPage1() {
    const { db } = useSQLite();
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [globalFilterValue1, setGlobalFilterValue1] = useState('');
    const [participants, setParticipants] = useState<any[]>([]);
    const [previousRecalls, setPreviousRecalls] = useState<any[]>([]);
    const location = useLocation();
    const history = useHistory();

    useEffect(() => {
        async function fetchUsersAndRecalls() {
            if (!db) return;
            try {
                // Participants *without* a master that already has at least one recall
                const query1 = `
  SELECT p.*, m.tab_id AS tab_id
  FROM patients p
  LEFT JOIN FOOD_HABITS_MASTER m ON m.user_id = p.id
  WHERE NOT EXISTS (
    SELECT 1
    FROM FOOD_HABITS_MASTER mm
    JOIN FOOD_RECALL_ENTRY r ON mm.id = r.master_id
    WHERE mm.user_id = p.id
  );
`;
                const res1 = await db.query(query1);
                // ensure tab_id exists (may be undefined) and normalise
                const participantsNormalized = (res1?.values || []).map((r: any) => ({ tab_id: r.tab_id || "", ...r }));
                setParticipants(participantsNormalized);


                // Query 2: Get all existing food habit surveys (for VIEW/EDIT)
                const query2 = `
                    SELECT 
                        m.id AS master_id, 
                        m.user_id, 
                        p.name, 
                        m.created_at, 
                        m.updated_at,
                        m.tab_id
                    FROM FOOD_HABITS_MASTER m
                    JOIN patients p ON m.user_id = p.id
                    ORDER BY m.updated_at DESC;
                `;
                const res2 = await db.query(query2);
                setPreviousRecalls(res2?.values || []);
            } catch (error) {
                console.log(error);
            }
        }
        fetchUsersAndRecalls();
    }, [db, location.pathname]);

    // Header for the first table (New)
    const renderHeaderNew = () => (
        <div className="flex justify-content-end">
            <span className="p-input-icon-left">
                <InputText
                    value={globalFilterValue}
                    onInput={(e) => setGlobalFilterValue((e.currentTarget as HTMLInputElement).value)}
                    placeholder="Search Patients..."
                    className="border p-2"
                />
            </span>
        </div>
    );

    // Header for the second table (View/Edit)
    const renderHeaderPrevious = () => (
        <div className="flex justify-content-end">
            <span className="p-input-icon-left">
                <InputText
                    value={globalFilterValue1}
                    onInput={(e) => setGlobalFilterValue1((e.currentTarget as HTMLInputElement).value)}
                    placeholder="Search Recalls..."
                    className="border p-2"
                />
            </span>
        </div>
    );

    // Body templates and action handlers
    const createButtonBody = (rowData: any) => {
        // If you want the ID linked as before, keep both — here we show a create icon button
        const userId = rowData.id;
        return (
            <Button
                icon="pi pi-plus"
                className="p-button-rounded p-button-sm"
                aria-label={`Create recall for ${userId}`}
                onClick={() => history.push(`/food-recall/page2?user_id=${userId}`)}
                tooltip="Create new Food Habit & Recall for this patient"
            />
        );
    };

    const patientIdBody = (rowData: any) => {
        return <Link to={`/patients/${rowData.id}`}>{rowData.id}</Link>;
    };

    const previousActionBody = (rowData: any) => {
        // Edit master (open Food Habit page) with master_id and user_id
        const masterId = rowData.master_id;
        const userId = rowData.user_id;
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    className="p-button-text p-button-sm"
                    aria-label={`Edit habit ${masterId}`}
                    onClick={() => history.push(`/food-recall/page3?master_id=${masterId}&user_id=${userId}`)}
                    tooltip="Edit Food Habit (Master)"
                />
                {/* Optional: quick open recall entries editor
              <Button
                icon="pi pi-file"
                className="p-button-text p-button-sm"
                aria-label={`Edit recall entries ${masterId}`}
                onClick={() => history.push(`/food-recall/page3?master_id=${masterId}&user_id=${userId}`)}
                tooltip="Edit Food Recall entries"
              />
              */}
            </div>
        );
    };

    return (
        <IonPage>
            <Header title={"Food Recall"} />
            <IonContent fullscreen>
                <main className="p-2">
                    <div className="mt-5 border rounded">
                        <div className="pl-5 py-2 flex items-center justify-between">
                            <h2 className="text-slate-600 font-semibold">New Food Habit Record (Select Patient)</h2>
                            <div className="text-sm text-gray-500">Only patients without an existing recall are shown here</div>
                        </div>
                        <DataTable
                            value={participants}
                            globalFilter={globalFilterValue}
                            header={renderHeaderNew}
                            paginator
                            rows={10}
                            showGridlines
                            size='normal'
                            tableStyle={{ minWidth: '6rem' }}
                        >
                            <Column field="tab_id" header="Tab ID" sortable style={{ width: "120px" }} />
                            <Column field="id" header="Patient Id" sortable style={{ width: "160px" }} />
                            <Column field="name" sortable header="Name" />
                            <Column header="Create" body={createButtonBody} style={{ width: "120px", textAlign: 'center' }} />
                        </DataTable>
                    </div>

                    <div className="mt-10 border rounded">
                        <div className="pl-5 py-2 flex items-center justify-between">
                            <h2 className="text-slate-500 font-semibold">Add Food Recall for Patient (View/Edit Habit Record)</h2>
                            <div className="text-sm text-gray-500">Edit existing habit/recall records</div>
                        </div>
                        <DataTable
                            value={previousRecalls}
                            globalFilter={globalFilterValue1}
                            header={renderHeaderPrevious}
                            paginator
                            rows={10}
                            showGridlines
                            size='normal'
                            tableStyle={{ minWidth: '6rem' }}
                        >
                            <Column field="tab_id" header="Tab ID" sortable style={{ width: "120px" }} />
                            <Column field="user_id" header="Patient Id" sortable style={{ width: "160px" }} />
                            <Column field="name" header="Name" sortable />
                            <Column header="Action" body={previousActionBody} style={{ width: "120px", textAlign: 'center' }} />
                        </DataTable>
                    </div>
                </main>
            </IonContent>
        </IonPage>
    );
}
