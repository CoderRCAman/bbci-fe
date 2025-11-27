import { IonAlert, IonContent, IonPage, IonRefresher, IonRefresherContent, RefresherEventDetail } from "@ionic/react";
import Header from "../../../components/Header";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import DemoInput from "./DemoInput";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { useSQLite } from "../../../utils/Sqlite";
import shortUUID from "short-uuid";
import { checkElibleToSave } from "../Tab11/data";
import { saveToStore } from "../../../utils/helper";
import ShowRegisteredTab from "../../../components/ShowRegisteredTab";
import { Card } from "primereact/card";
import { useBlockNavigation } from "../../../utils/blockBackNavigation";
import RegistrationCrumbs from "../../../components/RegistrationCrumbs";
import { set } from "date-fns";
export interface DEMOGRAPHIC_INFO {
  id: string;
  user_id: string;
  religion?: string;
  marital_status?: string;
  highest_education?: string;
  highest_education_spouse?: string;
  household_income?: string;
  mother_tongue?: string;
  place_of_birth?: string;
  tab_id?: string;
}
const initialState: DEMOGRAPHIC_INFO = {
  id: shortUUID().generate(),
  user_id: "",
  religion: "",
  marital_status: "",
  highest_education: "",
  highest_education_spouse: "",
  household_income: "",
  mother_tongue: "",
  place_of_birth: "",
  tab_id: "",
};
const data = [
  {
    type: "Religion",
    data: [
      "Hindu",
      "Jain",
      "Christian",
      "Muslim",
      "Parsi",
      "Buddhist",
      "Other",
    ],
    field: "religion",
  },
  {
    type: "Marital status",
    data: ["Unmarried", "Married", "Widowed", "Divorce/seperated", "Other"],
    field: "marital_status",
  },
  {
    type: "Highest level of education received by the subject",
    data: [
      "Nil, illiterate",
      "Literate",
      "Below Primary",
      "1st to 4th std",
      "5th - 8th std",
      "9th - 10th std",
      "11th - 12th",
      "Graduate and above",
      "Dont't know",
    ],
    field: "highest_education",
  },
  {
    type: "Highest level of education received by the spouse",
    data: [
      "Nil, illiterate",
      "Literate",
      "Below Primary",
      "1st to 4th std",
      "5th - 8th std",
      "9th - 10th std",
      "11th - 12th",
      "Graduate and above",
      "Dont't know",
    ],
    field: "highest_education_spouse",
  },
  {
    type: "What is your household income monthly?",
    data: [
      "Less than 5,000",
      "5,000 - 14,999",
      "15000 - 24,999",
      "25,000 - 34,999",
      "35,000 - 44,999",
      "45,999 - 54,999",
      "55,000 or more",
      "Does not know",
      "Deoes not want to disclose",
    ],
    field: "household_income",
  },
];

