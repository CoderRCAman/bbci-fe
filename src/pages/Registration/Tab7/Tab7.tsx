import { IonAlert, IonContent, IonPage } from "@ionic/react";
import Header from "../../../components/Header";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import shortUUID from "short-uuid";
import { Dropdown } from "primereact/dropdown";
import { hasMasterData, hasRelativeData, relatives } from "./data";
import { useSQLite } from "../../../utils/Sqlite";
import { saveToStore } from "../../../utils/helper";
export type FAMILY_HISTORY_OF_CANCER_MASTER = {
  id: string;
  user_id: string;
  brothers: number;
  sisters: number;
  sons: number;
  daughters: number;
  history_of_cancer: number; // 0 or 1 
}

export type FAMILY_HISTORY_OF_CANCER_RELATIVES = {
  id: string;
  user_id: string;
  relation: string;
  code: number;
  age_at_diagnosis: number;
  cancer_site: string;
  treatment_received: number; // 0 or 1 
}

const initialState: FAMILY_HISTORY_OF_CANCER_MASTER[] = [{
  id: shortUUID().generate(),
  user_id: '',
  brothers: 0,
  sisters: 0,
  sons: 0,
  daughters: 0,
  history_of_cancer: 0,
}]

const initialStateRelatives: FAMILY_HISTORY_OF_CANCER_RELATIVES[] = [{
  id: shortUUID().generate(),
  relation: '',
  code: 0,
  age_at_diagnosis: 0,
  cancer_site: '',
  treatment_received: 0,
  user_id: ''
}]

