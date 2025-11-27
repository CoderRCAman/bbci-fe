import {
  IonAlert,
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonToast,
  RefresherEventDetail,
} from "@ionic/react";
import Header from "../../../components/Header";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import shortUUID from "short-uuid";
import { Dropdown } from "primereact/dropdown";
import {
  getFamilyMembers,
  hasMasterData,
  hasRelativeData,
  relatives,
} from "./data";
import { useSQLite } from "../../../utils/Sqlite";
import { saveToStore } from "../../../utils/helper";
import { checkElibleToSave } from "../Tab11/data";
import ShowRegisteredTab from "../../../components/ShowRegisteredTab";
import { chevronDownCircleOutline } from "ionicons/icons";
import { Card } from "primereact/card";
import { useBlockNavigation } from "../../../utils/blockBackNavigation";
import RegistrationCrumbs from "../../../components/RegistrationCrumbs";
import { differenceInYears } from "date-fns";
export type FAMILY_HISTORY_OF_CANCER_MASTER = {
  id: string;
  user_id: string;
  brothers: number;
  sisters: number;
  sons: number;
  daughters: number;
  history_of_cancer: number; // 0 or 1
};

export type FAMILY_HISTORY_OF_CANCER_RELATIVES = {
  id: string;
  user_id: string;
  relation: string;
  code: number;
  age_at_diagnosis: number;
  cancer_site: string;
  treatment_received: number; // 0 or 1
};

const initialState: FAMILY_HISTORY_OF_CANCER_MASTER[] = [
  {
    id: shortUUID().generate(),
    user_id: "",
    brothers: 0,
    sisters: 0,
    sons: 0,
    daughters: 0,
    history_of_cancer: 0,
  },
];

const initialStateRelatives: FAMILY_HISTORY_OF_CANCER_RELATIVES[] = [
  {
    id: shortUUID().generate(),
    relation: "",
    code: 0,
    age_at_diagnosis: 0,
    cancer_site: "",
    treatment_received: 0,
    user_id: "",
  },
];