export default function Tab12() {
  const [alert, setAlert] = useState({
    show: false,
    header: "",
    message: "",
  });
  const { db, sqlite, tabId } = useSQLite();
  const [id, setId] = useState<string | null>("");
  const [isUnsaved, setIsUnsaved] = useState(false);
  const searchParams = new URLSearchParams(location.search);
  const [isDisabled, setIsDisabled] = useState(false)
  const [demographicInfo, setDemographicInfo] =
    useState<DEMOGRAPHIC_INFO>(initialState);
  useEffect(() => {
    setId(searchParams?.get("id"));
  }, []);
  async function fetchExisting() {
    try {
      const res = await db?.query(
        `
                select * from demographic_info where user_id = '${id}'
          `
      );
      if (res?.values?.length === 0) {
        setDemographicInfo({ ...initialState, user_id: id!! });
      } else {
        const values = res?.values as DEMOGRAPHIC_INFO[];
        setDemographicInfo(values[0]);
        setIsDisabled(values[0].tab_id !== tabId)
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    if (db === null) return;
    const id = searchParams?.get("id") || "";
    setId(id);
    fetchExisting();
  }, [db, location.pathname]);
  useBlockNavigation(isUnsaved, () => {
    setAlert({
      show: true,
      header: "Unsaved changes",
      message: "You have unsaved changes. Are you sure you want to leave?"
    })
  })
  const handleChange = (type: string, value: string) => {
    setIsUnsaved(true);
    setDemographicInfo((d) => ({ ...d, [type]: value }));
  };
  console.log(demographicInfo)
  async function handleSave() {
    try {
      if (!db || !sqlite) return;
      if (db && !(await checkElibleToSave(db, id || "", tabId, "demographic_info", "user_id"))) {
        return setAlert({
          header: "Restricted access",
          message: "This user was registered with a different tab id.",
          show: true,
        });
      }
      const query = `
                    INSERT INTO demographic_info (
                    id,
                    user_id,
                    religion,
                    marital_status,
                    highest_education,
                    highest_education_spouse,
                    household_income,
                    mother_tongue,
                    place_of_birth,
                    tab_id ,
                    created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                    religion = excluded.religion,
                    marital_status = excluded.marital_status,
                    highest_education = excluded.highest_education,
                    highest_education_spouse = excluded.highest_education_spouse,
                    household_income = excluded.household_income,
                    mother_tongue = excluded.mother_tongue,
                    place_of_birth = excluded.place_of_birth
                `;

      const values = [
        demographicInfo.id,
        id,
        demographicInfo.religion,
        demographicInfo.marital_status,
        demographicInfo.highest_education,
        demographicInfo.highest_education_spouse,
        demographicInfo.household_income,
        demographicInfo.mother_tongue,
        demographicInfo.place_of_birth,
        tabId,
        new Date().toLocaleString("sv-SE").replace("T", " "),
      ];
      await db.run(query, values);
      await saveToStore(sqlite);
      setIsUnsaved(false);
      setAlert({
        show: true,
        header: "Success",
        message: "Saved successfully",
      });
    } catch (error) {
      console.log(error);
    }
  }
  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await fetchExisting();
    setIsUnsaved(false);
    event.detail.complete();
  };
  return (
    <IonPage>
      <Header
        // Using 'id' variable, following the pattern from your ShowRegisteredTab
        title={id ? "Edit Demographic Information" : "Demographic Information"}
      />
      <IonContent class="" fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            className="spinner-only"
            refreshingSpinner="circles"
          />
        </IonRefresher>
        <RegistrationCrumbs
          currentPageLabel="Demographic Info"
        />
        <ShowRegisteredTab id={id || ""} table_name="demographic_info" field_name="user_id" />

        {/* Use a Card for a premium container. 'm-3' adds margin. */}
        <Card title="Demographic Information" className="m-3 shadow-lg">
          {/* 'p-fluid' makes child inputs full-width.
          'p-4' adds padding inside the card.
          'space-y-7' adds vertical spacing.
      */}
          <div className="p-fluid space-y-7 p-4">
            {data?.map((d, index) => (
              <DemoInput
                key={index}
                item={d}
                handleChange={handleChange}
                data={demographicInfo}
                isDisabled={isDisabled}
              />
            ))}

            {/* These inputs are now part of the same fluid grid */}
            <FloatLabel>
              <InputText
                // Removed className="border-1 p-2 w-[60%]"
                value={demographicInfo?.mother_tongue || ""}
                onChange={(e) => handleChange("mother_tongue", e.target.value)}
                disabled={isDisabled}
              />
              <label>What is your mother tongue?</label>
            </FloatLabel>

            <FloatLabel>
              <InputText
                // Removed className="border-1 p-2 w-[60%]"
                onChange={(e) => handleChange("place_of_birth", e.target.value)}
                value={demographicInfo?.place_of_birth || ""}
                disabled={isDisabled}
              />
              <label>What is your place of birth?</label>
            </FloatLabel>

            {/* Align the save button to the right */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSave}
                label="Save"
                disabled={isDisabled}
                severity="success"
                icon="pi pi-check" // Added icon
                raised // Added for emphasis
              />
            </div>
          </div>
        </Card>

        <IonAlert
          isOpen={alert?.show}
          onDidDismiss={() => setAlert((a) => ({ ...a, show: false }))}
          header={alert?.header}
          message={alert?.message}
          buttons={["OK"]}
        />

        {/* Cleaned up button styling and container padding */}
        <div className="pt-8 pb-2 flex justify-end gap-2 px-3">
          <Link to={"/tab11?id=" + id}>
            <Button
              // Removed className="px-10 py-2 rounded"
              label="PREV"
              icon="pi pi-arrow-left" // Added icon
              severity="secondary" // Use secondary style
              outlined
            />
          </Link>
        </div>

        {/* MOVED this spacer div INSIDE IonContent */}
        <div className="pb-[250px]"></div>
      </IonContent>
      {/* The spacer div was incorrectly here */}
    </IonPage>
  );
}
