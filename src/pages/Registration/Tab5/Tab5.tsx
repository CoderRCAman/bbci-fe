import { IonAlert, IonContent, IonPage, IonRefresher, IonRefresherContent, RefresherEventDetail } from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import Header from "../../../components/Header";
import { useLocation } from "react-router";
import AddResidential from "./AddResidential";
import { Button } from "primereact/button";
import ShortUUID from "short-uuid";
import { Link } from "react-router-dom";
import { useSQLite } from "../../../utils/Sqlite";
import { fetchCurrentUserDetails, saveToStore } from "../../../utils/helper";
import { set } from "date-fns";
import { checkElibleToSave } from "../Tab11/data";
import ShowRegisteredTab from "../../../components/ShowRegisteredTab";
export interface RESIDENTIAL_TYPE {
  from_age: number;
  to_age: number;
  city?: string;
  village?: string;
  state: string;
  code: number;
  id: string;
  user_id?: string;
}

function isResidentialDataValid(
  data: RESIDENTIAL_TYPE[],
  userData: any,
): boolean {
  const allItemsValid = data.every((item) => {
    const hasRequiredFields =
      item.id?.trim() &&
      item.state?.trim() &&
      item.code > 0 &&
      (item.city?.trim() || item.village?.trim());
    const hasValidNumbers = item.from_age >= 0 && item.to_age > 0;
    const isRangeCorrect = item.from_age <= item.to_age;
    const isWithinUserAge =
      item.to_age <= (userData.age) && item.from_age <= userData.age;
    return hasRequiredFields && hasValidNumbers && isRangeCorrect && isWithinUserAge;
  });
  if (!allItemsValid) {
    return false;
  }
  const zeroRecords = data.filter((item) => item.from_age === 0).length;
  if (zeroRecords > 1) {
    return false;
  }
  if (data.length > 1) {
    const sortedData = [...data].sort((a, b) => a.from_age - b.from_age);
    for (let i = 0; i < sortedData.length - 1; i++) {
      const currentItem = sortedData[i];
      const nextItem = sortedData[i + 1];
      if (
        currentItem.from_age === nextItem.from_age ||
        currentItem.to_age > nextItem.from_age
      ) {
        return false;
      }
    }
  }
  return true;
}
export default function Tab5() {
  const location = useLocation();
  const [id, setId] = useState<string | null>("");
  const [editFlag, setEditFlag] = useState<string | null>(null);
  const searchParams = new URLSearchParams(location.search);
  const [residentialData, setResidentialData] = useState<RESIDENTIAL_TYPE[]>(
    []
  );
  const [alert, setAlert] = useState({
    show: false,
    header: "",
    message: "",
  });
  const [allowNext, setAllowNext] = useState(false);
  const { db, sqlite, tabId } = useSQLite();
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const handleAddNewUi = () => {
    console.log("hello");
    const translator = ShortUUID();
    const newResidential: RESIDENTIAL_TYPE = {
      id: translator.new(),
      from_age: 0,
      to_age: 0,
      city: "",
      state: "",
      code: 0,
      village: ''
    };

    setResidentialData((d) => [...d, newResidential]);
  };
  const handleRemoveUi = (id: string) => {
    if (residentialData.length === 1) return;
    setRemovedIds((prev) => [...prev, id]);
    setResidentialData((d) => d.filter((x) => x.id !== id));
  };
  console.log(residentialData);
  const loadExisting = async (curId: string) => {
    try {
      const query = `
                    select * from residential_history where user_id = '${curId}' ;    
                    `;
      const res = await db?.query(query);
      const values = res?.values;
      if (values?.length === 0 && residentialData.length === 0) {
        handleAddNewUi();
      } else {
        setAllowNext(true);
        setResidentialData(values || []);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (!db) return;
    const curId = searchParams?.get("id") || "";
    setId(curId);
    setEditFlag(searchParams?.get("edit"));
    loadExisting(curId);
  }, [db, location.pathname]);
  const handleSaveFresh = async () => {
    if (db && !(await checkElibleToSave(db, id || "", tabId))) {
      return setAlert({
        header: "Restricted access",
        message: "This user was registered with a different tab id.",
        show: true,
      });
    }
    const userData = await fetchCurrentUserDetails(db, id || "");
    console.log(userData)
    //for fresh records
    if (!isResidentialDataValid(residentialData, userData)) {
      return setAlert({
        show: true,
        header: "FAILED",
        message: "Issue with age gap fields Or Missing fields!",
      });
    }
    try {
      const columns = [
        "from_age",
        "to_age",
        "city",
        "village",
        "state",
        "code",
        "id",
        "user_id",
        "tab_id",
        "created_at"
      ];
      const updateColumns = columns.filter((col) => col !== "id");

      const valuesList = residentialData.map((item) => {
        const values = [
          item.from_age,
          item.to_age,
          item.city ? `'${item.city}'` : "''",
          item.village ? `'${item.village}'` : "''",
          `'${item.state}'`,
          item.code,
          `'${item.id}'`,
          `'${id}'`,
          `'${tabId}'`,
          `'${new Date().toLocaleString('sv-SE').replace('T', ' ')}'`
        ];
        return `(${values.join(", ")})`;
      });

      const updateSet = updateColumns
        .map((col) => `${col} = excluded.${col}`)
        .join(", ");

      const query = `
    INSERT INTO residential_history (${columns.join(", ")})
    VALUES
    ${valuesList.join(",\n")}
    ON CONFLICT(id) DO UPDATE SET
    ${updateSet}; 
  `;

      await db?.run(query);

      const qRemovedIds = removedIds.map((id) => `'${id}'`).join(", ");
      if (qRemovedIds) {
        const q = `DELETE FROM residential_history WHERE id IN (${qRemovedIds})`;
        await db?.run(q);
      }
      await saveToStore(sqlite);
      setAlert({
        show: true,
        header: "SUCCESS",
        message: "DATA SAVED SUCCESSFULLY!",
      });
      setAllowNext(true);
    } catch (error) {
      setAlert({
        show: true,
        header: "FAILED",
        message: "SOME ERROR OCCURRED!",
      });
      console.error(error);
    }
  };
  const handleSaveUpdated = () => {
    //for updated records
  };
  console.log(residentialData.length)
  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    const currentId = searchParams?.get("id") || "";
    await loadExisting(currentId);
    event.detail.complete();
  }
  return (
    <>
      <IonPage>
        <Header title={"Residential History"} />
        <IonContent class="" fullscreen>
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent
              className="spinner-only" // <-- Add this class
              refreshingSpinner="circles"
            // You can remove the other text props
            ></IonRefresherContent>
          </IonRefresher>
          <ShowRegisteredTab id={id || ''} />
          <main className="mt-6 p-2  space-y-8">
            {residentialData.map((item) => (
              <AddResidential
                handleRemoveUi={handleRemoveUi}
                key={item.id}
                data={item}
                setResidentialData={setResidentialData}
              />
            ))}
          </main>
          <div className="mt-4 flex justify-between flex-row-reverse gap-4 px-2 pb-5">
            <Button
              label="+ Add new"
              text
              raised
              className="px-3 py-2 px-10 py-3 rounded-md font-bold"
              onClick={handleAddNewUi}
            />
            {editFlag === "yes" ? (
              <Button
                label="Save"
                text
                raised
                className="px-3 py-2 px-10 rounded-md font-bold"
                onClick={handleSaveUpdated}
              />
            ) : (
              <Button
                label="Save"
                severity="success"
                text
                raised
                className=" px-10   rounded-md font-bold"
                onClick={() => handleSaveFresh()}
              />
            )}
          </div>
          <IonAlert
            isOpen={alert.show}
            onDidDismiss={() => setAlert((a) => ({ ...a, show: false }))}
            header={alert.header}
            message={alert.message}
            buttons={["OK"]}
          />
          <div className="flex gap-2 mt-20 justify-end  pb-5 pr-2">
            <Link to={`/tab1?id=${id}&edit=no`}>
              <Button label="PREV" className="px-10 py-2  rounded-md" />
            </Link>

            <Link to={`/tab6?id=${id}`}>
              <Button label="NEXT" className="px-10 py-2  rounded-md" />
            </Link>
          </div>
        </IonContent>
        <div className="pb-[250px]"></div>
      </IonPage>
    </>
  );
}
