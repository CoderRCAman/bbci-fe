import { IonContent, IonPage } from "@ionic/react";
import Header from "../../../components/Header";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { useSQLite } from "../../../utils/Sqlite";
import { useLocation } from "react-router";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Link } from "react-router-dom";
import { format } from "date-fns";
export default function BloodPage1() {
  const { db, sqlite } = useSQLite();
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [globalFilterValue1, setGlobalFilterValue1] = useState('');
  const [participants, setParticipants] = useState<any[]>([]);
  const [bloodSample, setBloodSample] = useState<any[]>([]);

  const location = useLocation();
  useEffect(() => {
    async function fetchUsers() {
      try {
        const query = `
            select * from patients ; 
          `
        const query2 = `
          select b.* , p.name from blood_sample b  join patients p on b.user_id = p.id order by date_collected desc  ; 
        `
        const res = await db?.query(query);
        const res2 = await db?.query(query2);
        const values = res?.values as any[];
        const values2 = res2?.values as any[];
        console.log(values2)
        setParticipants(values);
        setBloodSample(values2)

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
          value={globalFilterValue1}
          onInput={(e) => setGlobalFilterValue1(e.currentTarget.value)}
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
                <h1 className="text-slate-600 font-semibold">Create Fresh/New Blood Report</h1>
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
                <h1 className="text-slate-500 font-semibold">Read/Write old Blood Reports</h1>
              </div>
              <DataTable value={bloodSample}
                tableStyle={{ minWidth: '6rem' }}
                // tableClassName="p-datatable-gridlines" 
                globalFilter={globalFilterValue}
                header={header2}
                paginator
                rows={10}
                showGridlines
                size='normal'
              >
                <Column field="id" sortable header="Sample Id"
                  body={(rowData) => <Link to={`/blood2?id=${rowData.user_id}&sampleId=${rowData.id}`}>{rowData.id}</Link>}
                ></Column>
                <Column field="name" sortable header="Name"></Column>
                <Column field="user_id" sortable header="User Id"></Column>
                {/* <Column field="date_collected" sortable header="Collected Date" 
                  body = {(rowData) => format(new Date(rowData.date_collected , 'yyy'))}
                ></Column> */}
              </DataTable>

            </div>

          </main>
        </IonContent>
      </IonPage>
    </>
  )
}
