import {
  IonAlert,
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
} from "@ionic/react";
import Header from "../../../components/Header";
import { useLocation } from "react-router";
import { useEffect, useState } from "react";
import { useSQLite } from "../../../utils/Sqlite";
import { RFTType } from "../page3/BloodPage3";
import { getInitialDataSet } from "./helper";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";
import { validateRFTArray } from "../bHelper";
import { saveToStore } from "../../../utils/helper";
import { InputText } from "primereact/inputtext";
import { checkElibleToSave } from "../../Registration/Tab11/data";
import ShowRegisteredTab from "../../../components/ShowRegisteredTab";
import { set } from "date-fns";
import { Card } from "primereact/card";
import { useBlockNavigation } from "../../../utils/blockBackNavigation";

export default function BloodPage4() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [id, setId] = useState("");
  const [sampleId, setSampleId] = useState("");
  const [editFlag, setEditFlag] = useState(false);
  const { db, sqlite, tabId } = useSQLite();
  const [participant, setParticipants] = useState<any | null>(null);
  const [lfts, setLfts] = useState<RFTType[]>([]);
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    header: "",
    message: "",
  });
  async function fetchCurrentUser(curId: string, sampleId: string) {
    try {
      console.log(sampleId);
      const query = `
                          select * from patients where id = '${curId}'
                        `;
      const query2 = `
                          select * from gtgh_blood_report  where sampleId = '${sampleId}' and test_type = 'LFT'
                        `;
      const res = await db?.query(query);
      const res2 = await db?.query(query2);
      console.log(res2);
      setParticipants(res?.values?.[0]);
      setLfts(
        res2?.values?.length
          ? (res2?.values as RFTType[])
          : getInitialDataSet(sampleId)
      );
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    const curId = searchParams.get("id") || "";
    const sampleId = searchParams.get("sampleId") || "";
    const edit = searchParams.get("edit") || "";
    setId(curId);
    setSampleId(sampleId);
    setLfts(getInitialDataSet(sampleId));
    setEditFlag(edit === "yes");
    if (!db) return;
    fetchCurrentUser(curId, sampleId);
  }, [location.pathname, db]);
  useBlockNavigation(isUnsaved, () => {
    setAlert({
      show: true,
      header: "Unsaved Changes",
      message: "You have unsaved changes. Please save before leaving the page.",
    });
  });
  const handleSave = async () => {
    try {
      if (
        db &&
        editFlag &&
        !(await checkElibleToSave(db, sampleId || "", tabId, "blood_sample"))
      ) {
        return setAlert({
          header: "Restricted access",
          message: "This user was registered with a different tab id.",
          show: true,
        });
      }

      const error = validateRFTArray(lfts);
      if (error) {
        return setAlert({
          show: true,
          header: "Validation Error",
          message: error,
        });
      }

      const query = `
        INSERT INTO gtgh_blood_report (id, sampleId, test_name, result,  unit, test_type , user_id , created_at)
        VALUES (?, ?, ?, ?, ?,  ? , ? , ?)   
        ON CONFLICT(id) DO UPDATE SET
          sampleId=excluded.sampleId,
          test_name=excluded.test_name,   
          result=excluded.result,         
          unit=excluded.unit,
          test_type=excluded.test_type
      `;
      const values = lfts.map((rft) => [
        rft.id,
        rft.sampleId || sampleId,
        rft.test_name,
        rft.result,
        rft.unit,
        rft.test_type || "LFT",
        id,
        new Date().toLocaleString("sv-SE").replace("T", " "),
      ]);
      for (let i = 0; i < values.length; i++) {
        const params = values[i];
        await db?.run(query, params);
      }
      await saveToStore(sqlite);
      setIsUnsaved(false);
      setAlert({
        show: true,
        header: "Success",
        message: "Liver Function Test (LFT) saved successfully",
      });
    } catch (error) {
      console.log(error);
    }
  };
  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    const curId = searchParams.get("id") || "";
    const sampleId = searchParams.get("sampleId") || "";
    await fetchCurrentUser(curId, sampleId);
    setIsUnsaved(false);
    event.detail.complete();
  };
  return (
    <div>
      <IonPage>
        <Header title={"Liver Function test"} />
        <IonContent fullscreen>
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent
              className="spinner-only"
              refreshingSpinner="circles"
            />
          </IonRefresher>
          <ShowRegisteredTab id={sampleId || ""} table_name="blood_sample" />
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
            <div className="mt-10">
              <DataTable
                value={lfts}
                tableStyle={{ minWidth: "10rem" }}
                // tableClassName="p-datatable-gridlines"
                showGridlines
                size="normal"
                className="border !border-b-0"
              >
                <Column
                  style={{ fontSize: "0.8rem" }}
                  bodyClassName="border-b border-gray-300 "
                  field="test_name"
                  header="Test Name"
                ></Column>
                <Column
                  style={{ fontSize: "0.8rem" }}
                  bodyClassName="border-b border-gray-300 "
                  field="result"
                  header="Result"
                  body={(rowData) => (
                    <InputText
                      placeholder=""
                      type="number"
                       value={parseFloat(rowData.result).toString()}
                      className="p-2 border"
                      id="result_blood"
                      onChange={(e) => {
                        setIsUnsaved(true);
                        setLfts((prev) =>
                          prev.map((item) =>
                            item.id === rowData.id
                              ? {
                                  ...item,
                                  result: e.target.value === "" ? "" : parseFloat(e.target.value),
                                }
                              : item
                          )
                        );
                      }}
                    />
                  )}
                ></Column>
                <Column
                  style={{ fontSize: "0.8rem" }}
                  bodyClassName="border-b border-gray-300"
                  field="unit"
                  header="Unit"
                  body={(rowData) => <div>{rowData.unit}</div>}
                ></Column>
              </DataTable>
            </div>
            <div className="mt-5">
              <Button
                onClick={handleSave}
                label="Save"
                className="px-10 py-2 rounded"
                severity="success"
                icon="pi pi-check"
              />
            </div>

            <div className="flex gap-2 mt-10 justify-between ">
              <Link
                to={`/blood3?id=${id}&sampleId=${sampleId}&edit=${
                  editFlag ? "yes" : "no"
                }`}
              >
                <Button label="PREV" className="px-5 py-2 rounded" outlined icon="pi pi-arrow-left"  />
              </Link>
              <Link
                to={`/blood5?id=${id}&sampleId=${sampleId}&edit=${
                  editFlag ? "yes" : "no"
                }`}
              >
                <Button label="NEXT" className="px-5 py-2 rounded" outlined icon="pi pi-arrow-right" iconPos="right" />
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
        <div className="pb-[250px]"></div>
      </IonPage>
    </div>
  );
}
