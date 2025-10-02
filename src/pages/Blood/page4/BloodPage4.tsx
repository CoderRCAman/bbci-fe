import { IonAlert, IonContent, IonPage } from "@ionic/react";
import Header from "../../../components/Header";
import { useLocation } from "react-router";
import { useEffect, useState } from "react";
import { useSQLite } from "../../../utils/Sqlite";
import { RFTType } from "../page3/BloodPage3";
import { get } from "react-hook-form";
import { getInitialDataSet } from "./helper";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";
import { validateRFTArray } from "../bHelper";
import { InputNumber } from "primereact/inputnumber";

export default function BloodPage4() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [id, setId] = useState("");
  const [sampleId, setSampleId] = useState("");
  const { db, sqlite } = useSQLite();
  const [participant, setParticipants] = useState<any | null>(null);
  const [lfts, setLfts] = useState<RFTType[]>([]);
  const [alert, setAlert] = useState({
    show: false,
    header: "",
    message: "",
  });
  useEffect(() => {
    const curId = searchParams.get("id") || "";
    const sampleId = searchParams.get("sampleId") || "";
    setId(curId);
    setSampleId(sampleId);
    setLfts(getInitialDataSet(sampleId));
    if (!db) return;
    async function fetchCurrentUser() {
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
    fetchCurrentUser();
  }, [location.pathname, db]);
  const handleSave = async () => {
    try {
      const error = validateRFTArray(lfts);
      if (error) {
        return setAlert({
          show: true,
          header: "Validation Error",
          message: error,
        });
      }

      const query = `
          INSERT INTO gtgh_blood_report (id, sampleId, test_name, result, hl_flag, unit, bio_ref_interval, test_type)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)   
          ON CONFLICT(id) DO UPDATE SET
            sampleId=excluded.sampleId,
            test_name=excluded.test_name,   
            result=excluded.result,
            hl_flag=excluded.hl_flag,
            unit=excluded.unit,
            bio_ref_interval=excluded.bio_ref_interval,
            test_type=excluded.test_type
        `;
      const values = lfts.map((rft) => [
        rft.id,
        rft.sampleId || sampleId,
        rft.test_name,
        rft.result,
        rft.hl_flag,
        rft.unit,
        rft.bio_ref_interval,
        rft.test_type || "LFT",
      ]);
      for (let i = 0; i < values.length; i++) {
        const params = values[i];
        await db?.run(query, params);
      }
      await sqlite?.saveToStore("patientdb");
      console.log(values);
      setAlert({
        show: true,
        header: "Success",
        message: "Liver function test (LFT) saved successfully",
      });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <IonPage>
        <Header title={"Liver Function test"} />
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
                value={lfts}
                tableStyle={{ minWidth: "60rem" }}
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
                        setLfts((prev) =>
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
                  field="h_l_flag"
                  header="H/L Flag"
                  body={(rowData) => (
                    <Dropdown
                      appendTo={document.body}
                      onChange={(e) =>
                        setLfts((prev) =>
                          prev.map((item) =>
                            item.id === rowData.id
                              ? { ...item, hl_flag: e.target.value }
                              : item
                          )
                        )
                      }
                      optionLabel="name"
                      optionValue="value"
                      className="border h-10 flex items-center"
                      placeholder="Select"
                      value={rowData.hl_flag}
                      options={[
                        { name: "L", value: "L" },
                        { name: "N", value: "N" },
                      ]}
                    />
                  )}
                ></Column>
                <Column
                  style={{ fontSize: "0.8rem" }}
                  bodyClassName="border-b border-gray-300"
                  field="unit"
                  header="Unit"
                  body={(rowData) => (
                    <Dropdown
                      appendTo={document.body}
                      onChange={(e) =>
                        setLfts((prev) =>
                          prev.map((item) =>
                            item.id === rowData.id
                              ? { ...item, unit: e.target.value }
                              : item
                          )
                        )
                      }
                      value={rowData.unit}
                      optionLabel="name"
                      optionValue="value"
                      className="border h-10 flex items-center"
                      placeholder="Select"
                      options={[
                        { name: "mg/dL", value: "mg/dL" },
                        { name: "U/L", value: "U/L" },
                        { name: "g/dL", value: "d/dL" },
                      ]}
                    />
                  )}
                ></Column>
                <Column
                  style={{ fontSize: "0.8rem" }}
                  bodyClassName="border-b border-gray-300"
                  field="bio_ref_interval"
                  header="Biological Reference interval"
                  body={(rowData) => (
                    <InputText
                      placeholder="Modify"
                      value={rowData.bio_ref_interval}
                      className="border p-2 "
                      onChange={(e) =>
                        setLfts((prev) =>
                          prev.map((item) =>
                            item.id === rowData.id
                              ? { ...item, bio_ref_interval: e.target.value }
                              : item
                          )
                        )
                      }
                    />
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
              <Link to={`/blood3?id=${id}&sampleId=${sampleId}`}>
                <Button label="PREV" className="px-5 py-2 rounded" />
              </Link>
              <Link to={`/blood5?id=${id}&sampleId=${sampleId}`}>
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
