import {
  IonAlert,
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
} from "@ionic/react";
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

import { differenceInYears, parseISO } from "date-fns";
import { useBlockNavigation } from "../../../utils/blockBackNavigation";
import RegistrationCrumbs from "../../../components/RegistrationCrumbs";

// Assuming RESIDENTIAL_TYPE is defined elsewhere

function isResidentialDataValid(
  data: RESIDENTIAL_TYPE[],
  userData: any
): boolean {
  // --- Start: Age Calculation with date-fns ---

  // 1. Check if DOB exists
  if (!userData.dob) {
    console.error("Validation failed: userData.dob is missing.");
    return false;
  }

  // 2. Parse the DOB string.
  // We use parseISO as it's a standard format.
  // If your DOB is not ISO (e.g., 'dd/MM/yyyy'), use parse() instead.
  const birthDate = parseISO(userData.dob);

  // 3. Check for invalid date
  if (isNaN(birthDate.getTime())) {
    console.error("Validation failed: userData.dob is an invalid date string.");
    return false;
  }

  // 4. Calculate the age
  const today = new Date();
  const calculatedAge = differenceInYears(today, birthDate);

  // 5. Handle invalid age (e.g., DOB is in the future)
  if (calculatedAge < 0) {
    console.error("Validation failed: DOB is in the future.");
    return false;
  }
  // --- End: Age Calculation ---

  const allItemsValid = data.every((item) => {
    const hasRequiredFields =
      item.id?.trim() &&
      item.state?.trim() &&
      item.code > 0 &&
      (item.city?.trim() || item.village?.trim());

    const hasValidNumbers = item.from_age >= 0 && item.to_age > 0;
    const isRangeCorrect = item.from_age <= item.to_age;

    // --- MODIFIED LINE ---
    // Uses the `calculatedAge` from date-fns
    const isWithinUserAge =
      item.to_age <= calculatedAge && item.from_age <= calculatedAge;

    return (
      hasRequiredFields && hasValidNumbers && isRangeCorrect && isWithinUserAge
    );
  });

  if (!allItemsValid) {
    return false;
  }

  // --- All checks below remain unchanged ---

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
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [allowNext, setAllowNext] = useState(false);
  const { db, sqlite, tabId } = useSQLite();
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const handleAddNewUi = () => {
    if (residentialData.length > 0) setIsUnsaved(true);
    const translator = ShortUUID();
    const newResidential: RESIDENTIAL_TYPE = {
      id: translator.new(),
      from_age: 0,
      to_age: 0,
      city: "",
      state: "",
      code: 0,
      village: "",
    };

    setResidentialData((d) => [...d, newResidential]);
  };
  const handleRemoveUi = (id: string) => {
    if (residentialData.length === 1) return;
    setIsUnsaved(true);
    setRemovedIds((prev) => [...prev, id]);
    setResidentialData((d) => d.filter((x) => x.id !== id));
  };
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
  useBlockNavigation(isUnsaved, () => {
    setAlert({
      show: true,
      header: "Unsaved changes",
      message: "You have unsaved changes. Are you sure you want to leave?",
    })
  })
  const handleSaveFresh = async () => {
    if (
      db &&
      !(await checkElibleToSave(
        db,
        id || "",
        tabId,
        "residential_history",
        "user_id"
      ))
    ) {
      return setAlert({
        header: "Restricted access",
        message: "This user was registered with a different tab id.",
        show: true,
      });
    }
    const userData = await fetchCurrentUserDetails(db, id || "");
    console.log(userData);
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
        "created_at",
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
          `'${new Date().toLocaleString("sv-SE").replace("T", " ")}'`,
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
      setIsUnsaved(false);
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
  console.log(residentialData.length);
  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    const currentId = searchParams?.get("id") || "";
    await loadExisting(currentId);
    setIsUnsaved(false);
    event.detail.complete();
  };

  console.log(isUnsaved);
  return (
    <>
      <IonPage>
        <Header title={"Residential History"} />
        <IonContent class="" fullscreen>
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent
              className="spinner-only"
              refreshingSpinner="circles"
            ></IonRefresherContent>
          </IonRefresher>
          <RegistrationCrumbs 
            currentPageLabel="Residential History"
          />
          <ShowRegisteredTab
            id={id || ""}
            table_name="residential_history"
            field_name="user_id"
          />

          {/* Use slightly more padding and less aggressive vertical spacing */}
          <main className="mt-6 p-3 space-y-6">
            {residentialData.map((item) => (
              <AddResidential
                handleRemoveUi={handleRemoveUi}
                key={item.id}
                data={item}
                setResidentialData={setResidentialData}
                setIsUnsaved={setIsUnsaved}
              />
            ))}
          </main>

          {/* Aligned all buttons to the right (end) for a cleaner look */}
          <div className="mt-4 flex justify-end gap-3 px-3 pb-5">
            <Button
              label="Add new"
              icon="pi pi-plus" // Added icon
              outlined // Use outlined instead of text + raised
              className="font-bold"
              onClick={handleAddNewUi}
            />
            {editFlag === "yes" ? (
              <Button
                label="Save"
                icon="pi pi-check" // Added icon
                raised
                className="font-bold"
                onClick={handleSaveUpdated}
              />
            ) : (
              <Button
                label="Save"
                icon="pi pi-check" // Added icon
                severity="success"
                raised
                className="font-bold"
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

          {/* Use justify-between for PREV/NEXT and reduce the huge margin-top */}
          <div className="flex gap-2 mt-8 justify-between pb-5 px-3">
            <Link to={`/tab1?id=${id}&edit=no`}>
              <Button
                label="PREV"
                icon="pi pi-arrow-left" // Added icon
                severity="secondary" // Use secondary style for PREV
                outlined
              />
            </Link>

            <Link to={`/tab6?id=${id}`}>
              <Button
                label="NEXT"
                icon="pi pi-arrow-right" // Added icon
                iconPos="right"
                outlined
                severity="secondary"
              />
            </Link>
          </div>

          {/* MOVED THIS DIV INSIDE IonContent so it provides scrollable padding */}
          <div className="pb-[250px]"></div>
        </IonContent>
        {/* The spacer div was here, which is incorrect. It's now moved up. */}
      </IonPage>
    </>
  );
}
