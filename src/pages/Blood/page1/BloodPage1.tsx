import { IonContent, IonPage } from "@ionic/react";
import Header from "../../../components/Header";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { useSQLite } from "../../../utils/Sqlite";
import { useLocation } from "react-router";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Link } from "react-router-dom";
export default function BloodPage1() {
  const [searchTerm, setSearchTerm] = useState('');
  const { db, sqlite } = useSQLite();
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [participants, setParticipants] = useState<any[]>([]);
  const location = useLocation();
  useEffect(() => {
    async function fetchUsers() {
      try {
        const query = `
            select * from patients ; 
          `
        const res = await db?.query(query);
        const values = res?.values as any[];
        setParticipants(values);
      } catch (error) {
        console.log(error)
      }
    }
    fetchUsers()

  }, [db, location.pathname])
  const header = (
    <div className="flex justify-content-end">
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={globalFilterValue}
          onInput={(e) => setGlobalFilterValue(e.currentTarget.value)}
          placeholder="Search..."
          className="border p-2"
        />
      </span>
    </div>
  );

  return (
    <>
      <IonPage>
        <Header title={"Blood sample"} />
        <IonContent class='' fullscreen>
          <main className="p-2">
            <div className="mt-5 border-2 rounded">
              <div className="pl-5 py-2">
                <h1 className="text-slate-600 font-semibold">Process a new blood Report</h1>
              </div>
              <DataTable value={participants}
                tableStyle={{ minWidth: '6rem' }}
                // tableClassName="p-datatable-gridlines" 
                globalFilter={globalFilterValue}
                header={header}
                paginator
                rows={10}
                showGridlines
                size='normal'
              >
                <Column field="id" sortable header="Id"
                  body={(rowData) => <Link to={`/blood2?id=${rowData.id}`}>{rowData.id}</Link>}
                ></Column>
                <Column field="name" sortable header="Name"></Column>
                <Column field="gender" sortable header="Gender"></Column>
              </DataTable>

            </div>

            <div className="mt-10 border rounded">
              <div className="pl-5 py-2">
                <h1 className="text-slate-500 font-semibold">Looking for blood report?</h1>
              </div>
              <DataTable value={participants}
                tableStyle={{ minWidth: '6rem' }}
                // tableClassName="p-datatable-gridlines" 
                globalFilter={globalFilterValue}
                header={header}
                paginator
                rows={10}
                showGridlines
                size='normal'
              >
                <Column field="id" sortable header="Id"
                  body={(rowData) => <Link to={`/blood2?id=${rowData.id}`}>{rowData.id}</Link>}
                ></Column>
                <Column field="name" sortable header="Name"></Column>
                <Column field="gender" sortable header="Gender"></Column>
              </DataTable>

            </div>

          </main>
        </IonContent>
      </IonPage>
    </>
  )
}
