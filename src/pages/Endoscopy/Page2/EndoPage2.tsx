import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useSQLite } from "../../../utils/Sqlite";
import { IonAlert, IonContent, IonPage } from "@ionic/react";
import Header from "../../../components/Header";
import ShowRegisteredTab from "../../../components/ShowRegisteredTab";
import { Link } from "react-router-dom";
import { Button } from "primereact/button";
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
  useEffect(() => {
    const curId = searchParams.get("id") || "";
    setId(curId);
    const edit = searchParams.get("edit") || "";
    const endoIdd = searchParams.get("endoId") || "";
    setEndoId(searchParams.get("endoId") || "");
    setEditFlag(edit === "yes");
  }, [location.pathname, db]);
  const handleAddLesion = () => {
    const newLesion = {
      id: Date.now(), // Unique ID for React key
      location: "",
      appearance: "",
      v: "", // Regular, Irregular, Absent
      s: "", // Regular, Irregular, Absent
      d: "", // Present, Absent
    };
    setStomachLesions([...stomachLesions, newLesion]);
  };

  /**
   * Removes a lesion from the array by its ID.
   */
  const handleRemoveLesion = (id: string) => {
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
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <>
      <IonPage>
        <Header title={"UGIE Record"} />
        <IonContent class="" fullscreen>
          <ShowRegisteredTab id={endoId || ""} table_name="ENDOSCOPY" />
          <main className="space-y-10 p-2">
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
                    onChange={(e: any) => setOralCavityMucosa(e.target.value)}
                    checked={oralCavityMucosa === "Normal"}
                    label="Normal"
                  />
                  <CustomRadio
                    id="oc_lesion"
                    name="oralCavityMucosa"
                    value="Lesion"
                    onChange={(e: any) => setOralCavityMucosa(e.target.value)}
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
                  onChange={(e: any) => setOesophagus(e.target.value)}
                  checked={oesophagus === "Normal"}
                  label="Normal"
                />
                <CustomRadio
                  id="oe_lesion"
                  name="oesophagus"
                  value="Lesion"
                  onChange={(e: any) => setOesophagus(e.target.value)}
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
                    onChange={(e: any) => setGeJunction(e.target.value)}
                    checked={geJunction === "Normal"}
                    label="Normal"
                  />
                  <CustomRadio
                    id="ge_lesion"
                    name="geJunction"
                    value="Lesion"
                    onChange={(e: any) => setGeJunction(e.target.value)}
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
                    onChange={(e:any) => setStomachFundus(e.target.value)}
                    checked={stomachFundus === "Normal"}
                    label="Normal"
                  />
                  <CustomRadio
                    id="s_fundus_desc_radio"
                    name="stomachFundus"
                    value="Description"
                    onChange={(e:any) => setStomachFundus(e.target.value)}
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
                    onChange={(e:any) => setStomachBody(e.target.value)}
                    checked={stomachBody === "Normal"}
                    label="Normal"
                  />
                  <CustomRadio
                    id="s_body_desc_radio"
                    name="stomachBody"
                    value="Description"
                    onChange={(e:any) => setStomachBody(e.target.value)}
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
                    onChange={(e:any) => setStomachAntrum(e.target.value)}
                    checked={stomachAntrum === "Normal"}
                    label="Normal"
                  />
                  <CustomRadio
                    id="s_antrum_desc_radio"
                    name="stomachAntrum"
                    value="Description"
                    onChange={(e:any) => setStomachAntrum(e.target.value)}
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
                  <Button label="+ Add Lesions" severity="info" className="py-2" onClick={handleAddLesion}  />
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
                              field="v"
                              options={["Regular", "Irregular", "Absent"]}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              S
                            </label>
                            <LesionRadioGroup
                              lesion={lesion}
                              field="s"
                              options={["Regular", "Irregular", "Absent"]}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              D
                            </label>
                            <LesionRadioGroup
                              lesion={lesion}
                              field="d"
                              options={["Present", "Absent"]}
                            />
                          </div>
                        </div>
                      </fieldset>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Button
                label="Save"
                severity="success"
                className="px-10 py-2"
                onClick={handleSave}
              />
            </div>
            <div className="mt-10 flex justify-end gap-2 ">
              <Link to="/endo1">
                <Button label="PREV" className="px-5 py-2 rounded" />
              </Link>
              {endoId && (
                <Link
                  to={`/endo3?id=${id}&endoId=${endoId}&edit=${
                    editFlag ? "yes" : "no"
                  }`}
                >
                  <Button label="NEXT" className="px-5 py-2 rounded" />
                </Link>
              )}
            </div>
          </main>
        </IonContent>
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
