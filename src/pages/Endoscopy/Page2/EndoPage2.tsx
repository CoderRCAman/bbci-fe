import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useSQLite } from "../../../utils/Sqlite";
import {
  IonAlert,
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
} from "@ionic/react";
import Header from "../../../components/Header";
import ShowRegisteredTab from "../../../components/ShowRegisteredTab";
import { Link } from "react-router-dom";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import shortUUID from "short-uuid";
import { saveToStore } from "../../../utils/helper";
import { checkElibleToSave } from "../../Registration/Tab11/data";
export interface REPORTS_DB {
  id: string;
  user_id: string | null;
  endo_id: string | null;
  // Oral Cavity
  oc_mucosa_status: "Normal" | "Lesion" | null;
  oc_description: string | null;
  // Oesophagus
  oe_status: "Normal" | "Lesion" | null;
  oe_description: string | null;
  // GE Junction
  ge_level: string | null;
  ge_status: "Normal" | "Lesion" | null;
  ge_description: string | null;
  // Stomach (ST)
  st_fundus_status: "Normal" | "Description" | null;
  st_fundus_desc: string | null;
  st_body_status: "Normal" | "Description" | null;
  st_body_desc: string | null;
  st_antrum_status: "Normal" | "Description" | null;
  st_antrum_desc: string | null;

  created_at: string | null;
  updated_at: string | null;
  tab_id: string | null;
}

export type STOMACH_LESIANS = {
  id: string;
  report_id: string; // NOT NULL → required
  location: string | null;
  appearance: string | null;
  mucosa_v: string | null;
  mucosa_s: string | null;
  mucosa_d: string | null;
  created_at: string | null;
  updated_at: string | null;
  tab_id: string | null;
};

const CustomRadio = ({
  id,
  name,
  value,
  checked,
  onChange,
  label,
}: {
  id: string;
  name: string;
  value: any;
  checked: boolean;
  onChange: any;
  label: string;
}) => (
  <div className="flex items-center">
    <input
      id={id}
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      className="w-4 h-4"
    />
    <label
      htmlFor={id}
      className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
    >
      {label}
    </label>
  </div>
);

