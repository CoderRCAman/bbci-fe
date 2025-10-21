import { IonAlert, IonContent, IonPage } from "@ionic/react";
import Header from "../../../components/Header";
import { useLocation } from "react-router";
import { use, useEffect, useState } from "react";
import data from "./data.json";
import PMHInput from "./PMHInput";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";
import { useSQLite } from "../../../utils/Sqlite";
import ShortUUID from "short-uuid";
import { saveToStore } from "../../../utils/helper";
import { checkElibleToSave } from "../Tab11/data";
import ShowRegisteredTab from "../../../components/ShowRegisteredTab";
const translator = ShortUUID();
export interface PERSONAL_MEDICAL_HISTORY {
  diagnoss: string;
  diagnosed: number;
  age_first_diagnosis?: number;
  year_of_first_diagnosis?: string;
  treatment_received?: number;
  mode_of_treatment?: string;
  mode_of_diagnosis?: string;
  user_id?: string;
}
export interface PERSONAL_MEDICAL_HISTORY_DB {
  id: string;
  diagnoss: string;
  diagnosed: number;
  age_first_diagnosis?: number;
  year_of_first_diagnosis?: string;
  treatment_received?: number;
  mode_of_treatment?: string;
  mode_of_diagnosis?: string;
  mode_of_diagnosis_other?: string;
  user_id?: string;
}

function generateDefaultData(user_id: string): PERSONAL_MEDICAL_HISTORY_DB[] {
  return data.map((item) => ({
    id: translator.new(),
    diagnoss: item.condition,
    diagnosed: 2,
    age_first_diagnosis: 0,
    year_of_first_diagnosis: "",
    treatment_received: 0,
    mode_of_treatment: "",
    mode_of_diagnosis: "",
    user_id: user_id,
  }));
}

export default function Tab6() {
  const { db, sqlite, tabId } = useSQLite();
  const location = useLocation();
  const [id, setId] = useState<string | null>("");
  const [dataState, setDataState] = useState<PERSONAL_MEDICAL_HISTORY_DB[]>([]);
  const searchParams = new URLSearchParams(location.search);
  const [allowNext, setAllowNext] = useState(false);
  const [dirtyIds, setDirtyIds] = useState<string[]>([]);
  const [alert, setAlert] = useState({
    show: false,
    header: "",
    message: "",
  });

  useEffect(() => {
    if (db === null) return;
    setId(searchParams?.get("id"));
    fetchExistingData();
  }, [db, location.pathname]);

  const updateStateData = (id: string, field: string, value: any) => {
    console.log(id, field, value);
    setDirtyIds((prev) => (prev.some((x) => x === id) ? prev : [...prev, id]));
    setDataState((prevState) => {
      return prevState.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      });
    });
  };

  const fetchExistingData = async () => {
    try {
      const id = searchParams?.get("id");
      const res = await db?.query(
        `SELECT * FROM personal_medical_history  WHERE user_id = ?`,
        [id]
      );
      console.log(res?.values as PERSONAL_MEDICAL_HISTORY_DB[]);
      if (res?.values && res?.values.length === 0) {
        const defaultData = generateDefaultData(id || "");
        setDataState(defaultData);
        return;
      }
      setAllowNext(true);
      const newState = generateDefaultData(id || "");
      if (res?.values) {
        res?.values.forEach((item: PERSONAL_MEDICAL_HISTORY_DB) => {
          const existingIndex = newState.findIndex(x => x.diagnoss === item.diagnoss)
          if (existingIndex !== -1) {
            newState[existingIndex] = item
          }
        })
      }
      setDataState(newState);
    } catch (error) {
      console.log(error);
    }
  };
  const handleSave = async () => {
    try {
      if (!id) return;
      if (db && !(await checkElibleToSave(db, id || "", tabId))) {
        return setAlert({
          header: "Restricted access",
          message: "This user was registered with a different tab id.",
          show: true,
        });
      }
      for (const item of dataState) {
        if (!dirtyIds.includes(item.id)) continue;
        const query = `
          INSERT INTO personal_medical_history (
            id,
            diagnoss,
            diagnosed,
            age_first_diagnosis,
            year_of_first_diagnosis,
            treatment_received,
            mode_of_treatment,
            mode_of_diagnosis,
            mode_of_diagnosis_other,
            user_id,
            tab_id ,
            created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ?)
          ON CONFLICT(id) DO UPDATE SET
            diagnoss = excluded.diagnoss,
            diagnosed = excluded.diagnosed,
            age_first_diagnosis = excluded.age_first_diagnosis,
            year_of_first_diagnosis = excluded.year_of_first_diagnosis,
            treatment_received = excluded.treatment_received,
            mode_of_treatment = excluded.mode_of_treatment,
            mode_of_diagnosis = excluded.mode_of_diagnosis,
            mode_of_diagnosis_other = excluded.mode_of_diagnosis_other,
            user_id = excluded.user_id;
        `;

        const values = [
          item.id,
          item.diagnoss,
          item.diagnosed,
          item.age_first_diagnosis,
          item.year_of_first_diagnosis,
          item.treatment_received,
          item.mode_of_treatment,
          item.mode_of_diagnosis,
          item.mode_of_diagnosis_other,
          item.user_id,
          tabId,
          new Date().toLocaleString('sv-SE').replace('T', ' '),
        ];
        await db?.run(query, values);
      }
      await saveToStore(sqlite);
      setAllowNext(true);
      setAlert({
        show: true,
        header: "Success",
        message: "Data saved successfully",
      });
    } catch (error) {
      console.log(error);
      setAlert({
        show: true,
        header: "Error",
        message: "Something went wrong",
      });
    }
  };
  console.log(dataState);
  return (
    <div>
      <IonPage>
        <Header
          title={
            0 ? "Edit Personal Medical History" : "Personal Medical History"
          }
        />
        <IonContent class="" fullscreen>
          <ShowRegisteredTab id={id || ''} />
          <main className="p-2 space-y-2">
            {data.map((d, index) => (
              <PMHInput
                data={dataState?.[index]}
                condition={d.condition}
                mode_of_diagnosis={d.mode_of_diagnosis}
                mode_of_treatment={d.mode_of_treatment}
                key={index}
                updateStateData={updateStateData}
              />
            ))}
            <div className="flex justify-end gap-2 ">
              <Button
                onClick={handleSave}
                className="px-10 py-2"
                label="SAVE"
                severity="success"
              />
            </div>
            <div className="pt-20 flex justify-end gap-2">
              <Link to={`/tab5?id=${id}`}>
                <Button className="px-10 py-2 rounded" label="PREV" />
              </Link>

              <Link to={"/tab7?id=" + id}>
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
        <div className="pb-[250px]"></div>

      </IonPage>
    </div>
  );
}