export default function Tab7() {
  const [id, setId] = useState<string | null>("");
  const { db, sqlite } = useSQLite();
  const searchParams = new URLSearchParams(location.search);
  const [familyHistoryMaster, setfamilyHistoryMaster] = useState(initialState);
  const [familyHistoryRelatives, setfamilyHistoryRelatives] = useState(initialStateRelatives);
  const [alert, setAlert] = useState({
    show: false,
    header: "",
    message: "",
  });
  useEffect(() => {
    const currentId = searchParams?.get("id")
    setId(currentId);
    async function fetchInitialState() {
      try {
        const res1 = await db?.query(`
           select * from FAMILY_HISTORY_OF_CANCER_MASTER where user_id = '${currentId}'
          `)
        if (res1?.values && res1?.values?.length > 0) {
          setfamilyHistoryMaster(res1?.values as FAMILY_HISTORY_OF_CANCER_MASTER[])
        }
        else {
          setfamilyHistoryMaster(initialState)
        }
        const res2 = await db?.query(`
           select * from FAMILY_HISTORY_OF_CANCER_RELATIVES where user_id = '${currentId}'
          `)
        if (res2?.values && res2?.values?.length > 0) {
          setfamilyHistoryRelatives(res2?.values as FAMILY_HISTORY_OF_CANCER_RELATIVES[])
        }
        else {
          setfamilyHistoryRelatives(initialStateRelatives)
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchInitialState();
  }, [location.pathname, db]);
  const handleAddNewUi = () => {
    const translator = shortUUID();
    const newRelatives: FAMILY_HISTORY_OF_CANCER_RELATIVES = {
      id: translator.new(),
      relation: '',
      code: 0,
      age_at_diagnosis: 0,
      cancer_site: '',
      treatment_received: 0,
      user_id: ''
    };
    setfamilyHistoryRelatives((d) => [...d, newRelatives]);
  }
  const handleRemoveUi = (id: string) => {
    if (familyHistoryRelatives.length === 1) return;
    setfamilyHistoryRelatives((d) => d.filter((x) => x.id !== id));
  }
  const handleChangeRelative = (id: string, field: string, value: any) => {
    setfamilyHistoryRelatives((d) =>
      d.map((item) => (item.id == id ? { ...item, [field]: value } : item))
    );
  }
  const handleChangeMaster = (id: string, field: string, value: any) => {
    setfamilyHistoryMaster((d) =>
      d.map((item) => (item.id == id ? { ...item, [field]: value } : item))
    );
  }

  const handleSave = async () => {
    try {
      if (hasMasterData(familyHistoryMaster[0])) {
        console.log('oihoi')

        const query = `
                    INSERT INTO FAMILY_HISTORY_OF_CANCER_MASTER (
                      id,
                      user_id,
                      brothers,
                      sisters,
                      sons,
                      daughters,
                      history_of_cancer
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                      user_id = excluded.user_id,
                      brothers = excluded.brothers,
                      sisters = excluded.sisters,
                      sons = excluded.sons,
                      daughters = excluded.daughters,
                      history_of_cancer = excluded.history_of_cancer;
                  `;

        const values = [
          familyHistoryMaster[0].id,
          id,
          familyHistoryMaster[0].brothers,
          familyHistoryMaster[0].sisters,
          familyHistoryMaster[0].sons,
          familyHistoryMaster[0].daughters,
          familyHistoryMaster[0].history_of_cancer
        ];

        await db?.run(query, values);
      }

      for (const item of familyHistoryRelatives) {
        if (hasRelativeData(item)) {
          console.log('oihoi')
          const query = `
                          INSERT INTO FAMILY_HISTORY_OF_CANCER_RELATIVES (
                            id,
                            user_id,
                            relation,
                            code,
                            age_at_diagnosis,
                            cancer_site,
                            treatment_received
                          ) VALUES (?, ?, ?, ?, ?, ?, ?)
                          ON CONFLICT(id) DO UPDATE SET
                            user_id = excluded.user_id,
                            relation = excluded.relation,
                            code = excluded.code,
                            age_at_diagnosis = excluded.age_at_diagnosis,
                            cancer_site = excluded.cancer_site,
                            treatment_received = excluded.treatment_received;
                        `;

          const values = [
            item.id,
            id,
            item.relation,
            item.code,
            item.age_at_diagnosis,
            item.cancer_site,
            item.treatment_received
          ];

          await db?.run(query, values);
        }

      }
      setAlert({
        show: true,
        header: "Success!",
        message: "Data saved successfully!",
      })
      await saveToStore(sqlite);
    } catch (error) {
      console.log(error);
      setAlert({
        show: true,
        header: "Error!",
        message: "Something went wrong during synch back!",
      })
    }

  }
  return (
    <IonPage>
      <Header
        title={0 ? "Edit Family History of Cancer" : "Family History of Cancer"}
      />
      <IonContent class="" fullscreen>
        <main className="p-2 text-slate-600">
          <DataTable value={familyHistoryMaster}
            tableStyle={{ minWidth: '6rem' }}
            rows={10}
            showGridlines
            size='normal'
            className="border !border-b-0"
            header={() => <h1 className="text-slate-500 font-semibold">How many first degree relatives?</h1>}
          >
            <Column field="brothers" header="Brothers"
              bodyClassName="border-y border-gray-300 "
              body={(rowData) => <InputText
                keyfilter={'int'}
                placeholder="Brothers"
                className="border-1 p-2 "
                value={rowData.brothers}
                onChange={e => handleChangeMaster(rowData.id, 'brothers', isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value))}
              />}
            ></Column>
            <Column field="sisters" header="Sisters"
              bodyClassName="border-y border-gray-300 "
              body={(rowData) => <InputText
                keyfilter={'int'}
                placeholder="Sisters"
                className="border-1 p-2 "
                value={rowData.sisters}
                onChange={e => handleChangeMaster(rowData.id, 'sisters', isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value))}
              />}
            ></Column>
            <Column field="sons" header="Sons"
              bodyClassName="border-y border-gray-300 "
              body={(rowData) => <InputText
                keyfilter={'int'}
                placeholder="Sons"
                className="border-1 p-2 "
                value={rowData.sons}
                onChange={e => handleChangeMaster(rowData.id, 'sons', isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value))}
              />}
            ></Column>
            <Column field="daughters" header="Daughters"
              bodyClassName="border-y border-gray-300 "
              body={(rowData) => <InputText
                keyfilter={'int'}
                placeholder="Daughters"
                className="border-1 p-2 "
                value={rowData.daughters}
                onChange={e => handleChangeMaster(rowData.id, 'daughters', isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value))}
              />}
            ></Column>

          </DataTable>
          <div className="mt-5 border rounded p-2">
            <p className="text-slate-500 ">Has there been any history of cancer in any of your first degree relatives?</p>
            <div className="flex gap-4 items-center  text-md">
              <div className="space-x-2">
                <input
                  type="radio"
                  value={1}
                  checked={familyHistoryMaster?.[0]?.history_of_cancer === 1}
                  onChange={(e) =>
                    setfamilyHistoryMaster([{ ...familyHistoryMaster[0], history_of_cancer: parseInt(e.target.value) }])
                  }
                />
                <span>YES </span>
              </div>
              <div className="space-x-2">
                <input
                  type="radio"
                  value={2}
                  checked={familyHistoryMaster?.[0]?.history_of_cancer === 2}
                  onChange={(e) =>
                    setfamilyHistoryMaster([{ ...familyHistoryMaster[0], history_of_cancer: parseInt(e.target.value) }])
                  }
                />
                <span>NO </span>
              </div>
              <div className="space-x-2">
                <input
                  type="radio"
                  value={8}
                  checked={familyHistoryMaster?.[0]?.history_of_cancer === 8}
                  onChange={(e) =>
                    setfamilyHistoryMaster([{ ...familyHistoryMaster[0], history_of_cancer: parseInt(e.target.value) }])
                  }
                />
                <span>DON'T KNOW </span>
              </div>
              <div className="space-x-2">
                <input
                  type="radio"
                  value={9}
                  checked={familyHistoryMaster?.[0]?.history_of_cancer === 9}
                  onChange={(e) =>
                    setfamilyHistoryMaster([{ ...familyHistoryMaster[0], history_of_cancer: parseInt(e.target.value) }])
                  }

                />
                <span>REFUSED TO ANSWER</span>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h1 className="font-semibold text-slate-400 mb-2">List all your first degree (blood) relatives, who ever had a diagnosis of cancer</h1>
            <DataTable
              tableStyle={{ minWidth: "60rem" }}
              // tableClassName="p-datatable-gridlines"
              value={familyHistoryRelatives}
              showGridlines
              size="normal"
              className="border !border-b-0 text-slate-600"
            >
              <Column
                style={{ fontSize: "0.8rem" }}
                bodyClassName="border-y border-gray-300 "
                field="sr_no"
                header="Sr. No."
                body={(rowData, { rowIndex }) => <span>{rowIndex + 1}</span>}
              ></Column>
              <Column
                style={{ fontSize: "0.8rem" }}
                bodyClassName="border-y border-gray-300 "
                field="relation"
                header="Relation with subject"
                body={(rowData) => <InputText
                  className="border-1 p-2 "
                  value={rowData.relation}
                  placeholder="relation"
                  onChange={e => handleChangeRelative(rowData.id, 'relation', e.target.value)}
                />}
              ></Column>
              <Column
                style={{ fontSize: "0.8rem" }}
                bodyClassName="border-y border-gray-300"
                field="code"
                header="Relative code"
                body={(rowData) =>
                  <Dropdown
                    // onChange={(e) => onChange(e.value)}
                    optionLabel="name"
                    value={rowData.code}
                    optionValue="value"
                    className="border-1"
                    placeholder="Select empoloyee name"
                    options={relatives}
                    appendTo={document.body}
                    onChange={e => handleChangeRelative(rowData.id, 'code', e.value)}
                  />

                }
              ></Column>
              <Column
                style={{ fontSize: "0.8rem" }}
                bodyClassName="border-y border-gray-300"
                field="age_at_diagnosis"
                header="Age at diagnosis"
                body={(rowData) => <InputText
                  keyfilter={'int'}
                  className="border-1 p-2 "
                  value={rowData.age_at_diagnosis}
                  onChange={e => handleChangeRelative(rowData.id, 'age_at_diagnosis', e.target.value)}
                />}
              ></Column>
              <Column
                style={{ fontSize: "0.8rem" }}
                bodyClassName="border-y border-gray-300"
                field="cancer_site"
                header="Cancer Site"
                body={(rowData) => <InputText
                  className="border-1 p-2 "
                  value={rowData.cancer_site}
                  onChange={e => handleChangeRelative(rowData.id, 'cancer_site', e.target.value)}
                />}
              ></Column>
              <Column
                style={{ fontSize: "0.8rem" }}
                bodyClassName="border-y border-gray-300"
                field="treatment_received"
                header="Received treatment*"
                body={rowData => (
                  <div>
                    <div className="space-x-2">
                      <input
                        type="radio"
                        value={1}
                        checked={rowData.treatment_received === 1}
                        onChange={e => handleChangeRelative(rowData.id, 'treatment_received', parseInt(e.target.value))}
                      />
                      <span>YES </span>
                    </div>
                    <div className="space-x-2">
                      <input
                        type="radio"
                        value={2}
                        checked={rowData.treatment_received === 2}
                        onChange={e => handleChangeRelative(rowData.id, 'treatment_received', parseInt(e.target.value))}
                      />
                      <span>NO </span>
                    </div>
                  </div>
                )}
              ></Column>
              <Column
                style={{ fontSize: "0.8rem" }}
                bodyClassName="border-y border-gray-300 w-20"
                field="action"
                header="Action"
                body={rowData => (
                  <Button onClick={() => handleRemoveUi(rowData.id)} label="Remove row" className="px-6 py-2 text-sm w-40" severity="danger" />

                )}
              >


              </Column>


            </DataTable>
          </div>


          <div className="flex justify-between gap-2 mt-10 ">

            <Button onClick={() => handleAddNewUi()} className="px-10 py-2" label="Add new row" severity="help" />
            <Button onClick={() => handleSave()} className="px-10 py-2" label="SAVE" severity="success" />
          </div>
          <div className="pt-10 flex justify-end gap-2">
            <Link to={`/tab6?id=${id}`}>
              <Button className="px-10 py-2 rounded" label="PREV" />
            </Link>
            <Link to={`/tab8?id=${id}`}>
              <Button className="px-10 py-2 rounded" label="NEXT" />
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
  );
}
