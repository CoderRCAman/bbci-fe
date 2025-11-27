import { useEffect, useState } from "react";
import { useSQLite } from "../../../utils/Sqlite";
import { useLocation } from "react-router";
import { InputText } from "primereact/inputtext";
import { IonContent, IonPage } from "@ionic/react";
import Header from "../../../components/Header";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Link } from "react-router-dom";

export default function FoodRecallPage1() {
    const { db } = useSQLite();
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [globalFilterValue1, setGlobalFilterValue1] = useState('');
    const [participants, setParticipants] = useState<any[]>([]);
    const [previousRecalls, setPreviousRecalls] = useState<any[]>([]);
    const location = useLocation();

    useEffect(() => {
        async function fetchUsersAndRecalls() {
            if (!db) return;
            try {
                // Participants *without* a master that already has at least one recall
                const query1 = `
  SELECT p.*
  FROM patients p
  WHERE NOT EXISTS (
    SELECT 1
    FROM FOOD_HABITS_MASTER m
    JOIN FOOD_RECALL_ENTRY r ON m.id = r.master_id
    WHERE m.user_id = p.id
  );
`;
                const res1 = await db.query(query1);
                setParticipants(res1?.values || []);


                // Query 2: Get all existing food habit surveys (for VIEWING/EDITING)
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

    // Body template for the "New" table link
    const newRecallLinkBody = (rowData: any) => {
        // This link goes to the FoodHabitPage (Page 2) and passes the PATIENT ID (user_id)
        // This will trigger "create" mode in the habit page
        return <Link to={`/food-recall/page2?user_id=${rowData.id}`}>{rowData.id}</Link>;
    };

    // Body template for the "View/Edit" table link
    // Clicking "Edit" on Page 1 will now open Food Recall Page 3 directly in edit mode.
    const previousRecallLinkBody = (rowData: any) => {
        // route directly to FoodRecallEntryPage (page3) for editing the existing survey
        // keep user_id for context/compatibility
        return (
            <Link to={`/food-recall/page3?master_id=${rowData.master_id}&user_id=${rowData.user_id}`}>
                {rowData.master_id}
            </Link>
        );
    };

    return (
        <IonPage>
            <Header title={"Food Recall"} />
            <IonContent fullscreen>
                <main className="p-2">
                    <div className="mt-5 border rounded">
                        <div className="pl-5 py-2">
                            <h2 className="text-slate-600 font-semibold">New Food Habit Record (Select Patient)</h2>
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
                            <Column field="id" sortable header="Patient Id" body={newRecallLinkBody}></Column>
                            <Column field="name" sortable header="Name"></Column>
                            <Column field="gender" sortable header="Gender"></Column>
                        </DataTable>
                    </div>

                    <div className="mt-10 border rounded">
                        <div className="pl-5 py-2">
                            <h2 className="text-slate-500 font-semibold">Add Food Recall for Patient (View/Edit Habit Record)</h2>
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
                            <Column field="master_id" sortable header="Recall Survey ID" body={previousRecallLinkBody}></Column>
                            <Column field="name" sortable header="Patient Name"></Column>
                            <Column field="user_id" sortable header="Patient Id"></Column>
                            <Column field="updated_at" sortable header="Last Updated"></Column>
                            <Column field="tab_id" sortable header="Tab ID"></Column>
                        </DataTable>
                    </div>
                </main>
            </IonContent>
        </IonPage>
    );
}
