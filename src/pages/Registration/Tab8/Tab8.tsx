import {
  IonAlert,
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
} from "@ionic/react";
import Header from "../../../components/Header";
import { Button } from "primereact/button";
import { Link, useLocation } from "react-router-dom";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { use, useEffect, useState } from "react";
import { useSQLite } from "../../../utils/Sqlite";
import shortUUID from "short-uuid";
import { differenceInMonths, set } from "date-fns";
import { saveToStore } from "../../../utils/helper";
import { checkElibleToSave } from "../Tab11/data";
import ShowRegisteredTab from "../../../components/ShowRegisteredTab";
import { useBlockNavigation } from "../../../utils/blockBackNavigation";
import RegistrationCrumbs from "../../../components/RegistrationCrumbs";

// dont create seperate table for this one!
export default function Tab8() {
  const { db, sqlite, tabId } = useSQLite();
  const [id, setId] = useState<string | null>("");
  const [allowNext, setAllowNext] = useState(false);
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [reading1, setReading1] = useState<{
    height: number | "";
    weight: number | "";
    id: string;
    date: string;
  }>({
    height: 0,
    weight: 0,
    id: shortUUID().generate(),
    date: new Date().toLocaleString("sv-SE").replace("T", " "),
  });
  const [reading2, setReading2] = useState<{
    height: number | "";
    weight: number | "";
    id: string;
    date: string;
  }>({
    height: 0,
    weight: 0,
    id: shortUUID().generate(),
    date: new Date().toLocaleString("sv-SE").replace("T", " "),
  });
  const [alert, setAlert] = useState({
    show: false,
    header: "",
    message: "",
  });
  const [isDisabledReading2, setIsDisabledReading2] = useState(true);
  const location = useLocation();
  console.log(id);
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    setId(searchParams?.get("id"));
  }, [location.pathname]);
  async function fetchExisting() {
    try {
      const searchParams = new URLSearchParams(location.search);
      const id = searchParams?.get("id");
      const res = await db?.query(
        `select * from anthropometry where user_id = '${id}' order by date(date) asc`
      );
      console.log(res);
      if (res?.values?.length) {
        setAllowNext(true);
        if (res?.values?.[0]?.tab_id)
          setIsDisabled(res?.values?.[0]?.tab_id !== tabId);
        setReading1({
          height: res?.values?.[0]?.height || 0,
          weight: res?.values?.[0]?.weight || 0,
          id: res?.values?.[0]?.id || shortUUID().generate(),
          date:
            res?.values?.[0]?.date ||
            new Date().toLocaleString("sv-SE").replace("T", " "),
        });
        setIsDisabledReading2(
          differenceInMonths(new Date(), new Date(reading1.date)) <= 3
        );
        if (res?.values?.length > 1) {
          setReading2({
            height: res?.values?.[1]?.height || 0,
            weight: res?.values?.[1]?.weight || 0,
            id: res?.values?.[1]?.id || shortUUID().generate(),
            date:
              res?.values?.[1]?.date ||
              new Date().toLocaleString("sv-SE").replace("T", " "),
          });
        }
      } else {
        setReading1({
          height: 0,
          weight: 0,
          id: shortUUID().generate(),
          date: new Date().toLocaleString("sv-SE").replace("T", " "),
        });
        setReading2({
          height: 0,
          weight: 0,
          id: shortUUID().generate(),
          date: new Date().toLocaleString("sv-SE").replace("T", " "),
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    setIsDisabled(false);
    if (db === null) return;
    if (isUnsaved) return; 
    fetchExisting();
  }, [db, location.pathname]);
  useBlockNavigation(isUnsaved, () => {
    setAlert({
      show: true,
      header: "Unsaved Changes",
      message: "You have unsaved changes. Are you sure you want to leave?",
    });
  });
  const handleSave = async () => {
    try {
      if (
        db &&
        !(await checkElibleToSave(
          db,
          id || "",
          tabId,
          "anthropometry",
          "user_id"
        ))
      ) {
        return setAlert({
          header: "Restricted access",
          message: "This user was registered with a different tab id.",
          show: true,
        });
      }
      if (
        reading1.height === 0 ||
        reading1.weight === 0 ||
        (reading2.height === 0 && !isDisabledReading2) ||
        (reading2.weight === 0 && !isDisabledReading2)
      ) {
        return setAlert({
          show: true,
          header: "Validation Error",
          message: "Please enter valid values for Reading ",
        });
      }

      const query = `
        INSERT INTO anthropometry (
            id,
            user_id,
            date,
            height,
            weight,
            tab_id ,
            created_at
        ) VALUES (?, ?, ?, ?, ?, ? , ?)
        ON CONFLICT(id) DO UPDATE SET
            user_id = excluded.user_id,
            date = excluded.date,
            height = excluded.height,
            weight = excluded.weight;
        `;
      const values = [
        reading1.id,
        id,
        reading1.date,
        reading1.height,
        reading1.weight,
        tabId,
        new Date().toLocaleString("sv-SE").replace("T", " "),
      ];

      await db?.run(query, values);
      if (!isDisabledReading2) {
        const values2 = [
          reading2.id,
          id,
          reading2.date,
          reading2.height,
          reading2.weight,
          tabId,
        ];
        await db?.run(query, values2);
      }
      await saveToStore(sqlite);
      setAllowNext(true);
      setAlert({
        show: true,
        header: "Success",
        message: "Anthropometry data saved successfully.",
      });
      setIsUnsaved(false);
    } catch (error) {
      console.log(error);
      setAlert({
        show: true,
        header: "Error",
        message: "Failed to save Anthropometry data. Please try again.",
      });
    }
  };
  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await fetchExisting();
    setIsUnsaved(false);
    event.detail.complete();
  };
  return (
    <div>
      <IonPage>
        <Header title={0 ? "Edit Anthropometry" : "Anthropometry"} />
        <IonContent class="" fullscreen>
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent
              className="spinner-only" // <-- Add this class
              refreshingSpinner="circles"
            // You can remove the other text props
            ></IonRefresherContent>
          </IonRefresher>
          <RegistrationCrumbs currentPageLabel="Anthropometry" />
          <ShowRegisteredTab
            id={id || ""}
            table_name="anthropometry"
            field_name="user_id"
          />
          <main className="p-2 space-y-5">
            <div className="p-2 border rounded-md">
              <p className="text-slate-500">Reading 1</p>
              <div className="mt-2 flex gap-2 items-start flex-col ">
                <label className="text-slate-500">Height (in cm)</label>

                <InputText
                  type="number"
                  keyfilter={"num"}
                  id="result_blood"
                  className="p-2 border"
                  disabled={isDisabled}
                  onChange={(e) => {
                    setIsUnsaved(true);
                    setReading1((prev) => ({
                      ...prev,
                      height: e.target.value ? parseFloat(e.target.value) : "",
                    }));
                  }}
                  value={reading1.height.toString()}
                />
              </div>
              <div className="mt-3 flex gap-2 items-start flex-col ">
                <label className=" text-slate-500 ">Weight (in kg)</label>
                <InputText
                  id="result_blood"
                  type="number"
                  keyfilter={"num"}
                  disabled={isDisabled}
                  onChange={(e) => {
                    setIsUnsaved(true);
                    setReading1((prev) => ({
                      ...prev,
                      weight: e.target.value ? parseFloat(e.target.value) : "",
                    }));
                  }}
                  value={reading1.weight.toString()}
                  className="p-2 border"
                />
              </div>
            </div>
            <div className="p-2 border rounded-md">
              <p className="text-slate-500">Reading 2</p>
              <div className="mt-2 flex gap-2 items-start flex-col ">
                <label className="text-slate-500">Height (in cm)</label>

                <InputText
                  type="number"
                  keyfilter={"num"}
                  disabled={isDisabledReading2 || isDisabled}
                  id="result_blood"
                  className="p-2 border"
                  onChange={(e) => {
                    setIsUnsaved(true);
                    setReading2((prev) => ({
                      ...prev,
                      height: e.target.value ? parseFloat(e.target.value) : "",
                    }));
                  }}
                  value={reading2.height.toString()}
                />
              </div>
              <div className="mt-3 gap-2 flex items-start flex-col ">
                <label className=" text-slate-500 ">Weight (in kg)</label>
                <InputText
                  type="number"
                  keyfilter={"num"}
                  disabled={isDisabledReading2 || isDisabled}
                  id="result_blood"
                  onChange={(e) => {
                    setIsUnsaved(true);
                    setReading2((prev) => ({
                      ...prev,
                      weight: e.target.value ? parseFloat(e.target.value) : "",
                    }));
                  }}
                  value={reading2.weight.toString()}
                  className="p-2 border"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4 ">
              <Button
                onClick={handleSave}
                label="Save"
                disabled={isDisabled}
                severity="success"
                icon="pi pi-check" // Added icon
                raised // Added for emphasis
              />
            </div>
            <div className="pt-10 flex justify-between gap-2">
              <Link to={"/tab7?id=" + id}>
                <Button
                  className="px-10 py-2 rounded"
                  label="PREV"
                  icon="pi pi-arrow-left" // Added icon
                  severity="secondary" // Use secondary style
                  outlined
                />
              </Link>
              <Link to={"/tab9?id=" + id}>
                <Button
                  className="px-10 py-2 rounded"
                  label="NEXT"
                  icon="pi pi-arrow-right" // Added icon
                  severity="secondary" // Use secondary style
                  outlined
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
        <div className="pb-[250px]"></div>
      </IonPage>
    </div>
  );
}
