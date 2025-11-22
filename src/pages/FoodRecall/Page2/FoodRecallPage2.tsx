import React, { useEffect, useState } from "react";
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

  // Stepper state
  const steps = [
    { label: "Dietary Profile", key: "dietary" },
    { label: "Cooking Habits", key: "cooking" },
    { label: "Household Habits", key: "household" },
  ];
  const searchParams = new URLSearchParams(location.search);
  const initialStepParam = searchParams.get("step");
  const initialStepIndex = initialStepParam ? Math.max(0, Math.min(2, parseInt(initialStepParam, 10) || 0)) : 0;
  const [currentStep, setCurrentStep] = useState<number>(initialStepIndex);

  // Data state
  const [master, setMaster] = useState<IFoodHabitMaster | null>(null);
  const [fats, setFats] = useState<IFoodHabitFat[]>([]);
  const [alert, setAlert] = useState({ show: false, header: "", message: "" });
  const [allowNext, setAllowNext] = useState(false);

  // IDs
  const userId = searchParams.get("user_id") || "";
  const masterId = searchParams.get("master_id") || null;

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

  // Helpers
  const handleMasterChange = (field: keyof IFoodHabitMaster, value: any) => {
    if (!master) return;
    setIsUnsaved(true);
    setMaster(prev => ({ ...prev!, [field]: value }));
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
    setFats(prev => [...prev, newFat]);
  };

  const handleFatChange = (id: string, field: keyof IFoodHabitFat, value: any) => {
    setIsUnsaved(true);
    setFats(prev => prev.map(f => (f.id === id ? { ...f, [field]: value } : f)));
  };

  const handleRemoveFat = (id: string) => {
    setIsUnsaved(true);
    setFats(prev => prev.filter(f => f.id !== id));
  };

  // Save: reuse your existing logic (but expose to stepper)
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
      setAlert({ show: true, header: "Saved", message: "Food Habit data saved." });
      setSaveInProgress(false);
      return true;
    } catch (e: any) {
      setSaveInProgress(false);
      setAlert({ show: true, header: "Save Error", message: `Failed to save data: ${e.message}` });
      return false;
    }
  };

  // Step change handler: auto-save before switching if there are unsaved changes
  const handleStepChange = async (e: any) => {
    const newIndex = e.index;
    if (newIndex === currentStep) return;
    if (isUnsaved) {
      const ok = await handleSave();
      if (!ok) {
        // abort step change
        return;
      }
    }
    setCurrentStep(newIndex);
    // update URL param so other pages can link back to this step
    const params = new URLSearchParams(location.search);
    params.set("step", String(newIndex));
    history.replace({ pathname: location.pathname, search: params.toString() });
  };

  // when clicking next button in UI
  // 🔄 REPLACE your entire existing handleNextClick() with THIS
