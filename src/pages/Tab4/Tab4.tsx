import { useEffect, useState } from "react";
import { useSQLite } from "../../utils/Sqlite";
import { IonAlert, IonContent, IonPage } from "@ionic/react";
import Header from "../../components/Header";
import "./Tab4.css";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import HandleSelect from "../../components/HandleSelect";
import { useLocation } from "react-router";
import axios from "axios";
// PLEASE NOTE THIS PAGE IS NOT IN USE KINDLY AVAOID
export default function Tab4() {
  const { db, baseUrl } = useSQLite();
  const [alert, setAlert] = useState({
    show: false,
    header: "",
    message: "",
  });
  const location = useLocation();
  const [conflictedList, setConflictedList] = useState<any[]>([]);
  console.log(conflictedList?.[0]?.slice(-3));
  async function fetchPatients() {
    try {
      const res = await db?.query(
        "select p.* , t.synch from patients p join tracksync t on p.id = t.patient_id where t.synch = 0 ;"
      );
      const updatedRows = await db?.query(
        "select p.* , t.synch from patients  p join tracksync t on p.id = t.patient_id where t.synch = 2 ;"
      );
      const pat = res?.values ?? [];
      const upPat = updatedRows?.values ?? [];
      const dataRes = await axios.post(
        `${baseUrl}/api/update`,
        [pat, upPat]
      )
      setConflictedList(dataRes.data?.conflictedData)
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {

    fetchPatients()

  }, [db, location.pathname])


  return (
    <IonPage>
      <Header title="Fix conflicts" />
      <IonContent fullscreen className="p-2">
        <main className="m-2 p-2 shadow-2 fix-conflict">
          <div className="pb-5">
            <div className="flex mb-3 items-center justify-between ">
              <div className="">
                <h1 className="font-semibold">Resolve Data Conflict</h1>
                <p className="m-0 ">
                  Some records were updated on the server while you were
                  editing. Please review the changes.
                </p>
              </div>
              <div>
                <Button
                  label="Conflicts Detected"
                  className="px-5 py-2 rounded-full"
                  severity="danger"
                  rounded
                />
              </div>
            </div>
            <Message text="For each conflicting field below, choose which version to keep." />
          </div>
          <div className="border rounded-md ">
            {conflictedList.length == 0 ? (
              <p className="text-center">No conflicts found</p>
            ) : (
              conflictedList.map((items: any[], index) => (
                <div key={index} className="rounded-md shadow-2 space-y-5  m-2">
                  <div className="flex items-center py-5 border-b justify-between">
                    <div className="flex  flex-col">
                      <p className="font-semibold">Record ID :</p>
                      <p>{items?.at(-1)?.Value1}</p>
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="font-semibold">Participants name:</p>
                      <p>{items?.at(-3)?.Value2}</p>
                    </div>
                  </div>
                  <HandleSelect
                    items={items}
                    setAlert={setAlert}
                    fetchPatients={fetchPatients}
                  />

                </div>
              ))
            )}
          </div>
          <div className=""></div>
          <IonAlert
            isOpen={alert.show}
            onDidDismiss={() => setAlert((a) => ({ ...a, show: false }))}
            header={alert.header}
            message={alert.message}
            buttons={["OK"]}
          />
        </main>
      </IonContent>
    </IonPage>
  );
}
