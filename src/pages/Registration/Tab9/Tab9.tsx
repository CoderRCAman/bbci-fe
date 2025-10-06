import { IonAlert, IonContent, IonPage } from "@ionic/react";
import Header from "../../../components/Header";
import { useLocation } from "react-router";
import { useEffect, useState } from "react";
import shortUUID from "short-uuid";
import AddIndoorAirPollution from "./AddIndoorAirPollution";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";
import { useSQLite } from "../../../utils/Sqlite";
import { saveToStore } from "../../../utils/helper";
export interface INDOOR_AIR_POLLUTION {
  id: string;
  from_age: number;
  to_age: number;
  hours: number;
  minutes: number;
  ventilation: number;
  most_common_cooking_fuel: number;
  smokiness: number;
  most_cooking: number;
  user_id?: string;
  tab_id?: string;
}
function isIndoorAirPollutionDataValid(data: INDOOR_AIR_POLLUTION[]): boolean {
  return data.every(
    (item) =>
      item.id?.trim() &&
      item.from_age > 0 &&
      item.to_age > 0 &&
      item.hours > -1 &&
      item.minutes > -1 &&
      item.ventilation > -1 &&
      item.most_common_cooking_fuel > -1 &&
      item.smokiness > -1 &&
      item.most_cooking > -1
  );
}
export default function Tab9() {
  const location = useLocation();
  const { db, sqlite, tabId } = useSQLite();
  const [id, setId] = useState<string | null>("");
  const [editFlag, setEditFlag] = useState(false);
  const [allowNext, setAllowNext] = useState(false);
  const searchParams = new URLSearchParams(location.search);
  const [indoorAirData, setIndoorAirData] = useState<INDOOR_AIR_POLLUTION[]>(
    []
  );
  const [alert, setAlert] = useState({
    show: false,
    header: "",
    message: "",
  });

  useEffect(() => {
    const curId = searchParams?.get("id");
    setId(curId);
    setEditFlag(searchParams?.get("edit") === "YES");
    async function fetchExisting() {
      try {
        const query = `
                select * from indoor_air_pollution where user_id = '${curId}' ;
            `;
        const res = await db?.query(query);
        if (res?.values?.length) {
          setAllowNext(true);
          setIndoorAirData(res?.values as INDOOR_AIR_POLLUTION[]);
        } else {
          handleAddNewUi();
        }
        console.log(res);
      } catch (error) {
        console.log(error);
      }
    }
    fetchExisting();
  }, [location.pathname, db]);

  const handleAddNewUi = () => {
    const translator = shortUUID();
    const newResidential: INDOOR_AIR_POLLUTION = {
      id: translator.new(),
      from_age: 0,
      to_age: 0,
      hours: -1,
      minutes: -1,
      most_common_cooking_fuel: -1,
      ventilation: -1,
      smokiness: -1,
      most_cooking: -1,
    };
    setIndoorAirData((d) => [...d, newResidential]);
  };
  const handleRemoveUi = (id: string) => {
    if (indoorAirData.length === 1) return;
    setIndoorAirData((d) => d.filter((x) => x.id !== id));
  };

  const handleSaveFresh = async () => {
    //for fresh records
    console.log("hello");
    if (!isIndoorAirPollutionDataValid(indoorAirData)) {
      return setAlert({
        show: true,
        header: "FAILED",
        message: "SOME FIELDS WERE MISSING!",
      });
    }
    try {
      for (const item of indoorAirData) {
        const query = `
            INSERT INTO indoor_air_pollution (
                id,
                from_age,
                to_age,
                hours,
                minutes,
                ventilation,
                most_common_cooking_fuel,
                smokiness,
                most_cooking,
                user_id,
                tab_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                from_age = excluded.from_age,
                to_age = excluded.to_age,
                hours = excluded.hours,
                minutes = excluded.minutes,
                ventilation = excluded.ventilation,
                most_common_cooking_fuel = excluded.most_common_cooking_fuel,
                smokiness = excluded.smokiness,
                most_cooking = excluded.most_cooking;
            `;
        const values = [
          item.id,
          item.from_age,
          item.to_age,
          item.hours,
          item.minutes,
          item.ventilation,
          item.most_common_cooking_fuel,
          item.smokiness,
          item.most_cooking,
          id,
          tabId,
        ];
        console.log(query, values);
        await db?.run(query, values);
      }
      setAllowNext(true);
      await saveToStore(sqlite);
      setAlert({
        show: true,
        header: "Success",
        message: "Data saved successfully",
      });
    } catch (error) {
      console.log(error);
      setAlert({
        show: true,
        header: "FAILED",
        message: "SOMETHING WENT WRONG!",
      });
    }
  };

  return (
    <IonPage>
      <Header
        title={0 ? "Edit Indoor Air Pollution" : "Indoor Air Pollution"}
      />
      <IonContent class="" fullscreen>
        <main className="p-2 space-y-2">
          {indoorAirData.map((data) => (
            <AddIndoorAirPollution
              data={data}
              handleRemoveUi={handleRemoveUi}
              setIndoorAirData={setIndoorAirData}
            />
          ))}
          <div className="mt-4 flex justify-end gap-4 pr-2 pb-5">
            <Button
              label="+ Add new"
              text
              raised
              className="px-3 py-2 px-10 py-3 rounded-md font-bold"
              onClick={handleAddNewUi}
            />

            <Button
              label="Save"
              severity="success"
              text
              raised
              className="px-3 py-2 px-10 py-3 rounded-md font-bold"
              onClick={handleSaveFresh}
            />
          </div>

          <IonAlert
            isOpen={alert.show}
            onDidDismiss={() => setAlert((a) => ({ ...a, show: false }))}
            header={alert.header}
            message={alert.message}
            buttons={["OK"]}
          />
          <div className="pt-10 flex justify-end gap-2">
            <Link to={"/tab8?id=" + id}>
              <Button className="px-10 py-2 rounded" label="PREV" />
            </Link>
            {allowNext && (
              <Link to={"/tab11?id=" + id}>
                <Button className="px-10 py-2 rounded" label="NEXT" />
              </Link>
            )}
          </div>
        </main>
      </IonContent>
    </IonPage>
  );
}
