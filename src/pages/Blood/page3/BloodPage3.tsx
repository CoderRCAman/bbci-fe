import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useSQLite } from "../../../utils/Sqlite";
import {
  IonAlert,
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
} from "@ionic/react";
import Header from "../../../components/Header";
import { DataTable } from "primereact/datatable";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import shortUUID from "short-uuid";
import { Dropdown } from "primereact/dropdown";
import { Link } from "react-router-dom";
import { set } from "date-fns";
import { validateRFTArray } from "../bHelper";
import { InputNumber } from "primereact/inputnumber";
import { saveToStore } from "../../../utils/helper";
import { checkElibleToSave } from "../../Registration/Tab11/data";
import ShowRegisteredTab from "../../../components/ShowRegisteredTab";
import { Card } from "primereact/card";
import { useBlockNavigation } from "../../../utils/blockBackNavigation";
export interface RFTType {
  test_name: string;
  result: number;
  unit: string;
  id: string;
  sampleId?: string;
  test_type?: string;
}
export default function BloodPage3() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [id, setId] = useState("");
  const [editFlag, setEditFlag] = useState(false);
  const [sampleId, setSampleId] = useState("");
  const { db, sqlite, tabId } = useSQLite();
  const [participant, setParticipants] = useState<any | null>(null);
  const [rfts, setRfts] = useState<RFTType[]>([]);
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    header: "",
    message: "",
  });
  async function fetchCurrentUser(curId: string, sampleId: string) {
    try {
      const query = `
                            select * from patients where id = '${curId}'
                        `;
      const query2 = `
                            select * from gtgh_blood_report  where sampleId = '${sampleId}' and test_type = 'RFT'
                        `;
      const res = await db?.query(query);
      const res2 = await db?.query(query2);
      console.log(res2);
      setParticipants(res?.values?.[0]);
      setRfts(
        res2?.values?.length
          ? (res2?.values as RFTType[])
          : [
            {
              test_name: "Serum Urea",
              result: 0,
              unit: "mg/dL",
              id: shortUUID().generate(),
              sampleId: sampleId,
              test_type: "RFT",
            },
            {
              test_name: "Serum Creatinine",
              result: 0,
              unit: "mg/dL",
              id: shortUUID().generate(),
              sampleId: sampleId,
              test_type: "RFT",
            },
          ]
      );
      console.log(res, curId);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    const curId = searchParams.get("id") || "";
    const edit = searchParams.get("edit") || "";
    setEditFlag(edit === "yes");
    const sampleId = searchParams.get("sampleId") || "";
    setRfts([
      {
        test_name: "Serum Urea",
        result: 0,
        unit: "mg/dL",
        id: shortUUID().generate(),
        sampleId: sampleId,
        test_type: "RFT",
      },
      {
        test_name: "Serum Creatinine",
        result: 0,
        unit: "mg/dL",
        id: shortUUID().generate(),
        sampleId: sampleId,
        test_type: "RFT",
      },
    ]);
    setSampleId(sampleId);
    setId(curId);
    if (!db) return;

    fetchCurrentUser(curId, sampleId);
  }, [location.pathname, db]);

  useBlockNavigation(isUnsaved, () => {
    setAlert({
      show: true,
      header: "Unsaved Changes",
      message: "You have unsaved changes. Please save before navigating away.",
    });
  });
  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    const curId = searchParams.get("id") || "";
    const sampleId = searchParams.get("sampleId") || "";
    await fetchCurrentUser(curId, sampleId);
    setIsUnsaved(false);
    event.detail.complete();
  };

  const handleSave = async () => {
    try {
      if (
        db &&
        editFlag &&
        !(await checkElibleToSave(
          db,
          sampleId || "",
          tabId,
          "gtgh_blood_report",
          "sampleId"
        ))
      ) {
        return setAlert({
          header: "Restricted access",
          message: "This record was registered with a different tab id.",
          show: true,
        });
      }
      const error = validateRFTArray(rfts);
      if (error) {
        return setAlert({
          show: true,
          header: "Validation Error",
          message: error,
        });
      }
      const query = `
        INSERT INTO gtgh_blood_report (id, sampleId, test_name, result,  unit, test_type , user_id, tab_id , created_at)
        VALUES (?, ?, ?, ?, ?,  ? , ?, ?, ?)   
        ON CONFLICT(id) DO UPDATE SET
          sampleId=excluded.sampleId,
          test_name=excluded.test_name,   
          result=excluded.result,         
          unit=excluded.unit,
          test_type=excluded.test_type 
      `;
      const values = rfts.map((rft) => [
        rft.id,
        rft.sampleId || sampleId,
        rft.test_name,
        rft.result,
        rft.unit,
        rft.test_type || "RFT",
        id,
        tabId,
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
        message: "Renal Function Test (RFT) saved successfully",
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <IonPage>
        <Header title={"Renal Function Test (RFT)"} />
        <IonContent fullscreen>
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent
              className="spinner-only"
              refreshingSpinner="circles"
            />
          </IonRefresher>
          <ShowRegisteredTab
            id={sampleId || ""}
            table_name="gtgh_blood_report"
            field_name="sampleId"
          />
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
                value={rfts}
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
                      placeholder="Modify"
                      type="number"
                      value={parseFloat(rowData.result).toString()}
                      className="p-2 border"
                      id="result_blood"
                      onChange={(e) => {
                        setIsUnsaved(true);
                        setRfts((prev) =>
                          prev.map((item) =>
                            item.id === rowData.id
                              ? {
                                ...item,
                                result: parseFloat(e.target.value) || 0,
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

            <div className="flex gap-2 mt-5 justify-between mt-10 ">
              <Link
                to={`/blood2?id=${id}&sampleId=${sampleId}&edit=${editFlag ? "yes" : "no"
                  }`}
              >
                <Button label="PREV" className="px-5 py-2 rounded " outlined icon="pi pi-arrow-left" />
              </Link>
              <Link
                to={`/blood4?id=${id}&sampleId=${sampleId}&edit=${editFlag ? "yes" : "no"
                  }`}
              >
                <Button label="NEXT" className="px-5 py-2 rounded" icon="pi pi-arrow-right" iconPos="right" outlined />
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
