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
import { use, useEffect, useRef, useState } from "react";
import data from "./data.json";
import PMHInput from "./PMHInput";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";
import { useSQLite } from "../../../utils/Sqlite";
import ShortUUID, { generate } from "short-uuid";
import { saveToStore } from "../../../utils/helper";
import { checkElibleToSave } from "../Tab11/data";
import ShowRegisteredTab from "../../../components/ShowRegisteredTab";
import { useBlockNavigation } from "../../../utils/blockBackNavigation";
import RegistrationCrumbs from "../../../components/RegistrationCrumbs";
import { differenceInYears } from "date-fns";
import PMHInputOther from "./PMHInputOther";
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
  is_other?: number
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
  is_other?: number
}

export function validateDiagnosisAge(
  records: PERSONAL_MEDICAL_HISTORY_DB[],
  userDob: string
) {
  const birthYear = new Date(userDob).getFullYear();
  const currentYear = new Date().getFullYear();
  const userAge = currentYear - birthYear;

  for (const row of records) {
    const age = row.age_first_diagnosis;
    const year = row.year_of_first_diagnosis
      ? Number(row.year_of_first_diagnosis)
      : undefined;

    // --- check age ---
    if (age !== undefined && age > userAge) {
      throw new Error("Age of first diagnosis cannot exceed patient's age.");
    }

    // --- check year ---
    if (year !== undefined) {
      if (year < birthYear) {
        throw new Error(
          "Year of diagnosis cannot be before patient's birth year."
        );
      }
      if (year > currentYear) {
        throw new Error("Year of diagnosis cannot be in the future.");
      }
    }
  }
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [ageLimit, setAgeLimit] = useState(-1);
  const [dob, setDob] = useState("");
  const [alert, setAlert] = useState({
    show: false,
    header: "",
    message: "",
  });
  const [isDisabled, setIsDisabled] = useState(false);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  useEffect(() => {
    if (db === null) return;
    setId(searchParams?.get("id"));
    setIsDisabled(false);
    fetchExistingData();

  }, [db, location.pathname]);
  useBlockNavigation(isUnsaved, () => {
    setAlert({
      show: true,
      header: "Unsaved Changes",
      message: "You have unsaved changes. Are you sure you want to leave?",
    });
  });
  const updateStateData = (id: string, field: string, value: any) => {
    setDirtyIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setIsUnsaved(true);

    setDataState((prevState) => {
      return prevState.map((item) => {
        if (item.id !== id) return item;

        let updated = { ...item, [field]: value };

        // --------------------------
        // RULE 1: diagnosed !== 1 → reset ALL dependent fields
        // --------------------------
        if (field === "diagnosed" && value !== 1) {
          updated = {
            ...updated,
            age_first_diagnosis: 0,
            year_of_first_diagnosis: "",
            treatment_received: 2,
            mode_of_treatment: "",
            mode_of_diagnosis: "",
            mode_of_diagnosis_other: "",
          };
          return updated;
        }

        // --------------------------
        // RULE 2: treatment_received !== 1 → reset treatment-dependent fields
        // --------------------------
        if (field === "treatment_received" && value !== 1) {
          updated = {
            ...updated,
            mode_of_treatment: "",
            mode_of_diagnosis: "",
            mode_of_diagnosis_other: "",
          };
          return updated;
        }

        // --------------------------
        // Existing "Don't know" logic remains intact
        // --------------------------
        if (
          field === "mode_of_diagnosis" ||
          field === "mode_of_diagnosis_other"
        ) {
          if (value === "Don't know") {
            if (item.mode_of_diagnosis === "Don't know") {
              return {
                ...updated,
                mode_of_diagnosis: "",
                mode_of_diagnosis_other: "",
              };
            } else {
              return {
                ...updated,
                mode_of_diagnosis: "Don't know",
                mode_of_diagnosis_other: "",
              };
            }
          }

          if (
            item.mode_of_diagnosis === "Don't know" &&
            value !== "Don't know"
          ) {
            return {
              ...updated,
              mode_of_diagnosis: value
                .split("|")
                .filter((m: string) => m !== "Don't know")
                .join("|"),
            };
          }
        }

        return updated;
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
      const userQuery = `select * from patients where id = '${id}' ;`;
      const res2 = await db?.query(userQuery);
      setAgeLimit(differenceInYears(new Date(), new Date(res2?.values?.[0].dob)))
      setDob(res2?.values?.[0].dob)
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
          const existingIndex = newState.findIndex(
            (x) => x.diagnoss === item.diagnoss
          );
          if (existingIndex !== -1) {
            newState[existingIndex] = item;
          }
        });
      }
      const otherDiagnosis = res?.values?.filter(item => item?.is_other === 1) || [];
      if (otherDiagnosis?.length > 0) {
        newState.push(...otherDiagnosis)
      }
      if (res?.values?.[0]?.tab_id)
        setIsDisabled(res?.values[0]?.tab_id !== tabId);

      setDataState(newState);
    } catch (error) {
      console.log(error);
    }
  };
  const handleSave = async () => {
    try {
      if (!id) return;
      if (
        db &&
        !(await checkElibleToSave(
          db,
          id || "",
          tabId,
          "personal_medical_history",
          "user_id"
        ))
      ) {
        return setAlert({
          header: "Restricted access",
          message: "This user was registered with a different tab id.",
          show: true,
        });
      }
      const ress = await db?.query(`SELECT * FROM patients WHERE id = ?`, [id]);
      const userData = ress?.values?.[0];
      try {
        validateDiagnosisAge(dataState, userData.dob);
      } catch (error: any) {
        return setAlert({
          show: true,
          header: "FAILED",
          message: error.message,
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
            created_at,
            is_other
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ? , ?)
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
          new Date().toLocaleString("sv-SE").replace("T", " "),
          item?.is_other || 0
        ];
        await db?.run(query, values);
      }
      for (const id of deletedIds) {
        await db?.run(`DELETE FROM personal_medical_history WHERE id = ?`, [id])
      }
      await saveToStore(sqlite);
      setAllowNext(true);
      setIsUnsaved(false);
      setAlert({
        show: true,
        header: "Success",
        message: "Data saved successfully",
      });
    } catch (error: any) {
      console.log(error);
      setAlert({
        show: true,
        header: "Error",
        message: error.message,
      });
    }
  };
  function handleAddOther() {
    setDataState(data => [...data,
    {
      id: translator.new(),
      diagnosed: 1,
      diagnoss: '',
      age_first_diagnosis: 0,
      year_of_first_diagnosis: '',
      treatment_received: 0,
      mode_of_treatment: '',
      mode_of_diagnosis: '',
      is_other: 1,
      user_id: id || ''
    }
    ])
  }
  function handleRemoveOther(id: string) {
    setDataState(data => data.filter(x => x.id !== id))
    setDeletedIds(ids => [...ids, id])
  }
  console.log(dataState)
  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await fetchExistingData();
    setIsUnsaved(false);
    event.detail.complete();
  };
  return (
    <div>
      <IonPage>
        <Header
          title={
            // Assuming you meant to use the 'id' variable here
            id ? "Edit Personal Medical History" : "Personal Medical History"
          }
        />
        <IonContent class="" fullscreen>
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent
              className="spinner-only"
              refreshingSpinner="circles"
            ></IonRefresherContent>
          </IonRefresher>
          <RegistrationCrumbs currentPageLabel="Personal Medical History" />
          <ShowRegisteredTab
            id={id || ""}
            table_name="personal_medical_history"
            field_name="user_id"
          />

          {/* Added more padding and vertical space */}
          <main ref={scrollRef} className="p-3 space-y-6">
            {data.map((d, index) => (
              <PMHInput
                data={dataState?.[index]}
                condition={d.condition}
                mode_of_diagnosis={d.mode_of_diagnosis}
                mode_of_treatment={d.mode_of_treatment}
                key={index}
                updateStateData={updateStateData}
                ageLimit={ageLimit}
                isDisabled={isDisabled}
                dob={dob}
              />
            ))}

            {
              dataState.filter((item) => item.is_other).map(item => (
                <PMHInputOther
                  key={item.id}
                  data={item}
                  ageLimit={ageLimit}
                  isDisabled={isDisabled}
                  onRemove={handleRemoveOther}
                  updateStateData={updateStateData}
                  dob={dob}
                />
              ))
            }
            <div>
              <Button
                label="Add other diagnosis"
                severity="warning"
                disabled={isDisabled}
                icon="pi pi-plus"
                onClick={() => { handleAddOther() }}
              />
            </div>

            {/* Grouped all action buttons at the bottom */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                onClick={handleSave}
                label="SAVE"
                icon="pi pi-check" // Added icon
                severity="success"
                raised // Added for emphasis 
                disabled={isDisabled}
              />
            </div>

            {/* Used justify-between for a standard PREV/NEXT layout */}
            <div className="pt-8 flex justify-between gap-2">
              <Link to={`/tab5?id=${id}`}>
                <Button
                  label="PREV"
                  icon="pi pi-arrow-left" // Added icon
                  severity="secondary"
                  outlined
                />
              </Link>
              <Link to={"/tab7?id=" + id}>
                <Button
                  label="NEXT"
                  icon="pi pi-arrow-right" // Added icon
                  iconPos="right"
                  severity="secondary"
                  outlined
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
          
          {/* Fixed broken className and used p-button-rounded */}
          <Button
            icon="pi pi-arrow-up"
            // WindiCSS classes for styling and position
            className={`
                fixed bottom-20 right-6 
                p-button-rounded p-button-secondary shadow-lg
                transition-opacity duration-300
                
              `} // <-- Fixed broken string
            style={{ zIndex: 2000 }}
            onClick={() => {
              console.log("HELLo");
              if (scrollRef.current)
                scrollRef.current.scrollIntoView({ behavior: "smooth" });
            }}
          />

          {/* Moved this spacer DIV *inside* the IonContent to provide scrollable padding */}
          <div className="pb-[250px]"></div>
        </IonContent>
        {/* The spacer div was incorrectly here */}
      </IonPage>
    </div>
  );
}