export default function EndoPage2() {
  const [editFlag, setEditFlag] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [reportId, setReportId] = useState(shortUUID().generate());
  const [id, setId] = useState("");
  const { db, sqlite, tabId } = useSQLite();
  const [participant, setParticipants] = useState<any | null>(null);
  const [endoId, setEndoId] = useState("");
  const [alert, setAlert] = useState({
    show: false,
    header: "",
    message: "",
  });

  const [oralCavityMucosa, setOralCavityMucosa] = useState("Normal");
  const [oralCavityMucosaDescription, setOralCavityMucosaDescription] =
    useState("");

  // State for Oesophagus
  const [oesophagus, setOesophagus] = useState("Normal");
  const [oesophagusDescription, setOesophagusDescription] = useState("");

  // State for GE Junction
  const [geJunctionLevel, setGeJunctionLevel] = useState("");
  const [geJunction, setGeJunction] = useState("Normal");
  const [geJunctionDescription, setGeJunctionDescription] = useState("");
  const [stomachFundus, setStomachFundus] = useState("Normal");
  const [stomachFundusDescription, setStomachFundusDescription] = useState("");
  const [stomachBody, setStomachBody] = useState("Normal");
  const [stomachBodyDescription, setStomachBodyDescription] = useState("");
  const [stomachAntrum, setStomachAntrum] = useState("Normal");
  const [stomachAntrumDescription, setStomachAntrumDescription] = useState("");
  // State for dynamic lesions
  const [stomachLesions, setStomachLesions] = useState<any[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  async function fetchExisting(curId: string, endo_id: string) {
    try {
      const query = `
                  select * from patients where id = '${curId}'
              `;
      const res = await db?.query(query);
      setParticipants(res?.values?.[0]);
      const results = await db?.query(
        `SELECT * FROM endo_reports WHERE endo_id = ? LIMIT 1`,
        [endo_id]
      );

      if (results && results.values?.length === 0) return;

      const report = results?.values?.[0];
      setReportId(report?.id ?? shortUUID().generate());
      setOralCavityMucosa(report?.oc_mucosa_status ?? "Normal");
      setOralCavityMucosaDescription(report?.oc_description ?? "");
      setOesophagus(report?.oe_status ?? "Normal");
      setOesophagusDescription(report?.oe_description ?? "");
      setGeJunctionLevel(report?.ge_level ?? "");
      setGeJunction(report?.ge_status ?? "Normal");
      setGeJunctionDescription(report?.ge_description ?? "");
      setStomachFundus(report?.st_fundus_status ?? "Normal");
      setStomachFundusDescription(report?.st_fundus_desc ?? "");
      setStomachBody(report?.st_body_status ?? "Normal");
      setStomachBodyDescription(report?.st_body_desc ?? "");
      setStomachAntrum(report?.st_antrum_status ?? "Normal");
      setStomachAntrumDescription(report?.st_antrum_desc ?? "");

      // Fetch related stomach lesions
      const lesions = await db?.query(
        `SELECT * FROM stomach_lesions WHERE report_id = ?`,
        [report.id]
      );
      setStomachLesions(lesions?.values || []);
      console.log(res, results, lesions);
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    const curId = searchParams.get("id") || "";
    setId(curId);
    const edit = searchParams.get("edit") || "";
    const endoIdd = searchParams.get("endoId") || "";
    setEndoId(searchParams.get("endoId") || "");
    setEditFlag(edit === "yes");
    fetchExisting(curId, endoIdd);
  }, [location.pathname, db]);
  const handleAddLesion = () => {
    const newLesion = {
      id: shortUUID().generate(), // Unique ID for React key
      location: "",
      appearance: "",
      mucosa_v: "", // Regular, Irregular, Absent
      mucosa_s: "", // Regular, Irregular, Absent
      mucosa_d: "", // Present, Absent
    };
    setStomachLesions([...stomachLesions, newLesion]);
  };

  /**
   * Removes a lesion from the array by its ID.
   */
  const handleRemoveLesion = (id: string) => {
    setDeletedIds([...deletedIds, id]);
    setStomachLesions(stomachLesions.filter((lesion) => lesion.id !== id));
  };

  /**
   * Updates a specific field of a specific lesion.
   */
  const handleLesionChange = (id: string, field: string, value: any) => {
    setStomachLesions(
      stomachLesions.map((lesion) =>
        lesion.id === id ? { ...lesion, [field]: value } : lesion
      )
    );
  };

  const handleOralCavityChange = (newValue: "Normal" | "Lesion") => {
    // If switching TO Normal FROM Lesion, clear description
    if (newValue === "Normal" && oralCavityMucosa === "Lesion") {
      setOralCavityMucosaDescription("");
    }
    setOralCavityMucosa(newValue);
  };

  const handleOesophagusChange = (newValue: "Normal" | "Lesion") => {
    if (newValue === "Normal" && oesophagus === "Lesion") {
      setOesophagusDescription("");
    }
    setOesophagus(newValue);
  };

  const handleGeJunctionChange = (newValue: "Normal" | "Lesion") => {
    if (newValue === "Normal" && geJunction === "Lesion") {
      setGeJunctionDescription("");
    }
    setGeJunction(newValue);
  };

  const handleStomachFundusChange = (newValue: "Normal" | "Description") => {
    if (newValue === "Normal" && stomachFundus === "Description") {
      setStomachFundusDescription("");
    }
    setStomachFundus(newValue);
  };

  const handleStomachBodyChange = (newValue: "Normal" | "Description") => {
    if (newValue === "Normal" && stomachBody === "Description") {
      setStomachBodyDescription("");
    }
    setStomachBody(newValue);
  };

  const handleStomachAntrumChange = (newValue: "Normal" | "Description") => {
    if (newValue === "Normal" && stomachAntrum === "Description") {
      setStomachAntrumDescription("");
    }
    setStomachAntrum(newValue);
  };
  const LesionRadioGroup = ({ lesion, field, options }: any) => (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {options.map((option: any) => (
        <CustomRadio
          key={option}
          id={`lesion-${lesion.id}-${field}-${option}`}
          name={`lesion-${lesion.id}-${field}`}
          value={option}
          checked={lesion[field] === option}
          onChange={(e: any) =>
            handleLesionChange(lesion.id, field, e.target.value)
          }
          label={option}
        />
      ))}
    </div>
  );
  async function handleSave() {
    try {
      console.log(oralCavityMucosa, oralCavityMucosaDescription);

      const createdAt =
        new Date().toLocaleString("sv-SE").replace("T", " ") || "";
      const updatedAt =
        new Date().toLocaleString("sv-SE").replace("T", " ") || "";
      if (
        db &&
        !(await checkElibleToSave(db, endoId, tabId, "endo_reports", "endo_id"))
      ) {
        return setAlert({
          header: "Restricted access",
          message: "This record was registered with a different tab id.",
          show: true,
        });
      }
      await db?.run(
        `
      INSERT INTO endo_reports (
        id, user_id, endo_id,
        oc_mucosa_status, oc_description,
        oe_status, oe_description,
        ge_level, ge_status, ge_description,
        st_fundus_status, st_fundus_desc,
        st_body_status, st_body_desc,
        st_antrum_status, st_antrum_desc,
        created_at, updated_at, tab_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        user_id = excluded.user_id,
        endo_id = excluded.endo_id,
        oc_mucosa_status = excluded.oc_mucosa_status,
        oc_description = excluded.oc_description,
        oe_status = excluded.oe_status,
        oe_description = excluded.oe_description,
        ge_level = excluded.ge_level,
        ge_status = excluded.ge_status,
        ge_description = excluded.ge_description,
        st_fundus_status = excluded.st_fundus_status,
        st_fundus_desc = excluded.st_fundus_desc,
        st_body_status = excluded.st_body_status,
        st_body_desc = excluded.st_body_desc,
        st_antrum_status = excluded.st_antrum_status,
        st_antrum_desc = excluded.st_antrum_desc,
        updated_at = excluded.updated_at,
        tab_id = excluded.tab_id;
      `,
        [
          reportId,
          id,
          endoId,
          oralCavityMucosa,
          oralCavityMucosaDescription,
          oesophagus,
          oesophagusDescription,
          geJunctionLevel,
          geJunction,
          geJunctionDescription,
          stomachFundus,
          stomachFundusDescription,
          stomachBody,
          stomachBodyDescription,
          stomachAntrum,
          stomachAntrumDescription,
          createdAt,
          updatedAt,
          tabId,
        ]
      );

      const now = new Date().toLocaleString("sv-SE").replace("T", " ") || "";

      for (const lesion of stomachLesions) {
        await db?.run(
          `
      INSERT INTO stomach_lesions (
        id, report_id, location, appearance,
        mucosa_v, mucosa_s, mucosa_d,
        created_at, updated_at, tab_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        report_id = excluded.report_id,
        location = excluded.location,
        appearance = excluded.appearance,
        mucosa_v = excluded.mucosa_v,
        mucosa_s = excluded.mucosa_s,
        mucosa_d = excluded.mucosa_d,
        updated_at = excluded.updated_at,
        tab_id = excluded.tab_id
      `,
          [
            lesion.id,
            reportId,
            lesion.location,
            lesion.appearance,
            lesion.mucosa_v,
            lesion.mucosa_s,
            lesion.mucosa_d,
            now,
            now,
            tabId,
          ]
        );
      }
      for (const ids of deletedIds) {
        await db?.run("DELETE FROM stomach_lesions WHERE id = ?", [ids]);
      }
      setAlert({
        header: "Success",
        message: "Report saved successfully!",
        show: true,
      });
      await saveToStore(sqlite);
    } catch (error) {
      console.log(error);
    }
  }
  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    const curId = searchParams.get("id") || "";
    const endoIdd = searchParams.get("endoId") || "";
    await fetchExisting(curId, endoIdd);
    event.detail.complete();
  };
  return (
    <>
      <IonPage>
        <Header title={"UGIE Record"} />
        <IonContent class="" fullscreen>
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent
              className="spinner-only"
              refreshingSpinner="circles"
            />
          </IonRefresher>
          <ShowRegisteredTab id={endoId || ""} table_name="endo_reports" field_name="endo_id" />
          <main className="space-y-10 p-2">
            <Card title="Participant's Details" className="shadow border">
              <div className="text-slate-600 dark:text-gray-300 space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold">ID: </span>
                  <span>{participant?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Name: </span>
                  <span>{participant?.name}</span>
                </div>
              </div>
            </Card>
            {/* --- Oral Cavity Section --- */}
            <div className="bg-white p-6 rounded-lg shadow border mb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                Oral Cavity
              </h2>
              <fieldset className="border border-gray-200 p-4 rounded-md">
                <legend className="text-sm font-semibold text-gray-600 px-2">
                  Mucosa
                </legend>
                <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
                  <CustomRadio
                    id="oc_normal"
                    name="oralCavityMucosa"
                    value="Normal"
                    onChange={(e: any) =>
                      handleOralCavityChange(e.target.value)
                    }
                    checked={oralCavityMucosa === "Normal"}
                    label="Normal"
                  />
                  <CustomRadio
                    id="oc_lesion"
                    name="oralCavityMucosa"
                    value="Lesion"
                    onChange={(e: any) =>
                      handleOralCavityChange(e.target.value)
                    }
                    checked={oralCavityMucosa === "Lesion"}
                    label="Lesion"
                  />
                </div>
                {oralCavityMucosa === "Lesion" && (
                  <div className="mt-4">
                    <label
                      htmlFor="oc_desc"
                      className="block text-gray-600 font-semibold mb-2 text-sm"
                    >
                      Description
                    </label>
                    <textarea
                      id="oc_desc"
                      value={oralCavityMucosaDescription}
                      onChange={(e) =>
                        setOralCavityMucosaDescription(e.target.value)
                      }
                      rows={3}
                      className="w-full p-2 border outline-none border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 transition"
                      placeholder="Enter lesion details..."
                    ></textarea>
                  </div>
                )}
              </fieldset>
            </div>

            {/* --- Oesophagus Section --- */}
            <div className="bg-white p-6 rounded-lg shadow border mb-6">
              <h2 className="text-xl font-semibold border-b text-gray-700 mb-4 pb-2">
                Oesophagus
              </h2>
              <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
                <CustomRadio
                  id="oe_normal"
                  name="oesophagus"
                  value="Normal"
                  onChange={(e: any) => handleOesophagusChange(e.target.value)}
                  checked={oesophagus === "Normal"}
                  label="Normal"
                />
                <CustomRadio
                  id="oe_lesion"
                  name="oesophagus"
                  value="Lesion"
                  onChange={(e: any) => handleOesophagusChange(e.target.value)}
                  checked={oesophagus === "Lesion"}
                  label="Lesion"
                />
              </div>
              {oesophagus === "Lesion" && (
                <div className="mt-4">
                  <label
                    htmlFor="oe_desc"
                    className="block text-gray-600 font-semibold mb-2 text-sm"
                  >
                    Description
                  </label>
                  <textarea
                    id="oe_desc"
                    value={oesophagusDescription}
                    onChange={(e) => setOesophagusDescription(e.target.value)}
                    rows={3}
                    className="w-full p-2 border outline-none border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 transition"
                    placeholder="Enter lesion details..."
                  ></textarea>
                </div>
              )}
            </div>

            {/* --- GE Junction Section --- */}
            <div className="bg-white p-6 rounded-lg shadow border mb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                GE Junction
              </h2>
              <div className="mb-4">
                <label
                  htmlFor="ge_level"
                  className="block text-gray-600 font-semibold mb-2 text-sm"
                >
                  Level
                </label>
                <input
                  type="text"
                  id="ge_level"
                  value={geJunctionLevel}
                  onChange={(e) => setGeJunctionLevel(e.target.value)}
                  placeholder="Enter level in cm"
                  className="w-full p-2 border outline-none border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 transition"
                />
              </div>
              <fieldset className="border border-gray-200 p-4 rounded-md">
                <legend className="text-sm font-semibold text-gray-600 px-2">
                  Status
                </legend>
                <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
                  <CustomRadio
                    id="ge_normal"
                    name="geJunction"
                    value="Normal"
                    onChange={(e: any) =>
                      handleGeJunctionChange(e.target.value)
                    }
                    checked={geJunction === "Normal"}
                    label="Normal"
                  />
                  <CustomRadio
                    id="ge_lesion"
                    name="geJunction"
                    value="Lesion"
                    onChange={(e: any) =>
                      handleGeJunctionChange(e.target.value)
                    }
                    checked={geJunction === "Lesion"}
                    label="Lesion"
                  />
                </div>
                {geJunction === "Lesion" && (
                  <div className="mt-4">
                    <label
                      htmlFor="ge_desc"
                      className="block text-gray-600 font-semibold mb-2 text-sm"
                    >
                      Description
                    </label>
                    <textarea
                      id="ge_desc"
                      value={geJunctionDescription}
                      onChange={(e: any) =>
                        setGeJunctionDescription(e.target.value)
                      }
                      rows={3}
                      className="w-full p-2 border outline-none border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 transition"
                      placeholder="Enter lesion details..."
                    ></textarea>
                  </div>
                )}
              </fieldset>
            </div>

            {/* --- Stomach Section --- */}
            <div className="bg-white p-6 rounded-lg shadow border mb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                Stomach
              </h2>

              {/* Fundus */}
              <fieldset className="border border-gray-200 p-4 rounded-md mb-4">
                <legend className="text-sm font-semibold text-gray-600 px-2">
                  Fundus - Mucosal Appearance
                </legend>
                <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
                  <CustomRadio
                    id="s_fundus_normal"
                    name="stomachFundus"
                    value="Normal"
                    onChange={(e: any) =>
                      handleStomachFundusChange(e.target.value)
                    }
                    checked={stomachFundus === "Normal"}
                    label="Normal"
                  />
                  <CustomRadio
                    id="s_fundus_desc_radio"
                    name="stomachFundus"
                    value="Description"
                    onChange={(e: any) =>
                      handleStomachFundusChange(e.target.value)
                    }
                    checked={stomachFundus === "Description"}
                    label="Description"
                  />
                </div>
                {stomachFundus === "Description" && (
                  <div className="mt-4">
                    <label
                      htmlFor="s_fundus_desc"
                      className="block text-gray-600 font-semibold mb-2 text-sm"
                    >
                      Description
                    </label>
                    <textarea
                      id="s_fundus_desc"
                      value={stomachFundusDescription}
                      onChange={(e) =>
                        setStomachFundusDescription(e.target.value)
                      }
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 transition"
                      placeholder="Enter details..."
                    ></textarea>
                  </div>
                )}
              </fieldset>

              {/* Body */}
              <fieldset className="border border-gray-200 p-4 rounded-md mb-4">
                <legend className="text-sm font-semibold text-gray-600 px-2">
                  Body - Mucosal Appearance
                </legend>
                <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
                  <CustomRadio
                    id="s_body_normal"
                    name="stomachBody"
                    value="Normal"
                    onChange={(e: any) =>
                      handleStomachBodyChange(e.target.value)
                    }
                    checked={stomachBody === "Normal"}
                    label="Normal"
                  />
                  <CustomRadio
                    id="s_body_desc_radio"
                    name="stomachBody"
                    value="Description"
                    onChange={(e: any) =>
                      handleStomachBodyChange(e.target.value)
                    }
                    checked={stomachBody === "Description"}
                    label="Description"
                  />
                </div>
                {stomachBody === "Description" && (
                  <div className="mt-4">
                    <label
                      htmlFor="s_body_desc"
                      className="block text-gray-600 font-semibold mb-2 text-sm"
                    >
                      Description
                    </label>
                    <textarea
                      id="s_body_desc"
                      value={stomachBodyDescription}
                      onChange={(e) =>
                        setStomachBodyDescription(e.target.value)
                      }
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition"
                      placeholder="Enter details..."
                    ></textarea>
                  </div>
                )}
              </fieldset>

              {/* Antrum */}
              <fieldset className="border border-gray-200 p-4 rounded-md mb-4">
                <legend className="text-sm font-semibold text-gray-600 px-2">
                  Antrum - Mucosal Appearance
                </legend>
                <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
                  <CustomRadio
                    id="s_antrum_normal"
                    name="stomachAntrum"
                    value="Normal"
                    onChange={(e: any) =>
                      handleStomachAntrumChange(e.target.value)
                    }
                    checked={stomachAntrum === "Normal"}
                    label="Normal"
                  />
                  <CustomRadio
                    id="s_antrum_desc_radio"
                    name="stomachAntrum"
                    value="Description"
                    onChange={(e: any) =>
                      handleStomachAntrumChange(e.target.value)
                    }
                    checked={stomachAntrum === "Description"}
                    label="Description"
                  />
                </div>
                {stomachAntrum === "Description" && (
                  <div className="mt-4">
                    <label
                      htmlFor="s_antrum_desc"
                      className="block text-gray-600 font-semibold mb-2 text-sm"
                    >
                      Description
                    </label>
                    <textarea
                      id="s_antrum_desc"
                      value={stomachAntrumDescription}
                      onChange={(e) =>
                        setStomachAntrumDescription(e.target.value)
                      }
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 transition"
                      placeholder="Enter details..."
                    ></textarea>
                  </div>
                )}
              </fieldset>

              {/* --- Dynamic Lesions --- */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Lesions
                  </h3>
                </div>

                {stomachLesions.length === 0 && (
                  <p className="text-sm text-gray-500 text-center italic">
                    No lesions added.
                  </p>
                )}

                <div className="space-y-4">
                  {stomachLesions.map((lesion, index) => (
                    <div
                      key={lesion.id}
                      className="border border-gray-300 rounded-lg p-4 bg-gray-50/50 relative"
                    >
                      <h4 className="font-semibold text-gray-800 mb-3">
                        Lesion {index + 1}
                      </h4>
                      <button
                        onClick={() => handleRemoveLesion(lesion.id)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl px-2 py-0"
                        title="Remove Lesion"
                      >
                        &times;
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label
                            htmlFor={`lesion-loc-${lesion.id}`}
                            className="block text-gray-600 font-semibold mb-2 text-sm"
                          >
                            Location
                          </label>
                          <input
                            type="text"
                            id={`lesion-loc-${lesion.id}`}
                            value={lesion.location}
                            onChange={(e) =>
                              handleLesionChange(
                                lesion.id,
                                "location",
                                e.target.value
                              )
                            }
                            placeholder="e.g., Antrum, Lesser Curvature"
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`lesion-app-${lesion.id}`}
                            className="block text-gray-600 font-semibold mb-2 text-sm"
                          >
                            Appearance
                          </label>
                          <input
                            type="text"
                            id={`lesion-app-${lesion.id}`}
                            value={lesion.appearance}
                            onChange={(e) =>
                              handleLesionChange(
                                lesion.id,
                                "appearance",
                                e.target.value
                              )
                            }
                            placeholder="e.g., Ulcer, Polyp"
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition"
                          />
                        </div>
                      </div>

                      <fieldset className="border border-gray-200 p-4 rounded-md">
                        <legend className="text-sm font-semibold text-gray-600 px-2">
                          Mucosa
                        </legend>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              V
                            </label>
                            <LesionRadioGroup
                              lesion={lesion}
                              field="mucosa_v"
                              options={["Regular", "Irregular", "Absent"]}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              S
                            </label>
                            <LesionRadioGroup
                              lesion={lesion}
                              field="mucosa_s"
                              options={["Regular", "Irregular", "Absent"]}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              D
                            </label>
                            <LesionRadioGroup
                              lesion={lesion}
                              field="mucosa_d"
                              options={["Present", "Absent"]}
                            />
                          </div>
                        </div>
                      </fieldset>
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <Button
                    label="Add Lesions"
                    icon="pi pi-plus"
                    severity="info"
                    className="py-2"
                    onClick={handleAddLesion}
                  />
                </div>
              </div>
            </div>

            <div>
              <Button
                onClick={handleSave}
                icon="pi pi-check"
                label="Save"
                severity="success"
                className="px-10 py-2"
              />
            </div>
            <div className="mt-10 flex justify-between gap-2 ">
              <Link
                to={`/endo4?id=${id}&endoId=${endoId}&edit=${
                  editFlag ? "yes" : "no"
                }`}
              >
                <Button
                  label="PREV"
                  className="px-5 py-2 rounded"
                  outlined
                  severity="secondary"
                  icon="pi pi-arrow-left"
                />
              </Link>

              <Link
                to={`/endo3?id=${id}&endoId=${endoId}&edit=${
                  editFlag ? "yes" : "no"
                }`}
              >
                <Button
                  label="NEXT"
                  className="px-5 py-2 rounded"
                  severity="secondary"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  outlined
                />
              </Link>
            </div>
          </main>
        </IonContent>
        <div className="pb-[250px]"></div>

        <IonAlert
          isOpen={alert.show}
          onDidDismiss={() => setAlert((a) => ({ ...a, show: false }))}
          header={alert.header}
          message={alert.message}
          buttons={["OK"]}
        />
      </IonPage>
    </>
  );
}
