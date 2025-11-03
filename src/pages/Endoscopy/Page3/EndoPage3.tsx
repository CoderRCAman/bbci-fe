import {
  IonAlert,
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
} from "@ionic/react";
import Header from "../../../components/Header";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSQLite } from "../../../utils/Sqlite";
import ShortUUID from "short-uuid";
import { saveToStore } from "../../../utils/helper";
import { checkElibleToSave } from "../../Registration/Tab11/data";
import ShowRegisteredTab from "../../../components/ShowRegisteredTab";
import { Card } from "primereact/card";
import { FloatLabel } from "primereact/floatlabel";
import { Calendar } from "primereact/calendar";
import { set } from "date-fns";
import { useBlockNavigation } from "../../../utils/blockBackNavigation";
export default function EndoPage3() {
  const [barcodeData, setBarCodeData] = useState("");
  const [editFlag, setEditFlag] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [id, setId] = useState("");
  const { db, sqlite, tabId } = useSQLite();
  const [participant, setParticipants] = useState<any | null>(null);
  const [endoId, setEndoId] = useState("");
  const [collection_date, setCollectionDate] = useState<string>(
    new Date().toLocaleTimeString("sv-SE").replace("T", " ")
  );
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    header: "",
    message: "",
  });
  async function fetchCurrentUser(curId: string, endoIdd: string) {
    try {
      const query = `
                    select * from patients where id = '${curId}'
                `;
      const query2 = `
                 select * from endoscopy where id = '${endoIdd}'
                `;
      const res = await db?.query(query);
      const res2 = await db?.query(query2);
      console.log(res);
      setParticipants(res?.values?.[0]);
      setBarCodeData(res2?.values?.[0]?.vial_code);
      setCollectionDate(res2?.values?.[0]?.date);
      console.log(res2);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    const curId = searchParams.get("id") || "";
    setId(curId);
    const edit = searchParams.get("edit") || "";
    const endoIdd = searchParams.get("endoId") || "";
    setEndoId(searchParams.get("endoId") || "");
    setEditFlag(edit === "yes");

    fetchCurrentUser(curId, endoIdd);
  }, [location.pathname, db]);
  useEffect(() => {
    let buffer = "";
    const keydown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        console.log("Scanned:", buffer);
        setBarCodeData(buffer);
        buffer = "";
        setIsUnsaved(true);
      } else {
        buffer += e.key;
      }
    };
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, [location.pathname]);
  const handleSaveEndocode = async () => {
    try {
      if (
        db &&
        editFlag &&
        !(await checkElibleToSave(db, endoId || "", tabId, "ENDOSCOPY"))
      ) {
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
                   UPDATE ENDOSCOPY SET vial_code = '${barcodeData}', biopsy_collection_date = '${collection_date}' WHERE id = '${endoId}'
                `;
      await db?.execute(query);
      await saveToStore(sqlite);
      setEndoId(uid);
      setAlert({
        header: "Success",
        message: "Vial linked successfully!",
        show: true,
      });
      setIsUnsaved(false);
    } catch (error) {
      console.log(error);
    }
  };
  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    const curId = searchParams.get("id") || "";
    const endoIdd = searchParams.get("endoId") || "";
    fetchCurrentUser(curId, endoIdd);
    setIsUnsaved(false);
    event.detail.complete();
  };

  useBlockNavigation(isUnsaved, () => {
    setAlert({
      show: true,
      header: "Unsaved changes",
      message: "You have unsaved changes. Please save before leaving.",
    });
  });
  return (
    <>
      <IonPage>
        <Header title={"Collect Endoscopy Vial "} />
        <IonContent class="" fullscreen>
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent
              className="spinner-only"
              refreshingSpinner="circles"
            />
          </IonRefresher>
          <ShowRegisteredTab id={endoId || ""} table_name="ENDOSCOPY" />
          <main className="p-2 space-y-10">
            <Card title="Participant's Details" className="shadow border">
              <div className="text-slate-600 dark:text-gray-300 space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold">ID: </span>
                  <span>{participant?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Name: </span>
                  <span>{participant?.name}</span>
                </div>
              </div>
            </Card>
            <div className="border rounded p-2">
              <div>
                <h2 className=" text-slate-500 font-semibold ">
                  Collect Biopsy code
                </h2>
                <div className="">
                  <div className="flex gap-2 items-center">
                    <input type="text" autoFocus className="hidden" />
                    <p className="text-sm w-[300px] text-slate-500 p-2 border rounded">
                      {barcodeData || "YOUR BARCODE WILL SHOW UP HERE"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-7">
                <FloatLabel>
                  <Calendar
                    value={new Date(collection_date)}
                    onChange={(e) => {
                      setIsUnsaved(true);
                      setCollectionDate(
                        e.value?.toLocaleString("sv-SE").replace("T", " ") || ""
                      );
                    }}
                    showIcon
                    className="w-full"
                  />
                  <label>Sample collection date</label>
                </FloatLabel>
              </div>
              <Button
                disabled={!barcodeData}
                label="Save"
                className="rounded h-10 mt-3 "
                severity="success"
                icon="pi pi-check"
                onClick={() => handleSaveEndocode()}
              />
            </div>

            <div className="mt-10 flex justify-end gap-2 ">
              <Link
                to={`/endo2?id=${id}&endoId=${endoId}&edit=${
                  editFlag ? "yes" : "no"
                }`}
                onClick={(e) => {
                  if (isUnsaved) {
                    e.preventDefault();
                    setAlert({
                      show: true,
                      header: "Unsaved Changes",
                      message:
                        "You have unsaved changes. Please save before leaving the page.",
                    });
                  }
                }}
              >
                <Button
                  label="PREV"
                  className="px-5 py-2 rounded"
                  severity="secondary"
                  icon="pi pi-arrow-left"
                  outlined
                />
              </Link>
              {/* <Link to={`/endo4?id=${id}&endoId=${endoId}&edit=${editFlag ? 'yes' : 'no'}`}>
                <Button label="NEXT" className="px-5 py-2 rounded" />
              </Link> */}
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
