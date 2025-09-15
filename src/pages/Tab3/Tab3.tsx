import {
  IonAccordion,
  IonAccordionGroup,
  IonAlert,
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import ExploreContainer from "../../components/ExploreContainer";
import "./Tab3.css";
import Header from "../../components/Header";
import { useSQLite } from "../../utils/Sqlite";
import { CSSProperties, useEffect, useState } from "react";
import { useLocation } from "react-router";
import axios from "axios";
import ShowConflicts from "../../components/ShowConflicts";
const forcedStyle = {
  contentPad: {
    padding: "15px",
  },
  ionInput: {
    border: "1px",
    borderStyle: "solid",
    padding: "20px",
    borderRadius: "5px",
    borderColor: "#c9c9c9",
  },
  btnPadd: { marginTop: "30px" },
};

function getStatusColor(status: number): string {
  switch (status) {
    case 0:
      return "red"; // red
    case 1:
      return "green"; // green
    case 2:
      return "red"; // yellow
    default:
      return "red";
  }
}

const thStyle: CSSProperties = {
  padding: "10px",
  border: "1px",
  borderStyle: "solid",
  borderColor: "#ddd",
  textAlign: "center",
};

const tdStyle = {
  padding: "10px",
  border: "1px",
  borderStyle: "solid",
  borderColor: "#ddd",
};
function getStatus(status: number): string {
  switch (status) {
    case 0:
      return "Not Synched"; // red
    case 1:
      return "Synched"; // green
    case 2:
      return "Updated(NOT SYNCHED)"; // yellow
    default:
      return "NA";
  }
}

const Tab3: React.FC = () => {
  const { db, sqlite, baseUrl, setBaseUrl } = useSQLite();
  const location = useLocation();
  const [patients, setPatients] = useState<any[]>([]);
  const [updatedPatient, setUpdatedPatients] = useState<any[]>([]);
  const [conflictedList, setConflictedList] = useState<any[]>([])
  // const [conflictedList , setConflictedList] = useState<any[]>([]) ;
  const [alert, setAlert] = useState({
    show: false,
    header: "",
    message: "",
  });
  async function fetchUnSynched() {
    try {
      const res = await db?.query(
        "select p.* , t.synch from patients p join tracksync t on p.id = t.patient_id where t.synch = 0 ;"
      );
      const updatedRows = await db?.query(
        "select p.* , t.synch from patients  p join tracksync t on p.id = t.patient_id where t.synch = 2 ;"
      );
      console.log(await db?.query('select * from tracksync'))
      setPatients(res?.values ?? []);
      setUpdatedPatients(updatedRows?.values ?? []);
      console.log("res:", res);
      console.log("updatedRows:", updatedRows);
    } catch (error) {
      setAlert((a) => ({
        ...a,
        show: true,
        header: "DB Error",
        message: String(error),
      }));
      console.log(error);
    }
  }

  async function handleRevertBack() {
    try {
      await db?.execute("UPDATE tracksync set synch = 0");
      await fetchUnSynched();
    } catch (error) {
      console.log("THIS ERROR OCCURED DURING REVERT BACK", error);
    }
  }

  async function handleUpdateParticipants(conflictedList: any[]) {
    try {
      const conflictedIds = conflictedList.map((item) => item?.at(-1)?.Value1);
      const ids = patients
        .filter((item) => !conflictedIds.includes(item.id))
        .map((pat) => pat.id);
      const ids2 = updatedPatient
        .filter((item) => !conflictedIds.includes(item.id))
        .map((pat) => pat.id);
      let str = ids.reduce(
        (accumulator, currentValue) => accumulator + ` '${currentValue}' ,`,
        "( "
      );
      str;
      str = str.slice(0, -1);
      str += " )";
      if (patients.length > 0) {
        console.log(str);
        await db?.run(
          `update tracksync set synch = 1 where patient_id in ${str} ;`
        );
      }

      str = ids2.reduce(
        (accumulator, currentValue) => accumulator + ` '${currentValue}' ,`,
        "( "
      );
      str;
      str = str.slice(0, -1);
      str += " )";
      if (updatedPatient.length > 0) {
        console.log(str);
        await db?.run(
          `update tracksync set synch = 1 where patient_id in ${str} ;`
        );
      }
      await sqlite?.saveToStore("patientdb");
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    fetchUnSynched();
  }, [location.pathname, db]);

  async function handleUnSynched() {
    const participants = [];
    participants.push(patients, updatedPatient);
    try {
      if (!baseUrl) {
        return setAlert((a) => ({
          ...a,
          show: true,
          header: "Failed",
          message: "Provide ip/URL to server",
        }));
      }
      const res = await axios.post(`${baseUrl}/api/patient`, participants, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.status === 200) {
        setAlert((a) => ({
          ...a,
          show: true,
          header: "Success",
          message: res.data.message,
        }));
        await handleUpdateParticipants(res.data.conflictedData);
        await fetchUnSynched();
        console.log(res.data)
        if (res.data.conflictedData.length > 0) {
          setConflictedList(res.data.conflictedData);
          return;
        }
        await handleSynchBack();
      }
    } catch (error) {
      setAlert((a) => ({
        ...a,
        show: true,
        header: "Failed",
        message: "Synched files failed!",
      }));
    }
  }

  async function handleSynchBack() {
    try {
      if (!baseUrl) {
        return setAlert((a) => ({
          ...a,
          show: true,
          header: "Failed",
          message: "Provide ip/URL to server",
        }));
      }
      const res = await axios.get(`${baseUrl}/api/patient`);
      const data = res.data.patients;
      const ids = data.map((item: any) => item.id);
      console.log(data);
      let vals = data
        .map(
          (row: any) => `('${row.Id}' , '${row.Name}' , ${row.Age},
      '${row.Gender}' , ${row.Lat} , ${row.Long} , '${row.I_Name}' , '${row.I_Emp_Code}',
      '${row.CreatedAt}' , '${row.UpdatedAt}' , '${row.Date}' , '${row.Time}' ,'${row.UpdatedBy}'
       , '${row.Dob}' , '${row._rev}' )`
        )
        .join(",");
      let query = `
          INSERT INTO patients (id, name , age , gender  , lat, long , i_name ,
            i_emp_code , created_at , updated_at , date , time , updated_by, dob,
            _rev
          )
          VALUES
            ${vals}
            ON CONFLICT(id) DO UPDATE SET
            name = excluded.name, 
            age = excluded.age,
            gender = excluded.gender,
            lat = excluded.lat,
            long = excluded.long,
            dob = excluded.dob ,
            updated_by = excluded.updated_by ,
            i_emp_code = excluded.i_emp_code ,
            i_name = excluded.i_name ,
            time = excluded.time ,
            date = excluded.date ,
            _rev = excluded._rev;
          `;
      vals = data.map((row: any) => `('${row.Id}' , 1 )`).join(",");

      let tabsyncQuery = `
        INSERT INTO tracksync ( patient_id , synch)
        VALUES 
        ${vals} 
        ON CONFLICT(patient_id) DO UPDATE SET 
        synch = 1 ; 
      `;
      // console.log(query, tabsyncQuery)
      await db?.run(query);
      await db?.run(tabsyncQuery);
      await sqlite?.saveToStore("patientdb");
      setAlert((a) => ({
        ...a,
        show: true,
        header: "Success",
        message: "Everything synched!",
      }));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  return (
    <IonPage>
      <Header title="Synch" />
      <IonContent style={forcedStyle.contentPad} fullscreen>
        <main className="space-y-5" style={forcedStyle.contentPad}>
          <IonInput
            onIonInput={(e) => setBaseUrl(e.detail.value!)}
            style={forcedStyle.ionInput}
            placeholder="Enter IP/URL of the server to synch"
          />
          <h2>Tables to synch</h2>
          {patients?.length == 0 && updatedPatient?.length == 0 ? (
            <div
              style={{
                color: "gray",
              }}
            >
              NO TABLES TO SYNCH
            </div>
          ) : (
            <>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f2f2f2" }}>
                    <th style={thStyle}>Index</th>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Synched Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((item, index) => (
                    <tr key={item.id} style={{ textAlign: "center" }}>
                      <td style={tdStyle}>{index + 1}</td>
                      <td style={tdStyle}>{item.id}</td>
                      <td style={tdStyle}>{item.name}</td>
                      <td style={tdStyle}>
                        <span style={{ color: getStatusColor(item.synch) }}>
                          {getStatus(item.synch)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {updatedPatient.map((item, index) => (
                    <tr key={item.id} style={{ textAlign: "center" }}>
                      <td style={tdStyle}>{index + 1}</td>
                      <td style={tdStyle}>{item.id}</td>
                      <td style={tdStyle}>{item.name}</td>
                      <td style={tdStyle}>
                        <span style={{ color: getStatusColor(item.synch) }}>
                          {getStatus(item.synch)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <IonButton
                onClick={() => handleUnSynched()}
                style={forcedStyle.btnPadd}
              >
                Synch to Database
              </IonButton>
            </>
          )}
          {
            conflictedList.length > 0 ?
              <ShowConflicts
                conflictedList={conflictedList}
              />
              :
              <></>
          }


          <IonAccordionGroup style={{ marginTop: "50px" }}>
            <IonAccordion value="first">
              <IonItem slot="header" color="light">
                <IonLabel>Do you want to revert back every record?</IonLabel>
              </IonItem>
              <div className="ion-padding" slot="content">
                <IonButton onClick={() => handleRevertBack()}>
                  Revert Back(it will Revert everything)
                </IonButton>
              </div>
            </IonAccordion>
          </IonAccordionGroup>
          <IonAccordionGroup style={{ marginTop: "50px" }}>
            <IonAccordion value="first">
              <IonItem slot="header" color="light">
                <IonLabel>Synch back!</IonLabel>
              </IonItem>
              <div className="ion-padding" slot="content">
                <IonButton id="confirm-trigger">
                  Synch back from server
                </IonButton>
              </div>
            </IonAccordion>
          </IonAccordionGroup>
        </main>

        <IonAlert
          isOpen={alert.show}
          onDidDismiss={() => setAlert((a) => ({ ...a, show: false }))}
          header={alert.header}
          message={alert.message}
          buttons={["OK"]}
        />
        <IonAlert
          header="Are you sure you want to synch back from the server!"
          trigger="confirm-trigger"
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
              handler: () => {
                console.log("<<<< Alert canceled >>>>");
              },
            },
            {
              text: "OK",
              role: "confirm",
              handler: async () => {
                console.log("<<<< Alert confirmed >>>>");
                try {
                  handleSynchBack();
                } catch (error) {
                  setAlert((a) => ({
                    ...a,
                    show: true,
                    header: "Error!",
                    message: "Something went wrong during synch back!",
                  }));
                }
              },
            },
          ]}
        // onDidDismiss={({ detail }) => console.log(`Dismissed with role: ${detail.role}`)}
        ></IonAlert>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
