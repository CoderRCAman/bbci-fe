import { IonAlert, IonContent, IonPage } from "@ionic/react";
import Header from "../../../components/Header";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSQLite } from "../../../utils/Sqlite";
import ShortUUID from "short-uuid";
import { saveToStore } from "../../../utils/helper";
import { checkElibleToSave } from "../../Registration/Tab11/data";
import ShowRegisteredTab from "../../../components/ShowRegisteredTab";
export default function EndoPage3() {
  const [barcodeData, setBarCodeData] = useState("");
  const [editFlag, setEditFlag] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [id, setId] = useState("");
  const { db, sqlite, tabId } = useSQLite();
  const [participant, setParticipants] = useState<any | null>(null);
  const [endoId, setEndoId] = useState("");

  const [alert, setAlert] = useState({
    show: false,
    header: "",
    message: "",
  });

  useEffect(() => {
    const curId = searchParams.get("id") || "";
    setId(curId);
    const edit = searchParams.get("edit") || "";
    const endoIdd = searchParams.get("endoId") || "";
    setEndoId(searchParams.get("endoId") || "");
    setEditFlag(edit === "yes");
    async function fetchCurrentUser() {
      try {
        const query = `
                    select * from patients where id = '${curId}'
                `;
        const query2 = `
                 select * from endoscopy where id = '${endoIdd}'
                `;
        const res = await db?.query(query);
        const res2 = await db?.query(query2);
        setParticipants(res?.values?.[0]);
        setBarCodeData(res2?.values?.[0]?.vial_code);
        console.log(res2);
      } catch (error) {
        console.log(error);
      }
    }
    fetchCurrentUser();
  }, [location.pathname, db]);
  useEffect(() => {
    let buffer = "";
    const keydown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        console.log("Scanned:", buffer);
        setBarCodeData(buffer);
        buffer = "";
      } else {
        buffer += e.key;
      }
    };
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, [location.pathname]);
  const handleSaveEndocode = async () => {
    try {
      if (db && editFlag && !(await checkElibleToSave(db, endoId || "", tabId, 'ENDOSCOPY'))) {
        return setAlert({
          header: "Restricted access",
          message: "This user was registered with a different tab id.",
          show: true,
        });
      }
      if (!barcodeData) {
        setAlert({
          header: "Error",
          message: "Barcode data is missing!",
          show: true,
        });
        return;
      }

      const translator = ShortUUID();
      const uid = translator.generate();
      const query = `
                    INSERT INTO ENDOSCOPY (id , vial_code , user_id , date , tab_id , created_at) 
                    values ('${uid}' , '${barcodeData}' , '${id}' , '${new Date().toLocaleString('sv-SE').replace('T', ' ')}' , '${tabId}' , '${new Date().toLocaleString('sv-SE').replace('T', ' ')}') 
                `;
      await db?.execute(query);
      await saveToStore(sqlite);
      setEndoId(uid);
      setAlert({
        header: "Success",
        message: "Vial linked successfully!",
        show: true,
      });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <IonPage>
        <Header title={"Collect Endoscopy Vial "} />
        <IonContent class="" fullscreen>
          <ShowRegisteredTab id={endoId || ''} table_name="ENDOSCOPY" />
          <main className="p-2 space-y-10">
            <div className="p-2 border rounded text-slate-600">
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
            <div className="border rounded p-2">
              <h1 className="my-5 text-slate-500 font-semibold ">
                Collect Vial Data
              </h1>
              <div className="">
                <div className="flex gap-2 items-center">
                  <input type="text" autoFocus className="hidden" />
                  <p className="text-sm w-[300px] text-slate-500 p-2 border rounded">
                    {barcodeData || "YOUR BARCODE WILL SHOW UP HERE"}
                  </p>
                  <Button 
                    disabled = {!barcodeData}
                    label="Save"
                    className="rounded h-10 "
                    severity="success"
                    onClick={() => handleSaveEndocode()}
                  />
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-end gap-2 ">
              <Link to={`/endo2?id=${id}&endoId=${endoId}&edit=${editFlag ? 'yes' : 'no'}`}>
                <Button label="PREV" className="px-5 py-2 rounded" />
              </Link>
              <Link to={`/endo4?id=${id}&endoId=${endoId}&edit=${editFlag ? 'yes' : 'no'}`}>
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
    </>
  );
}
