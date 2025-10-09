import { IonAlert, IonContent, IonPage } from "@ionic/react";
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
    type: "Regligion",
    data: [
      "Hindi",
      "Jain",
      "Christian",
      "Muslim",
      "Parsi",
      "Buddhist",
      "Other",
    ],
    field: 'religion'
  },
  {
    type: "Marital status",
    data: ["Unmarried", "Married", "Widowed", "Divorce/seperated", "Other"],
    field: "marital_status"
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
    field: 'highest_education'
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
    field: "highest_education_spouse"
  },
  {
    type: "What is your household income",
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
    field: 'household_income'
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
  const searchParams = new URLSearchParams(location.search);
  const [demographicInfo, setDemographicInfo] =
    useState<DEMOGRAPHIC_INFO>(initialState);
  useEffect(() => {
    setId(searchParams?.get("id"));
  }, []);
  useEffect(() => {
    if (db === null) return;
    const id = searchParams?.get("id") || "";
    async function fetchExisting() {
      try {
        const res = await db?.query(
          `
                select * from demographic_info where user_id = '${id}'
          `
        );

        if (res?.values?.length === 0) {
          setDemographicInfo({ ...initialState, user_id: id });
        } else {
          const values = res?.values as DEMOGRAPHIC_INFO[];
          console.log(values);
          setDemographicInfo(values[0]);
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchExisting();
  }, [db, location.pathname]);
  const handleChange = (type: string, value: string) => {
    setDemographicInfo((d) => ({ ...d, [type]: value }));
  };

  async function handleSave() {
    try {
      if (!db || !sqlite) return;
      if (!(await checkElibleToSave(db, id || "", tabId))) {
        return setAlert({
          header: "Error",
          message: "You are not eligible to save",
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
                    tab_id
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      ];
      await db.run(query, values);
      await saveToStore(sqlite);
      setAlert({
        show: true,
        header: "Success",
        message: "Saved successfully",
      });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <IonPage>
      <Header
        title={0 ? "Edit Demographic Information" : "Demographic Information"}
      />
      <IonContent class="" fullscreen>
        <main className="p-2 space-y-5">
          {data.map((d, index) => (
            <DemoInput
              key={index}
              item={d}
              handleChange={handleChange}
              data={demographicInfo}
            />
          ))}
          <div className="space-y-7 pt-3">
            <div>
              <FloatLabel>
                <InputText
                  className="border-1 p-2 w-[60%]"
                  value={demographicInfo.mother_tongue}
                  onChange={(e) =>
                    handleChange("mother_tongue", e.target.value)
                  }
                />
                <label>What is your mother tongue?</label>
              </FloatLabel>
            </div>
            <div>
              <FloatLabel>
                <InputText
                  className="border-1 p-2 w-[60%]"
                  onChange={(e) =>
                    handleChange("place_of_birth", e.target.value)
                  }
                  value={demographicInfo.place_of_birth}
                />
                <label>What is your place of birth?</label>
              </FloatLabel>
            </div>
          </div>
          <div>
            <Button label="Save" severity="success" onClick={handleSave} />
          </div>
        </main>
        <IonAlert
          isOpen={alert.show}
          onDidDismiss={() => setAlert((a) => ({ ...a, show: false }))}
          header={alert.header}
          message={alert.message}
          buttons={["OK"]}
        />
        <div className="pt-10 pb-2 flex justify-end gap-2">
          <Link to={"/tab11"}>
            <Button className="px-10 py-2 rounded" label="PREV" />
          </Link>
        </div>
      </IonContent>
    </IonPage>
  );
}
