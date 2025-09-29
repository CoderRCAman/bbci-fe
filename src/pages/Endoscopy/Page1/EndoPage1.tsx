import { IonContent, IonPage } from "@ionic/react";
import Header from "../../../components/Header";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { useSQLite } from "../../../utils/Sqlite";
import { useLocation } from "react-router";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Link } from "react-router-dom";
export default function EndoPage1() {
  const [searchTerm, setSearchTerm] = useState('');
  const { db, sqlite } = useSQLite();
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [globalFilterValue2, setGlobalFilterValue2] = useState('');
  const [participants, setParticipants] = useState<any[]>([]);
  const [endoscopyData, setEndoscopyData] = useState<any[]>([]);
  const location = useLocation();
  useEffect(() => {
    async function fetchUsers() {
      try {
        const query = `
            select * from patients ; 
          `
        const query2 = `
          select e.* , p.name , p.id as user_id from endoscopy e
          join patients p  on p.id = e.user_id 
          ;
        `
        const res = await db?.query(query);
        const res2 = await db?.query(query2);
        const values = res?.values as any[];
        const values2 = res2?.values as any[];
        setParticipants(values);
        setEndoscopyData(values2);
        console.log(values2)
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
  const header2 = (
    <div className="flex justify-content-end">
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={globalFilterValue2}
          onInput={(e) => setGlobalFilterValue2(e.currentTarget.value)}
          placeholder="Search..."
          className="border p-2"
        />
      </span>
    </div>
  );

  return (
    <>
      <IonPage>
        <Header title={"Endoscopy"} />
        <IonContent class='' fullscreen>
          <main className="p-2">
            <div className="mt-5 border-2 rounded">
              <div className="pl-5 py-2">
                <h1 className="text-slate-600 font-semibold">Process a new Endoscopy</h1>
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
                  body={(rowData) => <Link to={`/endo2?id=${rowData.id}`}>{rowData.id}</Link>}
                ></Column>
                <Column field="name" sortable header="Name"></Column>
                <Column field="gender" sortable header="Gender"></Column>
              </DataTable>

            </div>

            <div className="mt-10 border rounded">
              <div className="pl-5 py-2">
                <h1 className="text-slate-500 font-semibold">Looking for previous Endoscopy?</h1>
              </div>
              <DataTable value={endoscopyData}
                tableStyle={{ minWidth: '6rem' }}
                // tableClassName="p-datatable-gridlines" 
                globalFilter={globalFilterValue2}
                header={header2}
                paginator
                rows={10}
                showGridlines
                size='normal'
              >
                <Column field="id" sortable header="Id"
                  body={(rowData) => <Link to={`/endo2?endoId=${rowData.id}&id=${rowData.user_id}`}>{rowData.id}</Link>}
                ></Column>
                <Column field="user_id" sortable header="User Id"></Column>
                <Column field="name" sortable header="Name"></Column>
                <Column field="date" sortable header="Date"></Column>
              </DataTable>

            </div>

          </main>
        </IonContent>
      </IonPage>
    </>
  )
}