const handleNextClick = async () => {
  console.log("handleNextClick fired", {
    currentStep,
    isUnsaved,
    allowNext,
  });

  // 1️⃣ If there are unsaved edits → save first
  if (isUnsaved) {
    const ok = await handleSave();
    if (!ok) return; // stop if save failed
  }

  // 2️⃣ If NOT on last step → move to next step
  if (currentStep < steps.length - 1) {
    const next = currentStep + 1;
    setCurrentStep(next);

    const params = new URLSearchParams(location.search);
    params.set("step", String(next));

    history.replace({
      pathname: location.pathname,
      search: params.toString(),
    });

    return;
  }

  // 3️⃣ If on LAST step → verify completion from scratch (no stale allowNext)
  const dietaryOk = isDietaryComplete(master);
  const cookingOk = isCookingComplete(master, fats);
  const householdOk = isHouseholdComplete(master);

  const completed = dietaryOk && cookingOk && householdOk;

  console.log("Final completion status:", {
    dietaryOk,
    cookingOk,
    householdOk,
    completed,
  });

  if (!completed) {
    setAlert({
      show: true,
      header: "Incomplete",
      message: "Please complete all sections before proceeding to Food Recall.",
    });
    return;
  }

  // 4️⃣ Ensure final save before redirect
  const okFinal = await handleSave();
  if (!okFinal) return;

  // 5️⃣ Redirect to PAGE 3 (Food Recall)
  console.log("Redirecting to recall page…");
  history.push(
    `/food-recall/page3?master_id=${master!.id}&user_id=${master!.user_id}`
  );
};


  // refresh
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
          <div className="p-4">
            Could not load or create habit record. Please go back to Page 1 and select a patient.
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Parsed multi-select fields
  const additives = JSON.parse(master.additives_json || "[]") as string[];
  const waterSupply = JSON.parse(master.water_supply_json || "[]") as string[];

  // ---------- Render per-step panels ----------
  const DietaryPanel = () => (
    <div className="bg-white p-6 rounded-lg shadow border">
      <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">1. Dietary Profile</h2>
      <fieldset className="border border-gray-200 p-4 rounded-md mb-4" disabled={!isEditable}>
        <legend className="text-sm font-semibold text-gray-600 px-2">7.1 Are you Vegetarian or Non-Veg?</legend>
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
  );

  const CookingPanel = () => (
    <div className="bg-white p-6 rounded-lg shadow border">
      <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">2. Cooking Habits</h2>
      <fieldset className="border border-gray-200 p-4 rounded-md mb-4" disabled={!isEditable}>
        <legend className="text-sm font-semibold text-gray-600 px-2">7.4 Do you add following to cooked food? (Multiple Select)</legend>
        <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
          {["Salt", "Sugar", "Jaggery", "Ghee", "Pickled Vegetables", "Mustard Oil", "Khar/Tapigo", "None"].map(item => (
            <div key={item} className="flex items-center">
              <input type="checkbox" id={`add-${item}`} checked={additives.includes(item)} disabled={!isEditable}
                onChange={(e) => {
                  const newAdditives = e.target.checked ? [...additives, item] : additives.filter(a => a !== item);
                  handleMasterChange('additives_json', JSON.stringify(newAdditives));
                }}
                className="w-4 h-4 text-cyan-600 border-gray-300 focus:ring-cyan-500" />
              <label htmlFor={`add-${item}`} className="ml-2 text-sm font-medium text-gray-700">{item}</label>
            </div>
          ))}
        </div>
      </fieldset>

      {/* 7.5 Fats */}
      <div className="mt-6 border border-gray-200 p-4 rounded-md">
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

      {/* 7.6 Preparation Methods */}
      <div className="mt-6 border border-gray-200 p-4 rounded-md">
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
  );

  const HouseholdPanel = () => (
    <div className="bg-white p-6 rounded-lg shadow border">
      <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">3. Household Habits</h2>
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
  );

  return (
    <IonPage>
      <Header title="Food Habit Survey (Module 1)" />
      <IonContent className="ion-padding" fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent className="spinner-only" refreshingSpinner="circles" />
        </IonRefresher>

        <div className="max-w-5xl mx-auto p-2">
          <div className="mb-4">
            <Steps model={steps} activeIndex={currentStep} onSelect={handleStepChange} readOnly={false} />
            <div className="flex items-center gap-4 mt-2 text-sm">
              {saveInProgress ? <div className="text-xs text-gray-500">Saving...</div> : isUnsaved ? <div className="text-xs text-orange-500">Unsaved changes</div> : <div className="text-xs text-green-600">All changes saved</div>}
              <div className="ml-auto text-xs">Step {currentStep + 1} of {steps.length}</div>
            </div>
          </div>

          <ShowRegisteredTab id={master.id} table_name="FOOD_HABITS_MASTER" />

          <main className="space-y-6">
            {currentStep === 0 && <DietaryPanel />}
            {currentStep === 1 && <CookingPanel />}
            {currentStep === 2 && <HouseholdPanel />}

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
                {currentStep > 0 && <Button label="Previous" onClick={async () => {
                  if (isUnsaved) {
                    const ok = await handleSave();
                    if (!ok) return;
                  }
                  setCurrentStep(currentStep - 1);
                }} outlined />}

                <Button label={currentStep < steps.length - 1 ? "Next Section" : "Next (to Recall)"} onClick={handleNextClick} severity="secondary" />
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
