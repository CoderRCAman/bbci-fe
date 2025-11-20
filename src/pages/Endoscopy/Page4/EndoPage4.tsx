import {
  IonAlert,
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
} from "@ionic/react";
import Header from "../../../components/Header";
import { Ref, useEffect, useState } from "react";
import { useSQLite } from "../../../utils/Sqlite";
import { useLocation, useHistory } from "react-router";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";
import { saveToStore } from "../../../utils/helper";
import { checkElibleToSave } from "../../Registration/Tab11/data";
import ShowRegisteredTab from "../../../components/ShowRegisteredTab";
import { Card } from "primereact/card";
import { Calendar } from "primereact/calendar";
import shortUUID from "short-uuid";
import { useBlockNavigation } from "../../../utils/blockBackNavigation";
import { set } from "date-fns";

export default function EndoPage4() {
  const location = useLocation();
  const history = useHistory();
  const [videoFileName, setVideoFileName] = useState("");
  const [pdfFileName, setPdfFileName] = useState("");
  const [endoscopyDate, setEndoscopyDate] = useState("");
  const searchParams = new URLSearchParams(location.search);
  const [id, setId] = useState("");
  const [editFlag, setEditFlag] = useState(false);
  const { db, sqlite, tabId } = useSQLite();
  const [participant, setParticipants] = useState<any | null>(null);
  const [allowNext, setAllowNext] = useState(false);
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [endoId, setEndoId] = useState(
    new Date().toLocaleString("sv-SE").replace("T", " ")
  );
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
      setParticipants(res?.values?.[0]);
      const val = res2?.values?.[0];
      console.log(val);
      if (res2?.values?.length) {
        setAllowNext(true);
      }
      setVideoFileName(val?.endoscopy_video_filename || "");
      setPdfFileName(val?.endoscopy_pdf_filename || "");
      setEndoscopyDate(
        val?.date || new Date().toLocaleString("sv-SE").replace("T", " ")
      );
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    const curId = searchParams.get("id") || "";
    const endoIdd = searchParams.get("endoId") || "";
    const edit = searchParams.get("edit") || "";
    setId(curId);
    setEndoId(searchParams.get("endoId") || "");
    setEditFlag(edit === "yes");
    if (!endoIdd) {
      setEndoId(shortUUID().generate());
    }
    fetchCurrentUser(curId, endoIdd);
  }, [location.pathname, db]);
  const AddMediaReportFilenames = async () => {
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
      if (!videoFileName?.trim() && !pdfFileName?.trim()) {
        setAlert({
          header: "Error",
          message: "Missing video or pdf report!",
          show: true,
        });
        return;
      }
      const query = `
              INSERT INTO ENDOSCOPY (id, endoscopy_video_filename, endoscopy_pdf_filename , date , user_id , tab_id,  created_at)
              VALUES ('${endoId}', '${videoFileName}', '${pdfFileName}' , '${endoscopyDate}' , '${id}' , '${tabId}' , '${new Date()
        .toLocaleString("sv-SE")
        .replace("T", " ")}')
                    ON CONFLICT(id) DO UPDATE SET
                        endoscopy_video_filename = excluded.endoscopy_video_filename,
                        endoscopy_pdf_filename = excluded.endoscopy_pdf_filename,
                        date = excluded.date;
            `;
      await db?.execute(query);
      await saveToStore(sqlite);
      const params = new URLSearchParams(location.search);
      params.set("endoId", endoId); // add or update
      params.set("edit", "yes"); // add or update
      history.replace({
        pathname: location.pathname,
        search: params.toString(),
      }); 
      setIsUnsaved(false);
      setAllowNext(true);
      setAlert({
        header: "Success",
        message: "Endoscopy report saved successfully!",
        show: true,
      }); 
    } catch (error) {
      console.log(error);
    }
  };
  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    const curId = searchParams.get("id") || "";
    const endoIdd = searchParams.get("endoId") || ""; 
    setIsUnsaved(false);
    fetchCurrentUser(curId, endoIdd);
    event.detail.complete();
  };
  useBlockNavigation(isUnsaved, () => {
    setAlert({
      show: true,
      header: "Unsaved Changes",
      message: "You have unsaved changes. Please save before leaving.",
    });
  });
  return (
    <>
      <IonPage>
        <Header title={"Collect VIDEO report / PDF report"} />
        <IonContent class="" fullscreen>
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent
              className="spinner-only"
              refreshingSpinner="circles"
            />
          </IonRefresher>
          <ShowRegisteredTab id={endoId} table_name="ENDOSCOPY" />
          <main className="p-2">
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
            <div className="mt-10 border shadow rounded p-2">
              <div className="mt-5 space-y-7">
                <FloatLabel>
                  <Calendar
                    value={new Date(endoscopyDate)}
                    onChange={(e) => {
                      setIsUnsaved(true);
                      setEndoscopyDate(
                        e.value?.toLocaleString("sv-SE").replace("T", " ") || ""
                      );
                    }}
                    showIcon
                    className="w-full"
                  />
                  <label>Endoscopy date</label>
                </FloatLabel>
                <FloatLabel>
                  <InputText
                    value={videoFileName}
                    className="border-1 p-2 w-[400px]"
                    onChange={(e) => {
                      setVideoFileName(e.target.value);
                      setIsUnsaved(true);
                    }}
                  />
                  <label>Endoscopy video footage filename</label>
                </FloatLabel>
                <FloatLabel>
                  <InputText
                    value={pdfFileName}
                    className="border-1 p-2 w-[400px]"
                    onChange={(e) => {
                      setPdfFileName(e.target.value);
                      setIsUnsaved(true);
                    }}
                  />
                  <label>Endoscopy pdf footage filename</label>
                </FloatLabel>
              </div>
              <Button
                label="Save"
                severity="success"
                icon="pi pi-check"
                className="px-10 py-2 mt-2"
                disabled={!videoFileName?.trim() && !pdfFileName?.trim()}
                onClick={() => AddMediaReportFilenames()}
              />
            </div>
            <div className="flex justify-between mt-20 gap-2 ">
              <Link
                to={`/endo1?id=${id}&endoId=${endoId}&edit=${
                  editFlag ? "yes" : "no"
                }`}
                onClick={(e) => {
                  if (isUnsaved) {
                    e.preventDefault();
                    setAlert({
                      show: true,
                      header: "Unsaved Changes",
                      message:
                        "You have unsaved changes. Please save before proceeding to the previous page.",
                    });
                  }
                }}
              >
                <Button
                  label="PREV"
                  className="px-10 py-2 rounded"
                  severity="secondary"
                  outlined
                  icon="pi pi-arrow-left"
                />
              </Link>
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
                        "You have unsaved changes. Please save before proceeding to the next page.",
                    });
                  }
                  if (!allowNext) e.preventDefault();
                }}
              >
                <Button
                  disabled={!allowNext}
                  label="NEXT"
                  className="px-10 py-2 rounded"
                  severity="secondary"
                  outlined
                  icon="pi pi-arrow-right"
                  iconPos="right"
                />
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
