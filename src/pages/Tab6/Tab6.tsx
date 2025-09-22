import { IonContent, IonPage } from "@ionic/react";
import Header from "../../components/Header";
import { useLocation } from "react-router";
import { use, useEffect, useState } from "react";
import data from "./data.json";
import PMHInput from "./PMHInput";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";
import { useSQLite } from "../../utils/Sqlite";
import ShortUUID from "short-uuid";
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
  diagnosis: string;
  diagnosed: number;
  age_first_diagnosis?: number;
  year_of_first_diagnosis?: string;
  treatment_received?: number;
  mode_of_treatment?: string;
  mode_of_diagnosis?: string;
  mode_of_diagnosis_other ?: string; 
  user_id?: string;
}

function generateDefaultData(user_id: string): PERSONAL_MEDICAL_HISTORY_DB[] {
  return data.map((item) => ({
    id: translator.new(),
    diagnosis: item.condition,
    diagnosed: -1,
    age_first_diagnosis: 0,
    year_of_first_diagnosis: "",
    treatment_received: 0,
    mode_of_treatment: "",
    mode_of_diagnosis: "",
    user_id: user_id,
  }));
}

export default function Tab6() {
  const { db, sqlite } = useSQLite();
  const location = useLocation();
  const [id, setId] = useState<string | null>("");
  const [editFlag, setEditFlag] = useState(false);
  const [dataState, setDataState] = useState<PERSONAL_MEDICAL_HISTORY_DB[]>([]);
  const searchParams = new URLSearchParams(location.search);
  useEffect(() => {
    setId(searchParams?.get("id"));
    setEditFlag(searchParams?.get("edit") === "YES");
  }, [location.pathname]);

  useEffect(() => {
    if (db === null) return;
    fetchExistingData();
  }, [db]);

  const updateStateData = (id: string, field: string, value: any) => {
    console.log(id , field, value);
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
      setDataState(res?.values as PERSONAL_MEDICAL_HISTORY_DB[]);
    } catch (error) {
      console.log(error);
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
              <Button className="px-10 py-2" label="SAVE" severity="success" />
            </div>
            <div className="pt-10 flex justify-end gap-2">
              <Link to={"/tab5"}>
                <Button className="px-10 py-2 rounded" label="PREV" />
              </Link>
              <Link to={"/tab7"}>
                <Button className="px-10 py-2 rounded" label="NEXT" />
              </Link>
            </div>
          </main>
        </IonContent>
      </IonPage>
    </div>
  );
}
