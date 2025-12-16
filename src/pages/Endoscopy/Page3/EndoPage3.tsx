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
import { useBlockNavigation } from "../../../utils/blockBackNavigation";

export default function EndoPage3() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const { db, sqlite, tabId } = useSQLite();

  const [id, setId] = useState("");
  const [endoId, setEndoId] = useState("");
  const [editFlag, setEditFlag] = useState(false);

  const [participant, setParticipants] = useState<any | null>(null);

  // 🔹 Biopsy codes
  const [bhz, setBhz] = useState("");
  const [bgz, setBgz] = useState("");
  const [activeField, setActiveField] = useState<"bhz" | "bgz" | null>(null);

  const [collection_date, setCollectionDate] = useState<string>(
    new Date().toLocaleString("sv-SE").replace("T", " ")
  );

  const [isUnsaved, setIsUnsaved] = useState(false);

  const [alert, setAlert] = useState({
    show: false,
    header: "",
    message: "",
  });

  // ================= FETCH DATA =================
  async function fetchCurrentUser(curId: string, endoIdd: string) {
    try {
      const patientQuery = `SELECT * FROM patients WHERE id = '${curId}'`;
      const endoQuery = `SELECT * FROM endoscopy WHERE id = '${endoIdd}'`;
      const res = await db?.query(patientQuery);
      const res2 = await db?.query(endoQuery);
      console.log(res2)

      setParticipants(res?.values?.[0]);

      if (res2?.values?.[0]) {
        setBhz(res2.values[0].bhz || "");
        setBgz(res2.values[0].bgz || "");
        setCollectionDate(res2.values[0].biopsy_collection_date || collection_date);
      }
    } catch (error) {
      console.error(error);
    }
  }

  // ================= INIT =================
  useEffect(() => {
    const curId = searchParams.get("id") || "";
    const endoIdd = searchParams.get("endoId") || "";
    const edit = searchParams.get("edit") || "";

    setId(curId);
    setEndoId(endoIdd);
    setEditFlag(edit === "yes");

    if (db) fetchCurrentUser(curId, endoIdd);
  }, [location.pathname, db]);

  // ================= BARCODE SCANNER =================
  useEffect(() => {
    let buffer = "";

    const keydown = (e: KeyboardEvent) => {
      if (!activeField) return;

      if (e.key === "Enter") {
        if (activeField === "bhz") setBhz(buffer);
        if (activeField === "bgz") setBgz(buffer);

        buffer = "";
        setIsUnsaved(true);
      } else {
        buffer += e.key;
      }
    };

    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, [activeField]);

  // ================= SAVE =================
  const handleSaveEndocode = async () => {
    try {
      if (
        db &&
        editFlag &&
        !(await checkElibleToSave(db, endoId, tabId, "ENDOSCOPY"))
      ) {
        return setAlert({
          show: true,
          header: "Restricted access",
          message: "This user was registered with a different tab id.",
        });
      }

      if (!bhz && !bgz) {
        return setAlert({
          show: true,
          header: "Error",
          message: "Please scan at least one biopsy barcode.",
        });
      }

      const query = `
        UPDATE ENDOSCOPY
        SET
          bhz = '${bhz}',
          bgz = '${bgz}',
          biopsy_collection_date = '${collection_date}'
        WHERE id = '${endoId}'
      `;

      await db?.execute(query);
      await saveToStore(sqlite);

      setIsUnsaved(false);

      setAlert({
        show: true,
        header: "Success",
        message: "Biopsy vials saved successfully!",
      });
    } catch (error) {
      console.error(error);
    }
  };

  // ================= REFRESH =================
  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    fetchCurrentUser(id, endoId);
    setIsUnsaved(false);
    event.detail.complete();
  };

  // ================= BLOCK NAVIGATION =================
  useBlockNavigation(isUnsaved, () => {
    setAlert({
      show: true,
      header: "Unsaved changes",
      message: "You have unsaved changes. Please save before leaving.",
    });
  });

  return (
    <IonPage>
      <Header title="Collect Endoscopy Vials" />
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent refreshingSpinner="circles" />
        </IonRefresher>

        <ShowRegisteredTab id={endoId} table_name="ENDOSCOPY" />

        <main className="p-3 space-y-6">
          <Card title="Participant Details">
            <div className="space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span className="font-semibold">ID</span>
                <span>{participant?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Name</span>
                <span>{participant?.name}</span>
              </div>
            </div>
          </Card>

          {/* ===== BIOPSY INPUTS ===== */}
          <div className="border rounded p-3 space-y-4">
            <h2 className="font-semibold text-slate-600">Collect Biopsy Codes</h2>

            <div>
              <label className="text-sm font-semibold">Biopsy Histopathology (BHZ)</label>
              <input
                type="text"
                value={bhz}
                onFocus={() => setActiveField("bhz")}
                onChange={(e) => {
                  setBhz(e.target.value);
                  setIsUnsaved(true);
                }}
                className="w-full mt-1 p-2 border rounded"
                placeholder="Enter or scan BHZ barcode"
              />
            </div>

            <div >
              <label className="text-sm font-semibold">Biopsy Genetic Study (BGZ)</label>
              <input
                type="text"
                value={bgz}
                onFocus={() => setActiveField("bgz")}
                onChange={(e) => {
                  setBgz(e.target.value);
                  setIsUnsaved(true);
                }}
                className="w-full mt-1 mb-5 p-2 border rounded"
                placeholder="Enter or scan BGZ barcode"
              />

            </div>

            <FloatLabel >
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

            <Button
              disabled={!bhz && !bgz}
              label="Save"
              icon="pi pi-check"
              severity="success"
              onClick={handleSaveEndocode}
            />
          </div>

          <div className="flex justify-end">
            <Link
              to={`/endo2?id=${id}&endoId=${endoId}&edit=${editFlag ? "yes" : "no"}`}
              onClick={(e) => {
                if (isUnsaved) {
                  e.preventDefault();
                  setAlert({
                    show: true,
                    header: "Unsaved Changes",
                    message: "Please save before leaving.",
                  });
                }
              }}
            >
              <Button
                label="PREV"
                icon="pi pi-arrow-left"
                outlined
                severity="secondary"
              />
            </Link>
          </div>
        </main>

        <IonAlert
          isOpen={alert.show}
          header={alert.header}
          message={alert.message}
          buttons={["OK"]}
          onDidDismiss={() => setAlert((a) => ({ ...a, show: false }))}
        />
      </IonContent>
    </IonPage>
  );
}
