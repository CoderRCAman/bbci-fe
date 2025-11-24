import React, { useEffect, useRef, useState } from "react";
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
  isDietaryComplete,
  isCookingComplete,
  isHouseholdComplete,
} from "../data";
import shortUUID from "short-uuid";
import { Button } from "primereact/button";
import ShowRegisteredTab from "../../../components/ShowRegisteredTab";
import { useBlockNavigation } from "../../../utils/blockBackNavigation";
import { Steps } from "primereact/steps";

/**
 * FoodHabitPage (updated)
 * - Stepper shows sections as 7.1 / 7.2 / 7.3 / ... and final "7.n" which links to the Food Recall page.
 * - Clicking a step auto-saves (if unsaved), then scrolls to section on the same page.
 * - Final step navigates to Page 3 (Food Recall).
 * - Default radio values are not selected (generateDefaultHabitState sets diet_type = '')
 */

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
      className={`ml-2 text-sm font-medium ${disabled ? "text-gray-400" : "text-gray-700 cursor-pointer"}`}
    >
      {label}
    </label>
  </div>
);

export default function FoodHabitPage() {
  const { db, sqlite, tabId } = useSQLite();
  const location = useLocation();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditable, setIsEditable] = useState(true);
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [saveInProgress, setSaveInProgress] = useState(false);

  // STEP definitions (7.1 .. 7.n)
  // The last item (key: 'recall') is special and navigates to Page 3
  const steps = [
    { label: "7.1", key: "7.1", title: "Dietary Profile" },
    { label: "7.2", key: "7.2", title: "Diet Duration" },
    { label: "7.3", key: "7.3", title: "Cooking Habits" },
    { label: "7.4", key: "7.4", title: "Fats/Oils & Prep" },
    { label: "7.5", key: "7.5", title: "Preparation Frequency" },
    { label: "7.6", key: "7.6", title: "Household Habits" },
    { label: "7.n", key: "recall", title: "Food Recall (7.3)" }, // final navigates to recall page
  ];

  // Refs for sections — clicking step scrolls to these refs
  const ref71 = useRef<HTMLDivElement | null>(null);
  const ref72 = useRef<HTMLDivElement | null>(null);
  const ref73 = useRef<HTMLDivElement | null>(null);
  const ref74 = useRef<HTMLDivElement | null>(null);
  const ref75 = useRef<HTMLDivElement | null>(null);
  const ref76 = useRef<HTMLDivElement | null>(null);

  // Data state
  const searchParams = new URLSearchParams(location.search);
  const userId = searchParams.get("user_id") || "";
  const masterId = searchParams.get("master_id") || null;
  const [master, setMaster] = useState<IFoodHabitMaster | null>(null);
  const [fats, setFats] = useState<IFoodHabitFat[]>([]);
  const [alert, setAlert] = useState({ show: false, header: "", message: "" });
  const [allowNext, setAllowNext] = useState(false);

  // Load or create
  const loadOrCreateData = async () => {
    setIsLoading(true);
    try {
      const existingData = await loadHabitData(db!!, userId, masterId);
      if (existingData) {
        setMaster(existingData.master);
        setFats(existingData.fats);
        setAllowNext(
          isDietaryComplete(existingData.master) &&
            isCookingComplete(existingData.master, existingData.fats) &&
            isHouseholdComplete(existingData.master)
        );
      } else if (userId) {
        const { master: newMaster, fats: newFats } = generateDefaultHabitState(userId, tabId);
        setMaster(newMaster);
        setFats(newFats);
      } else {
        setAlert({ show: true, header: "Error", message: "No patient ID was provided." });
        setIsEditable(false);
      }
    } catch (e: any) {
      setAlert({ show: true, header: "Load Error", message: `Failed to load data: ${e.message}` });
      setIsEditable(false);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!db || !sqlite || !tabId) return;
    loadOrCreateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, sqlite, userId, masterId, tabId]);

  useBlockNavigation(isUnsaved, () => {
    setAlert({ show: true, header: "Unsaved Changes", message: "You have unsaved changes. Please save before leaving the page." });
  });

  // helpers unchanged
  const handleMasterChange = (field: keyof IFoodHabitMaster, value: any) => {
    if (!master) return;
    setIsUnsaved(true);
    setMaster((prev) => ({ ...prev!, [field]: value }));
  };

  const handleAddFat = () => {
    if (!master) return;
    setIsUnsaved(true);
    const newFat: IFoodHabitFat = {
      id: shortUUID.generate(),
      master_id: master!.id,
      name: "",
      usage: "yes",
      family_consumption: "",
      years_used: "",
    };
    setFats((prev) => [...prev, newFat]);
  };

  const handleFatChange = (id: string, field: keyof IFoodHabitFat, value: any) => {
    setIsUnsaved(true);
    setFats((prev) => prev.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
  };

  const handleRemoveFat = (id: string) => {
    setIsUnsaved(true);
    setFats((prev) => prev.filter((f) => f.id !== id));
  };

  // save
  const handleSave = async (): Promise<boolean> => {
    if (!db || !sqlite || !master || !isEditable) {
      setAlert({ show: true, header: "Cannot Save", message: "The database is not ready, data is missing, or you do not have permission to edit." });
      return false;
    }

    if (db && !(await checkHabitEditEligibility(db, masterId || "", tabId))) {
      setAlert({ show: true, header: "Restricted access", message: "This record was registered with a different tab id." });
      return false;
    }

    setSaveInProgress(true);
    try {
      await saveHabitData(db, sqlite, master, fats, tabId);
      setIsUnsaved(false);
      setAllowNext(
        isDietaryComplete(master) &&
          isCookingComplete(master, fats) &&
          isHouseholdComplete(master)
      );
      setSaveInProgress(false);
      return true;
    } catch (e: any) {
      setSaveInProgress(false);
      setAlert({ show: true, header: "Save Error", message: `Failed to save data: ${e.message}` });
      return false;
    }
  };

  // Step click -> save (if needed) then scroll to section or navigate to recall page
  const onStepClick = async (index: number) => {
    const step = steps[index];
    // If final step (recall) -> navigate to page 3 after ensuring saved
    if (step.key === "recall") {
      if (isUnsaved) {
        const ok = await handleSave();
        if (!ok) return;
      } else {
        // optional: final save to refresh updated_at
        await handleSave();
      }
      history.push(`/food-recall/page3?master_id=${master!.id}&user_id=${master!.user_id}`);
      return;
    }

    // If there are unsaved edits, save before jumping
    if (isUnsaved) {
      const ok = await handleSave();
      if (!ok) return; // abort if save failed
    }

    // Map step key to ref and scroll
    const mapKeyToRef: Record<string, React.RefObject<HTMLDivElement> | null> = {
      "7.1": ref71,
      "7.2": ref72,
      "7.3": ref73,
      "7.4": ref74,
      "7.5": ref75,
      "7.6": ref76,
    };

    const targetRef = mapKeyToRef[step.key];
    if (targetRef && targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // if not found, scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // refresh handler
  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadOrCreateData();
    setIsUnsaved(false);
    event.detail.complete();
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
          <div className="p-4">Could not load or create habit record. Please go back to Page 1 and select a patient.</div>
        </IonContent>
      </IonPage>
    );
  }

  // Parse multi-selects
  const additives = JSON.parse(master.additives_json || "[]") as string[];
  const waterSupply = JSON.parse(master.water_supply_json || "[]") as string[];

  return (
    <IonPage>
      <Header title="Food Habit Survey (Module 1)" />
      <IonContent className="ion-padding" fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent className="spinner-only" refreshingSpinner="circles" />
        </IonRefresher>

        <div className="max-w-5xl mx-auto p-2">
          {/* Stepper UI — clickable items */}
          <div className="mb-4 sticky top-14 bg-white/90 z-20 py-2 border-b border-gray-100">
            <div className="flex gap-3 items-center overflow-auto px-2">
              {steps.map((s, idx) => (
                <button
                  key={s.key}
                  onClick={() => onStepClick(idx)}
                  className="px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50 text-sm font-medium"
                  title={s.title}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <ShowRegisteredTab id={master.id} table_name="FOOD_HABITS_MASTER" />

          <main className="space-y-6">
            {/* 7.1 Dietary Profile */}
            <div ref={ref71} className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">7.1 Dietary Profile</h2>
              <fieldset className="border border-gray-200 p-4 rounded-md mb-4" disabled={!isEditable}>
                <legend className="text-sm font-semibold text-gray-600 px-2">Are you Vegetarian or Non-Veg?</legend>
                <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
                  <CustomRadio id="d_veg" name="dietType" value="V" onChange={(e: any) => handleMasterChange("diet_type", e.target.value)} checked={master.diet_type === "V"} label="Vegetarian (1)" disabled={!isEditable} />
                  <CustomRadio id="d_nonveg" name="dietType" value="N" onChange={(e: any) => handleMasterChange("diet_type", e.target.value)} checked={master.diet_type === "N"} label="Non-Veg (2)" disabled={!isEditable} />
                  <CustomRadio id="d_other" name="dietType" value="O" onChange={(e: any) => handleMasterChange("diet_type", e.target.value)} checked={master.diet_type === "O"} label="Other/Mixed (0)" disabled={!isEditable} />
                </div>
              </fieldset>
              <div className="mt-4">
                <label htmlFor="diet_duration" className="block text-gray-600 font-semibold mb-2 text-sm">7.2 How long have you been following this diet? (Years/Months)</label>
                <input type="text" id="diet_duration" value={master.diet_duration} onChange={(e) => handleMasterChange("diet_duration", e.target.value)} placeholder="e.g., 5 years" disabled={!isEditable} className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100" />
              </div>
            </div>

            {/* 7.3 Cooking Habits */}
            <div ref={ref73} className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">7.3 Cooking Habits</h2>
              <fieldset className="border border-gray-200 p-4 rounded-md mb-4" disabled={!isEditable}>
                <legend className="text-sm font-semibold text-gray-600 px-2">7.4 Do you add following to cooked food? (Multiple Select)</legend>
                <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
                  {["Salt", "Sugar", "Jaggery", "Ghee", "Pickled Vegetables", "Mustard Oil", "Khar/Tapigo", "None"].map(item => (
                    <div key={item} className="flex items-center">
                      <input type="checkbox" id={`add-${item}`} checked={additives.includes(item)} disabled={!isEditable} onChange={(e) => {
                        const newAdditives = e.target.checked ? [...additives, item] : additives.filter(a => a !== item);
                        handleMasterChange('additives_json', JSON.stringify(newAdditives));
                      }} className="w-4 h-4 text-cyan-600 border-gray-300 focus:ring-cyan-500" />
                      <label htmlFor={`add-${item}`} className="ml-2 text-sm font-medium text-gray-700">{item}</label>
                    </div>
                  ))}
                </div>
              </fieldset>

              {/* 7.4 Fats list (section ref 7.4 maps to ref74) */}
              <div ref={ref74} className="mt-6 border border-gray-200 p-4 rounded-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-gray-600">7.5 Which of the following you cook your food with? (Fats/Oils)</h3>
                  <Button label="+ Add Fat/Oil" severity="info" onClick={handleAddFat} disabled={!isEditable} className="py-2" />
                </div>
                <div className="space-y-4">
                  {fats.map((fat, index) => (
                    <div key={fat.id} className="border border-dashed border-gray-300 rounded-md p-3 bg-white relative">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-md font-semibold text-gray-800">Fat/Oil {index + 1}</h4>
                        <button onClick={() => handleRemoveFat(fat.id)} disabled={!isEditable} className="text-red-500 hover:text-red-700 font-bold text-xl px-2 py-0 disabled:text-gray-300">&times;</button>
                      </div>
                      <input type="text" value={fat.name} onChange={(e) => handleFatChange(fat.id, "name", e.target.value)} placeholder="Type of Fat/Oil" disabled={!isEditable} className="w-full p-2 border rounded-md mb-3 disabled:bg-gray-100" />
                      <div className="grid grid-cols-3 gap-3 items-center">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Used?</label>
                          <IonSelect value={fat.usage} onIonChange={(e) => handleFatChange(fat.id, "usage", e.detail.value)} interface="popover" placeholder="Select" disabled={!isEditable}>
                            <IonSelectOption value="yes">Yes</IonSelectOption>
                            <IonSelectOption value="no">No</IonSelectOption>
                            <IonSelectOption value="dont know">Don't Know</IonSelectOption>
                            <IonSelectOption value="refused">Refused</IonSelectOption>
                          </IonSelect>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Consumption (Lt/Kg/M)</label>
                          <input type="text" value={fat.family_consumption} onChange={(e) => handleFatChange(fat.id, "family_consumption", e.target.value)} placeholder="e.g., 2 Liters/Month" disabled={!isEditable} className="w-full p-2 border rounded-md disabled:bg-gray-100" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Years Used</label>
                          <input type="text" value={fat.years_used} onChange={(e) => handleFatChange(fat.id, "years_used", e.target.value)} placeholder="e.g., 10 years" disabled={!isEditable} className="w-full p-2 border rounded-md disabled:bg-gray-100" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7.5 Preparation Frequency */}
              <div ref={ref75} className="mt-6 border border-gray-200 p-4 rounded-md">
                <h3 className="text-sm font-semibold text-gray-600 mb-4">7.6 How often do you prepare food using these methods?</h3>
                <div className="grid grid-cols-4 text-xs font-bold text-gray-600 border-b pb-2 mb-2">
                  <div className="col-span-1">Method</div>
                  <div className="text-center">Never (0)</div>
                  <div className="text-center">Rarely (1)</div>
                  <div className="text-center">Most Time (2)</div>
                </div>
                {PREP_METHODS.map((method) => {
                  const key = ("method_" + method.split(" ")[0].replace("/", "").toLowerCase()) as PrepMethodKey;
                  return (
                    <div key={method} className="grid grid-cols-4 items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div className="col-span-1 text-sm font-medium text-gray-800">{method}</div>
                      {["0", "1", "2"].map((frequency) => (
                        <div key={`${method}-${frequency}`} className="flex justify-center">
                          <input type="radio" id={`prep-${method}-${frequency}`} name={`prepMethod-${method}`} value={frequency} checked={master[key] === frequency} disabled={!isEditable} onChange={(e) => handleMasterChange(key, e.target.value as PrepFrequencyValue)} className="w-4 h-4 text-cyan-600 border-gray-300 focus:ring-cyan-500" />
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 7.6 Household Habits */}
            <div ref={ref76} className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">7.6 Household Habits</h2>
              <div className="mb-4">
                <label htmlFor="family_sharing" className="block text-gray-600 font-semibold mb-2 text-sm">7.7 How many family members usually share each meal?</label>
                <input type="number" id="family_sharing" value={master.family_sharing as any} onChange={(e) => handleMasterChange("family_sharing", e.target.value)} placeholder="Enter number" disabled={!isEditable} className="w-full p-2 border rounded-md disabled:bg-gray-100" />
              </div>
              <div className="mb-4">
                <label htmlFor="meals_per_day" className="block text-gray-600 font-semibold mb-2 text-sm">7.8 How many times do you eat daily (including breakfast/snacks)?</label>
                <input type="number" id="meals_per_day" value={master.meals_per_day as any} onChange={(e) => handleMasterChange("meals_per_day", e.target.value)} placeholder="Enter number" disabled={!isEditable} className="w-full p-2 border rounded-md disabled:bg-gray-100" />
              </div>
              <div className="mb-4">
                <label htmlFor="water_supply" className="block text-gray-600 font-semibold mb-2 text-sm">7.9 Water supply (Multiple Select)</label>
                <IonSelect value={waterSupply} multiple={true} onIonChange={(e) => handleMasterChange("water_supply_json", JSON.stringify(e.detail.value))} placeholder="Select all that apply" disabled={!isEditable} className="p-2 border rounded-md">
                  {["River", "Govt Municipal", "Tube", "Water Well", "Pond", "Other"].map((source) => (
                    <IonSelectOption key={source} value={source}>{source}</IonSelectOption>
                  ))}
                </IonSelect>
              </div>
            </div>

            {/* Save & Navigation area */}
            <div className="flex justify-between items-center mt-6">
              <Link to={`/food1`} onClick={(e) => {
                if (isUnsaved) {
                  setAlert({ show: true, header: "Unsaved Changes", message: "You have unsaved changes. Please save before leaving the page." });
                  e.preventDefault();
                }
              }}>
                <Button label="Back to Patient List" className="px-5 py-2 rounded" icon="pi pi-arrow-left" outlined />
              </Link>

              <div className="flex gap-3 items-center">
                <Button label="Save" onClick={async () => { await handleSave(); }} severity="success" icon="pi pi-check" />
                <Button label="Next to Recall" onClick={async () => {
                  if (isUnsaved) {
                    const ok = await handleSave();
                    if (!ok) return;
                  }
                  // Recompute completeness live
                  const dietaryOk = isDietaryComplete(master);
                  const cookingOk = isCookingComplete(master, fats);
                  const householdOk = isHouseholdComplete(master);
                  if (!(dietaryOk && cookingOk && householdOk)) {
                    setAlert({ show: true, header: "Incomplete", message: "Please complete all sections before proceeding to Food Recall." });
                    return;
                  }
                  await handleSave();
                  history.push(`/food-recall/page3?master_id=${master.id}&user_id=${master.user_id}`);
                }} severity="secondary" />
              </div>
            </div>

            <div className="pb-[200px]" />
          </main>
        </div>

        <IonAlert isOpen={alert.show} onDidDismiss={() => setAlert((a) => ({ ...a, show: false }))} header={alert.header} message={alert.message} buttons={["OK"]} />
      </IonContent>
    </IonPage>
  );
}
