import React, { useState, useEffect } from "react";
import { useLocation, Link, useHistory } from "react-router-dom";
import { useSQLite } from "../../../utils/Sqlite";
import {
  IonContent,
  IonPage,
  IonAlert,
  IonSelect,
  IonSelectOption,
  RefresherEventDetail,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react";
import Header from "../../../components/Header";
import {
  IFoodHabitMaster,
  IFoodHabitFat,
  generateDefaultHabitState,
  loadHabitData,
  saveHabitData,
  checkHabitEditEligibility,
} from "../data"; // Corrected path (up one level)
import shortUUID from "short-uuid";
import { Button } from "primereact/button"; // Using PrimeReact components
import ShowRegisteredTab from "../../../components/ShowRegisteredTab";

// --- Re-usable UI Components (from original file) ---
const CustomRadio = ({
  id,
  name,
  value,
  checked,
  onChange,
  label,
  disabled = false,
}: {
  id: string;
  name: string;
  value: any;
  checked: boolean;
  onChange: any;
  label: string;
  disabled?: boolean;
}) => (
  <div className="flex items-center">
    <input
      id={id}
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="w-4 h-4 text-cyan-600 border-gray-300 focus:ring-cyan-500"
    />
    <label
      htmlFor={id}
      className={`ml-2 text-sm font-medium ${
        disabled ? "text-gray-400" : "text-gray-700 cursor-pointer"
      }`}
    >
      {label}
    </label>
  </div>
);
const PREP_METHODS = [
  "Shallow Frying",
  "Deep Frying",
  "Boiling",
  "Steaming",
  "Sauting",
  "Grill/Barbeque",
] as const;
type PrepMethodKey =
  | "method_shallow_frying"
  | "method_deep_frying"
  | "method_boiling"
  | "method_steaming"
  | "method_sauting"
  | "method_grill_bbq";
type PrepFrequencyValue = "0" | "1" | "2";
// --- End Re-usable Components ---

export default function FoodHabitPage() {
  const { db, sqlite, tabId } = useSQLite();
  const location = useLocation();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditable, setIsEditable] = useState(true);

  // State
  const [master, setMaster] = useState<IFoodHabitMaster | null>(null);
  const [fats, setFats] = useState<IFoodHabitFat[]>([]);
  const [alert, setAlert] = useState({ show: false, header: "", message: "" });

  // Get IDs from URL
  const searchParams = new URLSearchParams(location.search);
  const userId = searchParams.get("user_id") || "";
  const masterId = searchParams.get("master_id") || null; // This determines create vs. edit mode

  const loadOrCreateData = async () => {
    setIsLoading(true);
    try {
      // Try to load existing data
      const existingData = await loadHabitData(db!!, userId, masterId);
      console.log(existingData);
      if (existingData) {
        // LOAD/EDIT MODE
        setMaster(existingData.master);
        setFats(existingData.fats);
      } else if (userId) {
        // CREATE MODE
        const { master: newMaster, fats: newFats } = generateDefaultHabitState(
          userId,
          tabId
        );
        setMaster(newMaster);
        setFats(newFats);
        setIsEditable(true);
      } else {
        // Error: No IDs provided
        setAlert({
          show: true,
          header: "Error",
          message: "No patient ID was provided.",
        });
        setIsEditable(false);
      }
    } catch (e: any) {
      setAlert({
        show: true,
        header: "Load Error",
        message: `Failed to load data: ${e.message}`,
      });
      setIsEditable(false);
    }
    setIsLoading(false);
  };
  useEffect(() => {
    if (!db || !sqlite || !tabId) return;

    loadOrCreateData();
  }, [db, sqlite, userId, masterId, tabId]);

  // --- State Handlers ---
  const handleMasterChange = (field: keyof IFoodHabitMaster, value: any) => {
    if (!master) return;
    setMaster((prev: any) => ({ ...prev!, [field]: value }));
  };

  const handleAddFat = () => {
    const newFat: IFoodHabitFat = {
      id: shortUUID.generate(),
      master_id: master!.id,
      name: "",
      usage: "yes",
      family_consumption: "",
      years_used: "",
    };
    setFats([...fats, newFat]);
  };

  const handleFatChange = (
    id: string,
    field: keyof IFoodHabitFat,
    value: any
  ) => {
    setFats(fats.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
  };

  const handleRemoveFat = (id: string) => {
    setFats(fats.filter((f) => f.id !== id));
  };

  const handleSave = async () => {
    if (!db || !sqlite || !master || !isEditable) {
      setAlert({
        show: true,
        header: "Cannot Save",
        message:
          "The database is not ready, data is missing, or you do not have permission to edit.",
      });
      return;
    }

    setIsLoading(true);
    if (db && !(await checkHabitEditEligibility(db, masterId || "", tabId))) {
      return setAlert({
        header: "Restricted access",
        message: "This record was registered with a different tab id.",
        show: true,
      });
    }
    try {
      await saveHabitData(db, sqlite, master, fats, tabId);
      setIsLoading(false);
      setAlert({
        show: true,
        header: "Success",
        message: "Food Habit data has been saved.",
      });
      // Navigate to the recall entry page, passing the master ID
    } catch (e: any) {
      setIsLoading(false);
      setAlert({
        show: true,
        header: "Save Error",
        message: `Failed to save data: ${e.message}`,
      });
    }
  };

  if (isLoading) {
    return (
      <IonPage>
        <Header title="Loading..." />
        <IonContent>
          <div className="p-4">Loading data...</div>
        </IonContent>
      </IonPage>
    );
  }

  if (!master) {
    return (
      <IonPage>
        <Header title="Error" />
        <IonContent>
          <div className="p-4">
            Could not load or create habit record. Please go back to Page 1 and
            select a patient.
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // --- Parse JSON fields for UI ---
  const additives = JSON.parse(master.additives_json || "[]") as string[];
  const waterSupply = JSON.parse(master.water_supply_json || "[]") as string[];

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadOrCreateData();
    event.detail.complete();
  };
  return (
    <IonPage>
      <Header title="Food Habit Survey (Module 1)" />
      <IonContent className="ion-padding" fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            className="spinner-only"
            refreshingSpinner="circles"
          />
        </IonRefresher>
        <ShowRegisteredTab id={master.id} table_name="FOOD_HABITS_MASTER" />
        <main className="space-y-10 p-2">
          {/* --- Section 1: Dietary Profile (7.1 & 7.2) --- */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
              1. Dietary Profile
            </h2>
            <fieldset
              className="border border-gray-200 p-4 rounded-md mb-4"
              disabled={!isEditable}
            >
              <legend className="text-sm font-semibold text-gray-600 px-2">
                7.1 Are you Vegetarian or Non-Veg?
              </legend>
              <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
                <CustomRadio
                  id="d_veg"
                  name="dietType"
                  value="V"
                  onChange={(e: any) =>
                    handleMasterChange("diet_type", e.target.value)
                  }
                  checked={master.diet_type === "V"}
                  label="Vegetarian (1)"
                  disabled={!isEditable}
                />
                <CustomRadio
                  id="d_nonveg"
                  name="dietType"
                  value="N"
                  onChange={(e: any) =>
                    handleMasterChange("diet_type", e.target.value)
                  }
                  checked={master.diet_type === "N"}
                  label="Non-Veg (2)"
                  disabled={!isEditable}
                />
                <CustomRadio
                  id="d_other"
                  name="dietType"
                  value="O"
                  onChange={(e: any) =>
                    handleMasterChange("diet_type", e.target.value)
                  }
                  checked={master.diet_type === "O"}
                  label="Other/Mixed (0)"
                  disabled={!isEditable}
                />
              </div>
            </fieldset>
            <div className="mt-4">
              <label
                htmlFor="diet_duration"
                className="block text-gray-600 font-semibold mb-2 text-sm"
              >
                7.2 How long have you been following this diet? (Years/Months)
              </label>
              <input
                type="text"
                id="diet_duration"
                value={master.diet_duration}
                onChange={(e) =>
                  handleMasterChange("diet_duration", e.target.value)
                }
                placeholder="e.g., 5 years"
                disabled={!isEditable}
                className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* --- Section 3: Cooking Habits (7.4, 7.5, 7.6) --- */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
              2. Cooking Habits
            </h2>

            {/* 7.4 Additives */}
            <fieldset
              className="border border-gray-200 p-4 rounded-md mb-4"
              disabled={!isEditable}
            >
              <legend className="text-sm font-semibold text-gray-600 px-2">
                7.4 Do you add following to cooked food? (Multiple Select)
              </legend>
              <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
                {[
                  "Salt",
                  "Sugar",
                  "Jaggery",
                  "Ghee",
                  "Raw Chilli with Salt",
                  "None",
                ].map((item) => (
                  <div key={item} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`add-${item}`}
                      checked={additives.includes(item)}
                      disabled={!isEditable}
                      onChange={(e) => {
                        const newAdditives = e.target.checked
                          ? [...additives, item]
                          : additives.filter((a) => a !== item);
                        handleMasterChange(
                          "additives_json",
                          JSON.stringify(newAdditives)
                        );
                      }}
                      className="w-4 h-4 text-cyan-600 border-gray-300 focus:ring-cyan-500"
                    />
                    <label
                      htmlFor={`add-${item}`}
                      className="ml-2 text-sm font-medium text-gray-700"
                    >
                      {item}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>

            {/* 7.5 Fats Used */}
            <div className="mt-6 border border-gray-200 p-4 rounded-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-600">
                  7.5 Which of the following you cook your food with?
                  (Fats/Oils)
                </h3>
                <Button
                  label="+ Add Fat/Oil"
                  severity="info"
                  onClick={handleAddFat}
                  disabled={!isEditable}
                  className="py-2"
                />
              </div>
              <div className="space-y-4">
                {fats.map((fat, index) => (
                  <div
                    key={fat.id}
                    className="border border-dashed border-gray-300 rounded-md p-3 bg-white relative"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-md font-semibold text-gray-800">
                        Fat/Oil {index + 1}
                      </h4>
                      <button
                        onClick={() => handleRemoveFat(fat.id)}
                        disabled={!isEditable}
                        className="text-red-500 hover:text-red-700 font-bold text-xl px-2 py-0 disabled:text-gray-300"
                      >
                        &times;
                      </button>
                    </div>
                    <input
                      type="text"
                      value={fat.name}
                      onChange={(e) =>
                        handleFatChange(fat.id, "name", e.target.value)
                      }
                      placeholder="Type of Fat/Oil"
                      disabled={!isEditable}
                      className="w-full p-2 border rounded-md mb-3 disabled:bg-gray-100"
                    />
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Used?
                        </label>
                        <IonSelect
                          value={fat.usage}
                          onIonChange={(e) =>
                            handleFatChange(fat.id, "usage", e.detail.value)
                          }
                          interface="popover"
                          placeholder="Select"
                          disabled={!isEditable}
                        >
                          <IonSelectOption value="yes">Yes</IonSelectOption>
                          <IonSelectOption value="no">No</IonSelectOption>
                          <IonSelectOption value="dont know">
                            Don't Know
                          </IonSelectOption>
                          <IonSelectOption value="refused">
                            Refused
                          </IonSelectOption>
                        </IonSelect>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Consumption (Lt/Kg/M)
                        </label>
                        <input
                          type="text"
                          value={fat.family_consumption}
                          onChange={(e) =>
                            handleFatChange(
                              fat.id,
                              "family_consumption",
                              e.target.value
                            )
                          }
                          placeholder="e.g., 2 Liters/Month"
                          disabled={!isEditable}
                          className="w-full p-2 border rounded-md disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Years Used
                        </label>
                        <input
                          type="text"
                          value={fat.years_used}
                          onChange={(e) =>
                            handleFatChange(
                              fat.id,
                              "years_used",
                              e.target.value
                            )
                          }
                          placeholder="e.g., 10 years"
                          disabled={!isEditable}
                          className="w-full p-2 border rounded-md disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7.6 Preparation Method Frequency */}
            <div className="mt-6 border border-gray-200 p-4 rounded-md">
              <h3 className="text-sm font-semibold text-gray-600 mb-4">
                7.6 How often do you prepare food using these methods?
              </h3>
              <div className="grid grid-cols-4 text-xs font-bold text-gray-600 border-b pb-2 mb-2">
                <div className="col-span-1">Method</div>
                <div className="text-center">Never (0)</div>
                <div className="text-center">Rarely (1)</div>
                <div className="text-center">Most Time (2)</div>
              </div>
              {PREP_METHODS.map((method) => {
                const key = ("method_" +
                  method
                    .split(" ")[0]
                    .replace("/", "")
                    .toLowerCase()) as PrepMethodKey;
                return (
                  <div
                    key={method}
                    className="grid grid-cols-4 items-center py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="col-span-1 text-sm font-medium text-gray-800">
                      {method}
                    </div>
                    {["0", "1", "2"].map((frequency) => (
                      <div
                        key={`${method}-${frequency}`}
                        className="flex justify-center"
                      >
                        <input
                          type="radio"
                          id={`prep-${method}-${frequency}`}
                          name={`prepMethod-${method}`}
                          value={frequency}
                          checked={master[key] === frequency}
                          disabled={!isEditable}
                          onChange={(e) =>
                            handleMasterChange(
                              key,
                              e.target.value as PrepFrequencyValue
                            )
                          }
                          className="w-4 h-4 text-cyan-600 border-gray-300 focus:ring-cyan-500"
                        />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- Section 4: Household Habits (7.7, 7.8, 7.9) --- */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
              3. Household Habits
            </h2>
            <div className="mb-4">
              <label
                htmlFor="family_sharing"
                className="block text-gray-600 font-semibold mb-2 text-sm"
              >
                7.7 How many family members usually share each meal?
              </label>
              <input
                type="number"
                id="family_sharing"
                value={master.family_sharing}
                onChange={(e) =>
                  handleMasterChange("family_sharing", e.target.value)
                }
                placeholder="Enter number"
                disabled={!isEditable}
                className="w-full p-2 border rounded-md disabled:bg-gray-100"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="meals_per_day"
                className="block text-gray-600 font-semibold mb-2 text-sm"
              >
                7.8 How many times do you eat daily (including
                breakfast/snacks)?
              </label>
              <input
                type="number"
                id="meals_per_day"
                value={master.meals_per_day}
                onChange={(e) =>
                  handleMasterChange("meals_per_day", e.target.value)
                }
                placeholder="Enter number"
                disabled={!isEditable}
                className="w-full p-2 border rounded-md disabled:bg-gray-100"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="water_supply"
                className="block text-gray-600 font-semibold mb-2 text-sm"
              >
                7.9 Water supply (Multiple Select)
              </label>
              <IonSelect
                value={waterSupply}
                multiple={true}
                onIonChange={(e) =>
                  handleMasterChange(
                    "water_supply_json",
                    JSON.stringify(e.detail.value)
                  )
                }
                placeholder="Select all that apply"
                disabled={!isEditable}
                className="p-2 border rounded-md"
              >
                {[
                  "River",
                  "Govt Municipal",
                  "Tube",
                  "Water Well",
                  "Pond",
                  "Other",
                ].map((source) => (
                  <IonSelectOption key={source} value={source}>
                    {source}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>
          </div>
          <div>
            <Button
              label="Save"
              icon="pi pi-check"
              severity="success"
              className="px-10 py-2"
              onClick={handleSave}
              disabled={!isEditable || isLoading}
            />
          </div>
          {/* --- Save and Navigation Buttons --- */}
          <div className="mt-10 flex justify-between gap-2">
            <Link to={`/food1`}>
              <Button
                label="Back to Patient List"
                className="px-5 py-2 rounded"
                icon="pi pi-arrow-left"
                outlined
              />
            </Link>
            <Link
              to={`/food-recall/page3?master_id=${master.id}&user_id=${master.user_id}`}
            >
              <Button
                label="Next"
                className="px-5 py-2 rounded"
                icon="pi pi-arrow-right"
                iconPos="right"
                outlined
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
    </IonPage>
  );
}
