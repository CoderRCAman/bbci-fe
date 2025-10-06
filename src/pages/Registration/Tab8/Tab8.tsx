import { IonAlert, IonContent, IonPage } from "@ionic/react";
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

// dont create seperate table for this one!
export default function Tab8() {
  const { db, sqlite, tabId } = useSQLite();
  const [id, setId] = useState<string | null>("");
  const [allowNext, setAllowNext] = useState(false);
  const [reading1, setReading1] = useState({
    height: 0,
    weight: 0,
    id: shortUUID().generate(),
    date: new Date().toISOString(),
  });
  const [reading2, setReading2] = useState({
    height: 0,
    weight: 0,
    id: shortUUID().generate(),
    date: new Date().toISOString(),
  });
  const [alert, setAlert] = useState({
    show: false,
    header: "",
    message: "",
  });
  const [isDisabledReading2, setIsDisabledReading2] = useState(true);
  const location = useLocation();
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    setId(searchParams?.get("id"));
  }, []);
  useEffect(() => {
    if (db === null) return;

    async function fetchExisting() {
      try {
        const searchParams = new URLSearchParams(location.search);
        const id = searchParams?.get("id");
        const res = await db?.query(
          `select * from anthropometry where user_id = '${id}' order by date(date) asc`
        );
        console.log(res);
        if (res?.values?.length) {
          setAllowNext(true)
          setReading1({
            height: res?.values?.[0]?.height || 0,
            weight: res?.values?.[0]?.weight || 0,
            id: res?.values?.[0]?.id || shortUUID().generate(),
            date: res?.values?.[0]?.date || new Date().toISOString(),
          });
          setIsDisabledReading2(
            differenceInMonths(new Date(), new Date(reading1.date)) <= 3
          );
          if (res?.values?.length > 1) {
            setReading2({
              height: res?.values?.[1]?.height || 0,
              weight: res?.values?.[1]?.weight || 0,
              id: res?.values?.[1]?.id || shortUUID().generate(),
              date: res?.values?.[1]?.date || new Date().toISOString(),
            });
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchExisting();
  }, [db, location.pathname]);

  const handleSave = async () => {
    try {
      console.log(isDisabledReading2);
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
            tab_id 
        ) VALUES (?, ?, ?, ?, ?,?)
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
      setAllowNext(true)
      setAlert({
        show: true,
        header: "Success",
        message: "Anthropometry data saved successfully.",
      });
    } catch (error) {
      console.log(error);
      setAlert({
        show: true,
        header: "Error",
        message: "Failed to save Anthropometry data. Please try again.",
      });
    }
  };

  return (
    <div>
      <IonPage>
        <Header title={0 ? "Edit Anthropometry" : "Anthropometry"} />
        <IonContent class="" fullscreen>
          <main className="p-2 space-y-5">
            <div className="p-2 border rounded-md">
              <p className="text-slate-500">Reading 1</p>
              <div className="mt-2 flex items-start flex-col ">
                <label className="text-slate-500">Height (in cm)</label>

                <InputNumber
                  id="result_blood"
                  maxFractionDigits={2}
                  minFractionDigits={2}
                  className=""
                  onChange={(e) =>
                    setReading1((prev) => ({ ...prev, height: e.value || 0 }))
                  }
                  value={reading1.height}
                />
              </div>
              <div className="mt-3 flex items-start flex-col ">
                <label className=" text-slate-500 ">Weight (in kg)</label>
                <InputNumber
                  id="result_blood"
                  maxFractionDigits={2}
                  minFractionDigits={2}
                  onChange={(e) =>
                    setReading1((prev) => ({ ...prev, weight: e.value || 0 }))
                  }
                  value={reading1.weight}
                />
              </div>
            </div>
            <div className="p-2 border rounded-md">
              <p className="text-slate-500">Reading 2</p>
              <div className="mt-2 flex items-start flex-col ">
                <label className="text-slate-500">Height (in cm)</label>

                <InputNumber
                  disabled={isDisabledReading2}
                  id="result_blood"
                  maxFractionDigits={2}
                  minFractionDigits={2}
                  className=""
                  onChange={(e) =>
                    setReading2((prev) => ({ ...prev, height: e.value || 0 }))
                  }
                  value={reading2.height}
                />
              </div>
              <div className="mt-3 flex items-start flex-col ">
                <label className=" text-slate-500 ">Weight (in kg)</label>
                <InputNumber
                  disabled={isDisabledReading2}
                  id="result_blood"
                  maxFractionDigits={2}
                  minFractionDigits={2}
                  onChange={(e) =>
                    setReading2((prev) => ({ ...prev, weight: e.value || 0 }))
                  }
                  value={reading2.weight}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4 ">
              <Button
                onClick={handleSave}
                className="px-10 py-2"
                label="SAVE"
                severity="success"
              />
            </div>
            <div className="pt-10 flex justify-end gap-2">
              <Link to={"/tab7?id=" + id}>
                <Button className="px-10 py-2 rounded" label="PREV" />
              </Link>
              {
                allowNext &&
                <Link to={"/tab9?id=" + id}>
                  <Button className="px-10 py-2 rounded" label="NEXT" />
                </Link>
              }
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
