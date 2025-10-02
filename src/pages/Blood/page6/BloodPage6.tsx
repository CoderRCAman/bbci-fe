import { IonContent, IonPage } from "@ionic/react";
import Header from "../../../components/Header";
import { useLocation } from "react-router";
import { useEffect, useState } from "react";
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
import shortUUID from "short-uuid";

export default function BloodPage6() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [id, setId] = useState("");
  const [sampleId, setSampleId] = useState("");
  const { db, sqlite } = useSQLite();
  const [participant, setParticipants] = useState<any | null>(null);
  const [biochem, setBiochem] = useState<RFTType[]>([]);
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
    setBiochem([
      {
        sampleId: sampleId,
        test_name: "Uric Acid",
        result: 0,
        hl_flag: "",
        unit: "mg/dL",
        bio_ref_interval: "",
        id: shortUUID().generate(),
      },
    ]);
    // setBiochem(getInitialDataSet(sampleId));
    if (!db) return;
    async function fetchCurrentUser() {
      try {
        console.log(sampleId);
        const query = `
                              select * from patients where id = '${curId}'
                          `;
        const res = await db?.query(query);
        setParticipants(res?.values?.[0]);
        console.log(res, curId);
      } catch (error) {
        console.log(error);
      }
    }
    fetchCurrentUser();
  }, [location.pathname, db]);
  return (
    <div>
      <IonPage>
        <Header title={"Biochemistry test"} />
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
                value={biochem}
                tableStyle={{ minWidth: "60rem" }}
                // tableClassName="p-datatable-gridlines"
                showGridlines
                size="normal"
                className="border !border-b-0"
                scrollable
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
                      keyfilter="int"
                      value={rowData.result}
                      className="border p-2 "
                      onChange={(e) =>
                        setBiochem((prev) =>
                          prev.map((item) =>
                            item.id === rowData.id
                              ? {
                                  ...item,
                                  result: parseInt(e.target.value) || 0,
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
                        setBiochem((prev) =>
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
                        setBiochem((prev) =>
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
                        { name: "10^3/uL", value: "10^3/uL" },
                        { name: "%", value: "%" },
                        { name: "10^6/uL", value: "10^6/uL" },
                        { name: "g/dL", value: "g/dL" },
                        { name: "10^3/uL", value: "10^3/uL" },
                        { name: "fL", value: "fL" },
                        { name: "pg", value: "pg" },
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
                        setBiochem((prev) =>
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
              />
            </div>

            <div className="flex gap-2 mt-5 justify-end ">
              <Link to={`/blood5?id=${id}&sampleId=${sampleId}`}>
                <Button label="PREV" className="px-5 py-2 rounded" />
              </Link>
              <Link to={`/blood7?id=${id}&sampleId=${sampleId}`}>
                <Button label="NEXT" className="px-5 py-2 rounded" />
              </Link>
            </div>
          </main>
        </IonContent>
      </IonPage>
    </div>
  );
}