export default function Tab7() {
  const [id, setId] = useState<string | null>("");
  const { db, sqlite, tabId } = useSQLite();
  const searchParams = new URLSearchParams(location.search);
  const [familyHistoryMaster, setfamilyHistoryMaster] = useState(initialState);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [ageLimit, setAgeLimit] = useState(-1);
  const [isDisabled, setIsDisabled] = useState(false);
  const [familyHistoryRelatives, setfamilyHistoryRelatives] = useState(
    initialStateRelatives
  );
  const [alert, setAlert] = useState({
    show: false,
    header: "",
    message: "",
  });
  const [toast, setToast] = useState({
    show: false,
    message: "",
    success: false,
  });
  async function fetchInitialState(currentId: string) {
    try {
      const res1 = await db?.query(`
           select * from FAMILY_HISTORY_OF_CANCER_MASTER where user_id = '${currentId}'
          `);
      if (res1?.values && res1?.values?.length > 0) {
        setfamilyHistoryMaster(
          res1?.values as FAMILY_HISTORY_OF_CANCER_MASTER[]
        );
        if (res1?.values?.[0]?.tab_id)
          setIsDisabled(res1?.values[0]?.tab_id !== tabId);
      } else {
        setfamilyHistoryMaster(initialState);
      }
      const res2 = await db?.query(`
           select * from FAMILY_HISTORY_OF_CANCER_RELATIVES where user_id = '${currentId}'
          `);
      if (res2?.values && res2?.values?.length > 0) {
        setfamilyHistoryRelatives(
          res2?.values as FAMILY_HISTORY_OF_CANCER_RELATIVES[]
        );
      } else {
        setfamilyHistoryRelatives(initialStateRelatives);
      }
      const res3 = await db?.query(`select * from patients where id = '${currentId}' ;`);
      const values3 = res3?.values;
      setAgeLimit(differenceInYears(new Date(), new Date(values3?.[0].dob)))
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    const currentId = searchParams?.get("id") || "";
    setId(currentId);
    setIsDisabled(false);
    if (isUnsaved) return;
    fetchInitialState(currentId);
  }, [location.pathname, db]);
  useBlockNavigation(isUnsaved, () => {
    setAlert({
      show: true,
      header: "Unsaved changes",
      message: "You have unsaved changes. Are you sure you want to leave?",
    })
  });
  const handleAddNewUi = () => {
    const translator = shortUUID();
    const newRelatives: FAMILY_HISTORY_OF_CANCER_RELATIVES = {
      id: translator.new(),
      relation: "",
      code: 0,
      age_at_diagnosis: 0,
      cancer_site: "",
      treatment_received: 0,
      user_id: "",
    };
    setIsUnsaved(true);
    setfamilyHistoryRelatives((d) => [...d, newRelatives]);
  };
  const handleRemoveUi = (id: string) => {
    if (familyHistoryRelatives.length === 1) return;
    setIsUnsaved(true);
    setRemovedIds((prev) => [...prev, id]);
    setfamilyHistoryRelatives((d) => d.filter((x) => x.id !== id));
  };
  const handleChangeRelative = (id: string, field: string, value: any) => {
    setIsUnsaved(true);
    setfamilyHistoryRelatives((d) =>
      d.map((item) => (item.id == id ? { ...item, [field]: value } : item))
    );
  };
  const handleChangeMaster = (id: string, field: string, value: any) => {
    if (+value > 9 || +value < 0)
      return setToast({
        show: true,
        message: "Value must be between 0 and 9",
        success: false,
      });
    setIsUnsaved(true);
    setfamilyHistoryMaster((d) =>
      d.map((item) => (item.id == id ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = async () => {
    try {
      if (
        db &&
        !(await checkElibleToSave(
          db,
          id || "",
          tabId,
          "FAMILY_HISTORY_OF_CANCER_MASTER",
          "user_id"
        ))
      ) {
        return setAlert({
          header: "Restricted access",
          message: "This user was registered with a different tab id.",
          show: true,
        });
      } 
      console.log(familyHistoryRelatives)
      if (familyHistoryMaster[0].history_of_cancer && familyHistoryRelatives.some(item =>  !item.code || !item.cancer_site || !item.treatment_received))
        return setAlert({
          header: "Required fields",
          message: "Please fill in all first degree relatives fields",
          show: true,
        })
      if (hasMasterData(familyHistoryMaster[0])) {
        const query = `
                    INSERT INTO FAMILY_HISTORY_OF_CANCER_MASTER (
                      id,
                      user_id,
                      brothers,
                      sisters,
                      sons,
                      daughters,
                      history_of_cancer,
                      created_at , 
                      tab_id
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)
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
          familyHistoryMaster[0].history_of_cancer,
          new Date().toLocaleString("sv-SE").replace("T", " "),
          tabId,
        ];

        await db?.run(query, values);
      }

      for (const item of familyHistoryRelatives) {
        if (hasRelativeData(item)) {
          console.log("oihoi");
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
            item.treatment_received,
          ];

          await db?.run(query, values);
          for (const id of removedIds) {
            await db?.run(
              `delete from FAMILY_HISTORY_OF_CANCER_RELATIVES where id = '${id}'`
            );
          }
        }
      }
      setIsUnsaved(false);
      setAlert({
        show: true,
        header: "Success!",
        message: "Data saved successfully!",
      });
      await saveToStore(sqlite);
    } catch (error) {
      console.log(error);
      setAlert({
        show: true,
        header: "Error!",
        message: "Something went wrong during synch back!",
      });
    }
  };
  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    const currentId = searchParams?.get("id") || "";
    await fetchInitialState(currentId);
    setIsUnsaved(false);
    event.detail.complete();
  };
  return (
    <IonPage>
      <Header
        title={0 ? "Edit Family History of Cancer" : "Family History of Cancer"}
      />
      <IonContent class="" fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            className="spinner-only" // <-- Add this class
            refreshingSpinner="circles"
          // You can remove the other text props
          ></IonRefresherContent>
        </IonRefresher>
        <RegistrationCrumbs
          currentPageLabel="Family History"
        />
        <ShowRegisteredTab
          id={id || ""}
          table_name="family_history_of_cancer_master"
          field_name="user_id"
        />
        <main className="p-2 text-slate-600">
          <Card
            title={() => (
              <div className="flex items-center">
                <h4 className="text-slate-500 font-semibold mb-0">
                  {" "}
                  {/* mb-0 overrides card title default margin */}
                  How many first degree relatives?
                  <span className="text-xs font-normal italic ml-2">
                    {" "}
                    {/* Cleaner spacing and weight */}
                    (Excluding those who died within the first year of age)
                  </span>
                </h4>
              </div>
            )}
            className="w-full shadow-md" // Adds a professional shadow
            key={familyHistoryMaster[0]?.history_of_cancer} // Preserving your original key
          >
            {/* This is the 2x2 Grid you asked for, using WindiCSS */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              {/* Item 1: Brothers */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="brothers"
                  className="font-semibold text-gray-700 text-sm"
                >
                  Brothers
                </label>
                <InputText
                  id="brothers"
                  keyfilter={"int"}
                  type="number"
                  disabled={isDisabled}
                  placeholder="0" // Placeholder "0" is clearer for number inputs
                  className="p-inputtext-sm w-full" // PrimeReact's small size + full width
                  value={familyHistoryMaster[0]?.brothers.toString()}
                  onChange={(e) =>
                    handleChangeMaster(
                      familyHistoryMaster[0].id,
                      "brothers",
                      e.target.value === "" ? "" : parseInt(e.target.value)
                    )
                  }
                />
              </div>

              {/* Item 2: Sisters */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="sisters"
                  className="font-semibold text-gray-700 text-sm"
                >
                  Sisters
                </label>
                <InputText
                  id="sisters"
                  keyfilter={"int"}
                  type="number"
                  placeholder="0"
                  disabled={isDisabled}
                  className="p-inputtext-sm w-full"
                  value={familyHistoryMaster[0]?.sisters.toString()}
                  onChange={(e) =>
                    handleChangeMaster(
                      familyHistoryMaster[0].id,
                      "sisters",
                      e.target.value === "" ? "" : parseInt(e.target.value)
                    )
                  }
                />
              </div>

              {/* Item 3: Sons */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="sons"
                  className="font-semibold text-gray-700 text-sm"
                >
                  Sons
                </label>
                <InputText
                  id="sons"
                  keyfilter={"int"}
                  type="number"
                  disabled={isDisabled}
                  placeholder="0"
                  className="p-inputtext-sm w-full"
                  value={familyHistoryMaster[0]?.sons.toString()}
                  onChange={(e) =>
                    handleChangeMaster(
                      familyHistoryMaster[0].id,
                      "sons",
                      e.target.value === "" ? "" : parseInt(e.target.value)
                    )
                  }
                />
              </div>

              {/* Item 4: Daughters */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="daughters"
                  className="font-semibold text-gray-700 text-sm"
                >
                  Daughters
                </label>
                <InputText
                  id="daughters"
                  keyfilter={"int"}
                  type="number"
                  disabled={isDisabled}
                  placeholder="0"
                  className="p-inputtext-sm w-full"
                  value={familyHistoryMaster[0]?.daughters.toString()}
                  onChange={(e) =>
                    handleChangeMaster(
                      familyHistoryMaster[0].id,
                      "daughters",
                      isNaN(parseInt(e.target.value))
                        ? 0
                        : parseInt(e.target.value)
                    )
                  }
                />
              </div>
            </div>
          </Card>
          <div className="mt-5 border rounded p-2">
            <p className="text-slate-500 text-sm font-semibold ">
              Has there been any history of cancer in any of your first degree
              relatives?
            </p>
            <div className="flex gap-4 items-center  text-md">
              <div className="space-x-2">
                <input
                  type="radio"
                  value={1}
                  disabled={isDisabled}
                  checked={familyHistoryMaster?.[0]?.history_of_cancer === 1}
                  onChange={(e) =>
                    setfamilyHistoryMaster([
                      {
                        ...familyHistoryMaster[0],
                        history_of_cancer: parseInt(e.target.value),
                      },
                    ])
                  }
                />
                <span>YES </span>
              </div>
              <div className="space-x-2">
                <input
                  type="radio"
                  value={2}
                  disabled={isDisabled}
                  checked={familyHistoryMaster?.[0]?.history_of_cancer === 2}
                  onChange={(e) =>
                    setfamilyHistoryMaster([
                      {
                        ...familyHistoryMaster[0],
                        history_of_cancer: parseInt(e.target.value),
                      },
                    ])
                  }
                />
                <span>NO </span>
              </div>
              <div className="space-x-2">
                <input
                  type="radio"
                  value={8}
                  disabled={isDisabled}
                  checked={familyHistoryMaster?.[0]?.history_of_cancer === 8}
                  onChange={(e) =>
                    setfamilyHistoryMaster([
                      {
                        ...familyHistoryMaster[0],
                        history_of_cancer: parseInt(e.target.value),
                      },
                    ])
                  }
                />
                <span>DON'T KNOW </span>
              </div>
              <div className="space-x-2">
                <input
                  type="radio"
                  value={9}
                  disabled={isDisabled}
                  checked={familyHistoryMaster?.[0]?.history_of_cancer === 9}
                  onChange={(e) =>
                    setfamilyHistoryMaster([
                      {
                        ...familyHistoryMaster[0],
                        history_of_cancer: parseInt(e.target.value),
                      },
                    ])
                  }
                />
                <span>REFUSED TO ANSWER</span>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h4 className="font-semibold text-sm text-slate-500 mb-2">
              List all your first degree (blood) relatives, who ever had a
              diagnosis of cancer
            </h4>
            <div className="flex flex-col gap-4 p-2">
              {familyHistoryRelatives.map((rowData, rowIndex) => {
                // This is the unique key that was causing you trouble.
                // It's still needed on the Dropdown.
                const dropdownKey = `${rowData.id}-relatives-${familyHistoryMaster[0].brothers}-${familyHistoryMaster[0].sisters}-${familyHistoryMaster[0].sons}-${familyHistoryMaster[0].daughters}`;

                // Check if the form should be disabled
                const isDisabledd =
                  familyHistoryMaster?.[0]?.history_of_cancer !== 1;

                // --- 3. This is the "card" for each relative ---
                return (
                  <div
                    key={rowData.id}
                    className="border rounded-lg shadow-md p-4 bg-white"
                  >
                    {/* --- Card Header: Sr. No. and Remove Button --- */}
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                      <h3 className="font-bold text-lg text-slate-700">
                        Relative #{rowIndex + 1}
                      </h3>
                      <Button
                        disabled={isDisabled}
                        onClick={() => handleRemoveUi(rowData.id)}
                        icon="pi pi-trash"
                        className="p-button-danger p-button-text"
                      />
                    </div>

                    {/* --- Form fields in a responsive grid --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* --- Relation --- */}

                      {/* --- Relative code --- */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-600">
                          Relative code
                        </label>
                        <Dropdown

                          key={dropdownKey} // <-- Dynamic key is still here!
                          disabled={isDisabledd || isDisabled}
                          optionLabel="name"
                          value={rowData.code}
                          optionValue="value"
                          className="border-1 w-full"
                          placeholder="Select relative code"
                          options={getFamilyMembers(
                            familyHistoryMaster[0]?.brothers,
                            familyHistoryMaster[0]?.sisters,
                            familyHistoryMaster[0]?.sons,
                            familyHistoryMaster[0]?.daughters
                          )}
                          appendTo={document.body}
                          onChange={(e) =>
                            handleChangeRelative(rowData.id, "code", e.value)
                          }
                        />
                      </div>

                      {/* --- Age at diagnosis --- */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-600">
                          Age at diagnosis
                        </label>
                        <InputText
                          disabled={isDisabled || isDisabledd}
                          keyfilter={"int"}
                          type="number"
                          className="border-1 p-2 w-full"
                          value={rowData.age_at_diagnosis.toString()}
                          placeholder="e.g., 55"
                          onChange={(e) => {
                            const raw = e.target.value;
                            // Allow clearing the field
                            if (raw === "") {
                              handleChangeRelative(rowData.id, "age_at_diagnosis", "");
                              return;
                            }
                            let num = parseInt(raw);
                            // Enforce max
                            
                            handleChangeRelative(rowData.id, "age_at_diagnosis", num);
                          }
                          }
                        />
                      </div>

                      {/* --- Cancer Site --- */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-600">
                          Cancer Site
                        </label>
                        <InputText
                          disabled={isDisabled || isDisabledd}
                          className="border-1 p-2 w-full"
                          value={rowData.cancer_site}
                          placeholder="e.g., Lung"
                          onChange={(e) =>
                            handleChangeRelative(
                              rowData.id,
                              "cancer_site",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {/* --- Treatment received --- */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-600">
                          Received treatment*
                        </label>
                        <div className="flex gap-4 items-center h-full">
                          <div className="space-x-2">
                            <input
                              disabled={isDisabled || isDisabledd}
                              type="radio"
                              value={1}
                              checked={rowData.treatment_received === 1}
                              onChange={(e) =>
                                handleChangeRelative(
                                  rowData.id,
                                  "treatment_received",
                                  parseInt(e.target.value)
                                )
                              }
                            />
                            <span>YES </span>
                          </div>
                          <div className="space-x-2">
                            <input
                              type="radio"
                              disabled={isDisabled || isDisabledd}
                              value={2}
                              checked={rowData.treatment_received === 2}
                              onChange={(e) =>
                                handleChangeRelative(
                                  rowData.id,
                                  "treatment_received",
                                  parseInt(e.target.value)
                                )
                              }
                            />
                            <span>NO </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between gap-2 mt-10 ">
            <Button
              onClick={() => handleAddNewUi()}
              className="px-10 py-2"
              label="Add new row"
              severity="help"
              icon="pi pi-plus"
              disabled={isDisabled}
            />
            <Button
              onClick={() => handleSave()}
              label="Save"
              severity="success"
              icon="pi pi-check" // Added icon
              raised // Added for emphasis 
              disabled={isDisabled}
            />
          </div>
          <div className="pt-10 flex justify-between gap-2">
            <Link to={`/tab6?id=${id}`}>
              <Button
                className="px-10 py-2 rounded"
                label="PREV"
                icon="pi pi-arrow-left" // Added icon
                severity="secondary" // Use secondary style
                outlined
              />
            </Link>
            <Link to={`/tab8?id=${id}`}>
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
        <IonToast
          isOpen={toast.show}
          onDidDismiss={() => setToast((d) => ({ ...d, show: false }))}
          message={toast.message}
          duration={2000}
          position="bottom"
          style={{
            "--background": !toast.success ? "#dc2626" : "#16a34a",
            "--color": "#ffffff",
          }}
        />
        <div className="pb-[250px]"></div>
      </IonContent>
    </IonPage>
  );
}
