import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../../../components/ExploreContainer';
import './Tab2.css';
import Header from '../../../components/Header';
import { useSQLite } from '../../../utils/Sqlite';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import "primereact/resources/primereact.min.css";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
interface Patient {
  id?: string;
  name: string;
  age: number;
  gender: string;
  lat: number;
  long: number;
}
const Tab2: React.FC = () => {
  const { db } = useSQLite();
  const [patients, setPatients] = useState<Patient[]>([]);
  const location = useLocation();
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  useEffect(() => {
    const fetchPatients = async () => {
      const res = await db?.query('SELECT * FROM patients');
      console.log(res);
      setPatients(res?.values || []);
    };
    fetchPatients();
  }, [db, location.pathname])
  const columns = [
    { data: 'id', title: 'Id' },
    { data: 'name', title: 'Name' },
    { data: 'place', title: 'Place' },
    { data: 'gender', title: 'Gender' },
    { data: 'age', title: 'Age' },
    { data: 'lat', title: 'Lat' },
    { data: 'long', title: 'Long' },
  ];


  const header = (
    <div className="flex justify-content-end">
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={globalFilterValue}
          onInput={(e) => setGlobalFilterValue(e.currentTarget.value)}
          placeholder="Search..."
        />
      </span>
    </div>
  );

  return (
    <IonPage>
      <Header
        title='Patient list'
      />
      <IonContent fullscreen>
        <main className='p-2'>
          <DataTable value={patients}
            tableStyle={{ minWidth: '50rem' }}
            // tableClassName="p-datatable-gridlines" 
            globalFilter={globalFilterValue}
            header={header}
            paginator
            rows={10}
            showGridlines
            size='normal'

          >
            <Column field="id" sortable header="Id"
              body={(rowData) => <Link to={`/tab1?id=${rowData.id}`}>{rowData.id}</Link>}
            ></Column>
            <Column field="name" sortable header="Name"></Column>
            <Column field="place" sortable header="Place"></Column>
            <Column field="gender" sortable header="Gender"></Column>
            <Column field="lat" header="Lat"></Column>
            <Column field="long" header="Long"></Column>
          </DataTable>
        </main>

        {/* <main style={{ padding: '10px' }}>
          <table className="user-table">
            <thead>
              <tr>
                <th className="index-col">Index</th>
                <th className="userid-col">User ID</th>
                <th className="name-col">Name</th>
                <th className="coordinate-col">Latitude</th>
                <th className="coordinate-col">Longitude</th>
              </tr>
            </thead>
            <tbody>
              {
                patients.map((pat, index) =>
                (
                  <tr key={pat.id}>
                    <td className="index-col">{index + 1}</td>
                    <td className="userid-col">
                      <Link
                        to={{
                          pathname: '/tab1',
                          state : {id : pat.id},
                          search : `?id=${pat.id}` 
                        }}
                      >
                        {pat.id}
                      </Link>
                    </td>
                    <td className="name-col">{pat.name}</td>
                    <td className="coordinate-col">{pat?.lat}</td>
                    <td className="coordinate-col">{pat?.long}</td>
                  </tr>
                )

                )
              }


            </tbody>
          </table>
        </main> */}
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
