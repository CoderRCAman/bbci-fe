import { IonAlert, IonContent, IonPage } from "@ionic/react";
import Header from "../../../components/Header";
import { useLocation } from "react-router";
import { useEffect, useRef, useState } from "react";
import { useSQLite } from "../../../utils/Sqlite";
import { RFTType } from "../page3/BloodPage3";
import { get } from "react-hook-form";
// import { getInitialDataSet } from "./helper";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";
import { getInitialDataSet } from "./helper";
import { InputNumber } from "primereact/inputnumber";
import { validateRFTArray } from "../bHelper";
import { saveToStore } from "../../../utils/helper";

export default function BloodPage5() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [id, setId] = useState("");
  const [sampleId, setSampleId] = useState("");
  const { db, sqlite } = useSQLite();
  const [participant, setParticipants] = useState<any | null>(null);
  const [cbcs, setCbcs] = useState<RFTType[]>([]);
  const [alert, setAlert] = useState({
    show: false,
    header: "",
    message: "",
  });
  useEffect(() => {
    const curId = searchParams.get("id") || "";
    const sampleId = searchParams.get("sampleId") || "";
    setSampleId(sampleId);
    setId(curId);
    setCbcs(getInitialDataSet(sampleId));
    if (!db) return;
    async function fetchCurrentUser() {
      try {
        const query = `
                                   select * from patients where id = '${curId}'
                               `;
        const query2 = `
                                   select * from gtgh_blood_report  where sampleId = '${sampleId}' and test_type = 'CBC'
                               `;
        const res = await db?.query(query);
        const res2 = await db?.query(query2);
        console.log(res2);
        setParticipants(res?.values?.[0]);
        setCbcs(
          res2?.values?.length
            ? (res2?.values as RFTType[])
            : getInitialDataSet(sampleId)
        );
        console.log(res, curId);
      } catch (error) {
        console.log(error);
      }
    }
    fetchCurrentUser();
  }, [location.pathname, db]);
  const handleSave = async () => {
    try {
      const error = validateRFTArray(cbcs);
      if (error) {
        return setAlert({
          show: true,
          header: "Validation Error",
          message: error,
        });
      }

      const query = `
        INSERT INTO gtgh_blood_report (id, sampleId, test_name, result,  unit, test_type)
        VALUES (?, ?, ?, ?, ?,  ?)   
        ON CONFLICT(id) DO UPDATE SET
          sampleId=excluded.sampleId,
          test_name=excluded.test_name,   
          result=excluded.result,         
          unit=excluded.unit,
          test_type=excluded.test_type
      `;
      const values = cbcs.map((rft) => [
        rft.id,
        rft.sampleId || sampleId,
        rft.test_name,
        rft.result,
        rft.unit,
        rft.test_type || "CBC",
      ]);
      for (let i = 0; i < values.length; i++) {
        const params = values[i];
        await db?.run(query, params);
      }
      await saveToStore(sqlite)
      console.log(values);
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
        <Header title={"Complete Blood Count test"} />
        <IonContent fullscreen>
          <main className="p-2">
            <div className="p-2 shadow border rounded text-slate-600">
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
            <div className="mt-10">
              <DataTable
                value={cbcs}
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
                    <InputNumber
                      placeholder="Modify"
                      value={rowData.result}
                      minFractionDigits={0}
                      maxFractionDigits={2}
                      className=""
                      id="result_blood"
                      onChange={(e) =>
                        setCbcs((prev) =>
                          prev.map((item) =>
                            item.id === rowData.id
                              ? {
                                ...item,
                                result: e.value || 0,
                              }
                              : item
                          )
                        )
                      }
                    />
                  )}
                ></Column>
                <Column
                  style={{ fontSize: "0.8rem" }}
                  bodyClassName="border-b border-gray-300"
                  field="unit"
                  header="Unit"
                  body={(rowData) => (
                    <div>
                      {rowData.unit}
                    </div>
                  )}
                ></Column>

              </DataTable>
            </div>
            <div className="mt-5">
              <Button
                label="Save"
                className="px-10 py-2 rounded"
                severity="success"
                onClick={handleSave}
              />
            </div>

            <div className="flex gap-2 mt-5 justify-end ">
              <Link to={`/blood4?id=${id}&sampleId=${sampleId}`}>
                <Button label="PREV" className="px-5 py-2 rounded" />
              </Link>
              <Link to={`/blood6?id=${id}&sampleId=${sampleId}`}>
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
    </div>
  );
}
