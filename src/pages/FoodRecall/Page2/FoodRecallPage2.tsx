import React, { useEffect, useState, useMemo } from "react";
import { useLocation, Link, useHistory } from "react-router-dom";
import { useSQLite } from "../../../utils/Sqlite";
import {
  IonContent,
  IonPage,
  IonAlert,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
} from "@ionic/react";
import Header from "../../../components/Header";
import {
  IFoodHabitMaster,
  IFoodHabitFat,
  generateDefaultHabitState,
  loadHabitData,
  saveHabitData,
  checkHabitEditEligibility,
} from "../data";
import shortUUID from "short-uuid";
import { Button } from "primereact/button";
import ShowRegisteredTab from "../../../components/ShowRegisteredTab";
import { useBlockNavigation } from "../../../utils/blockBackNavigation";
import FlowCrumbs from "../../../components/FlowCrumbs";

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

  // base steps (Food Recall appended dynamically if needed)
  const baseSteps = [
    { label: "Dietary Profile", path: "/food-recall/page2?step=0", order: 1 },
    { label: "Cooking Habits", path: "/food-recall/page2?step=1", order: 2 },
    { label: "Household Habits", path: "/food-recall/page2?step=2", order: 3 },
  ];

  // read URL step param and sync UI
  const qs = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const urlStepParam = qs.get("step");
  const initialStepIndex = urlStepParam ? Math.max(0, Math.min(3, parseInt(urlStepParam, 10) || 0)) : 0;
  const [currentStep, setCurrentStep] = useState<number>(initialStepIndex);

  // data
  const [master, setMaster] = useState<IFoodHabitMaster | null>(null);
  const [fats, setFats] = useState<IFoodHabitFat[]>([]);
  const [alert, setAlert] = useState({ show: false, header: "", message: "" });

  // IDs from URL (user_id for create)
  const searchParams = new URLSearchParams(location.search);
  const userId = searchParams.get("user_id") || "";
  const masterIdFromUrl = searchParams.get("master_id") || null;

  useBlockNavigation(isUnsaved, () => {
    setAlert({ show: true, header: "Unsaved Changes", message: "You have unsaved changes. Please save before leaving the page." });
  });

  // track whether recalls exist for current master (so we can append "Food Recall" step permanently)
  const [hasRecalls, setHasRecalls] = useState(false);

  const loadRecallsFlag = async (masterId: string) => {
    try {
      const res = await db!.query(`SELECT COUNT(1) AS cnt FROM FOOD_RECALL_ENTRY WHERE master_id = ?`, [masterId]);
      const cnt = res?.values?.[0]?.cnt ?? 0;
      setHasRecalls(Number(cnt) > 0);
    } catch (e) {
      setHasRecalls(false);
    }
  };

  const loadOrCreateData = async () => {
    setIsLoading(true);
    try {
      const existing = await loadHabitData(db!!, userId, masterIdFromUrl);
      if (existing) {
        setMaster(existing.master);
        setFats(existing.fats || []);
        if (existing.master?.id) await loadRecallsFlag(existing.master.id);
      } else if (userId) {
        const { master: m, fats: f } = generateDefaultHabitState(userId, tabId);
        setMaster(m);
        setFats(f);
        setHasRecalls(false);
      } else {
        setAlert({ show: true, header: "Error", message: "Could not load or create habit record. Please go back to Page 1 and select a patient." });
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
  }, [db, sqlite, userId, masterIdFromUrl, tabId]);

  // sync step when URL changes (fixes: clicking crumb changes URL but UI didn't update)
  useEffect(() => {
    const qs2 = new URLSearchParams(location.search);
    const s = qs2.get("step");
    const stepIdx = s ? Math.max(0, Math.min(3, parseInt(s, 10) || 0)) : 0;
    if (stepIdx !== currentStep) {
      setCurrentStep(stepIdx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // dynamic steps: append Food Recall step if hasRecalls or if master exists and we want to show it
  const steps = useMemo(() => {
    const arr = [...baseSteps];
    if (master && master.id && hasRecalls) {
      // always add a "Food Recall" last step (path goes to page3)
      arr.push({ label: "Food Recall", path: "/food-recall/page3", order: 4 });
    }
    return arr;
  }, [baseSteps, master, hasRecalls]);

  // choose idQueryParam dynamically: when master exists use master_id; else use user_id (create mode)
  const idQueryParam = master && master.id ? "master_id" : "user_id";

  // ---------- handlers / CRUD ----------
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
      master_id: master.id,
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

  // Save habit data
  const handleSave = async (): Promise<boolean> => {
    if (!db || !sqlite || !master || !isEditable) {
      setAlert({ show: true, header: "Cannot Save", message: "The database is not ready, data is missing, or you do not have permission to edit." });
      return false;
    }

    if (db && !(await checkHabitEditEligibility(db, masterIdFromUrl || "", tabId))) {
      setAlert({ show: true, header: "Restricted access", message: "This record was registered with a different tab id." });
      return false;
    }

    setSaveInProgress(true);
    try {
      await saveHabitData(db, sqlite, master, fats, tabId);
      setIsUnsaved(false);

      // after save, update master from DB (to ensure id exists) and check recalls
      const reload = await loadHabitData(db!!, userId, master.id);
      if (reload) {
        setMaster(reload.master);
        setFats(reload.fats || []);
        if (reload.master.id) await loadRecallsFlag(reload.master.id);
      }

      setAlert({ show: true, header: "Saved", message: "Food Habit data saved." });
      setSaveInProgress(false);
      return true;
    } catch (e: any) {
      setSaveInProgress(false);
      setAlert({ show: true, header: "Save Error", message: `Failed to save data: ${e.message}` });
      return false;
    }
  };

  // Next/Previous behavior: update URL & UI in sync
  const goToStep = (index: number) => {
    // clamp index
    const idx = Math.max(0, Math.min(index, steps.length - 1));
    setCurrentStep(idx);
    // update URL's step param while preserving existing query (user_id/master_id)
    const p = new URLSearchParams(location.search);
    p.set("step", String(idx));
    // ensure we keep either user_id or master_id in query
    if (master && master.id) p.set("master_id", master.id);
    else if (userId) p.set("user_id", userId);
    history.replace({ pathname: location.pathname, search: p.toString() });
  };

  const handleNextClick = async () => {
    if (isUnsaved) {
      const ok = await handleSave();
      if (!ok) return;
    }

    // if next exists and it is a local step (page2), navigate UI only
    if (currentStep < steps.length - 1) {
      goToStep(currentStep + 1);
      return;
    }

    // final step -> if last step is Food Recall (path page3), validate minimal completeness and redirect
    const dietaryOk = !!master?.diet_type;
    const cookingOk = !!master && (fats.length > 0 || Object.values(master).some(v => typeof v === "string" && String(v).length > 0));
    const householdOk = !!master?.meals_per_day || !!master?.family_sharing;
    if (!(dietaryOk && cookingOk && householdOk)) {
      setAlert({ show: true, header: "Incomplete", message: "Please complete all sections before proceeding to Food Recall." });
      return;
    }

    const ok = await handleSave();
    if (!ok) return;

    // redirect to Page3 for recalls
    history.push(`/food-recall/page3?master_id=${master!.id}&user_id=${master!.user_id}`);
  };

  const handlePrevClick = async () => {
    if (isUnsaved) {
      const ok = await handleSave();
      if (!ok) return;
    }
    if (currentStep > 0) goToStep(currentStep - 1);
  };

  // refresh
  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadOrCreateData();
    setIsUnsaved(false);
    event.detail.complete();
  };

  // Loading UI
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

  const additives = JSON.parse(master.additives_json || "[]") as string[];
  const waterSupply = JSON.parse(master.water_supply_json || "[]") as string[];

  return (
    <IonPage>
      <Header title="Food Habit Survey (Module 1)" />
      <IonContent className="ion-padding" fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent refreshingSpinner="circles" />
        </IonRefresher>

        <div className="max-w-5xl mx-auto p-2">
          {/* FlowCrumbs with dynamic idQueryParam */}
          <FlowCrumbs steps={steps} currentPageLabel={steps[currentStep]?.label || "Dietary Profile"} idQueryParam={idQueryParam} />

          <div className="flex items-center gap-4 mt-2 text-sm">
            {saveInProgress ? <div className="text-xs text-gray-500">Saving...</div> : isUnsaved ? <div className="text-xs text-orange-500">Unsaved changes</div> : <div className="text-xs text-green-600">All changes saved</div>}
            <div className="ml-auto text-xs">Step {currentStep + 1} of {steps.length}</div>
          </div>

          <ShowRegisteredTab id={master.id} table_name="FOOD_HABITS_MASTER" />

          <main className="space-y-6">
            {/* Step 0: Dietary */}
            {currentStep === 0 && (
              <div className="bg-white p-6 rounded-lg shadow border">
                <h2 className="text-xl font-semibold">1. Dietary Profile</h2>
                <fieldset className="border p-3 rounded mt-3" disabled={!isEditable}>
                  <legend className="px-1 text-sm text-gray-600">7.1 Are you Vegetarian or Non-Veg?</legend>
                  <div className="flex gap-4 mt-2">
                    <CustomRadio id="d_veg" name="dietType" value="V" onChange={(e: any) => handleMasterChange("diet_type", e.target.value)} checked={master.diet_type === "V"} label="Vegetarian" />
                    <CustomRadio id="d_nonveg" name="dietType" value="N" onChange={(e: any) => handleMasterChange("diet_type", e.target.value)} checked={master.diet_type === "N"} label="Non-Veg" />
                    <CustomRadio id="d_other" name="dietType" value="O" onChange={(e: any) => handleMasterChange("diet_type", e.target.value)} checked={master.diet_type === "O"} label="Other/Mixed" />
                  </div>
                </fieldset>

                <div className="mt-4">
                  <label className="block text-sm font-medium">7.2 How long have you been following this diet? (Years/Months)</label>
                  <input type="text" value={master.diet_duration} onChange={(e) => handleMasterChange("diet_duration", e.target.value)} className="w-full p-2 border rounded mt-1 disabled:bg-gray-100" disabled={!isEditable} placeholder="e.g., 5 years" />
                </div>
              </div>
            )}

            {/* Step 1: Cooking */}
            {currentStep === 1 && (
              <div className="bg-white p-6 rounded-lg shadow border">
                <h2 className="text-xl font-semibold">2. Cooking Habits</h2>
                <fieldset className="border p-3 rounded mt-3" disabled={!isEditable}>
                  <legend className="px-1 text-sm text-gray-600">7.4 Do you add following to cooked food? (Multiple Select)</legend>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {["Salt", "Sugar", "Jaggery", "Ghee", "Pickled Vegetables", "Mustard Oil", "Khar/Tapigo", "None"].map(item => {
                      const checked = additives.includes(item);
                      return (
                        <label key={item} className="inline-flex items-center gap-2">
                          <input type="checkbox" checked={checked} disabled={!isEditable} onChange={(e) => {
                            const newAdd = e.target.checked ? [...additives, item] : additives.filter(a => a !== item);
                            handleMasterChange("additives_json", JSON.stringify(newAdd));
                          }} />
                          <span className="text-sm">{item}</span>
                        </label>
                      );
                    })}
                  </div>

                </fieldset>

                <div className="mt-4 border p-3 rounded">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-md font-semibold">7.5 Fats Used</h3>
                    <Button label="+ Add Fat/Oil" size="small" onClick={handleAddFat} disabled={!isEditable} />
                  </div>

                  <div className="space-y-3">
                    {fats.map((fat, idx) => (
                      <div className="border p-3 rounded" key={fat.id}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-medium">Fat/Oil {idx + 1}</div>
                          <button onClick={() => handleRemoveFat(fat.id)} className="text-red-500" disabled={!isEditable}>&times;</button>
                        </div>
                        <input value={fat.name} onChange={(e) => handleFatChange(fat.id, "name", e.target.value)} placeholder="Type of Fat/Oil" className="w-full p-2 border rounded mb-2" disabled={!isEditable} />
                        <div className="grid grid-cols-3 gap-3">
                          <select value={fat.usage} onChange={(e) => handleFatChange(fat.id, "usage", e.target.value)} disabled={!isEditable} className="p-2 border rounded">
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                            <option value="dont know">Don't Know</option>
                            <option value="refused">Refused</option>
                          </select>
                          <input value={fat.family_consumption} onChange={(e) => handleFatChange(fat.id, "family_consumption", e.target.value)} placeholder="Consumption (Lt/Kg/M)" className="p-2 border rounded" disabled={!isEditable} />
                          <input value={fat.years_used} onChange={(e) => handleFatChange(fat.id, "years_used", e.target.value)} placeholder="Years Used" className="p-2 border rounded" disabled={!isEditable} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 border p-3 rounded">
                  <h3 className="font-semibold mb-2">7.6 Preparation Method Frequency</h3>
                  <div className="grid grid-cols-4 gap-2 text-xs font-bold border-b pb-2 mb-2">
                    <div>Method</div>
                    <div className="text-center">Never (0)</div>
                    <div className="text-center">Rarely (1)</div>
                    <div className="text-center">Most Time (2)</div>
                  </div>
                  {PREP_METHODS.map((method) => {
                    const key = ("method_" + method.split(" ")[0].replace("/", "").toLowerCase()) as PrepMethodKey;
                    return (
                      <div key={method} className="grid grid-cols-4 items-center py-2 border-b last:border-b-0">
                        <div>{method}</div>
                        {["0", "1", "2"].map((val) => (
                          <div key={val} className="flex justify-center">
                            <input type="radio" name={`prep-${method}`} value={val} checked={(master as any)[key] === val} disabled={!isEditable} onChange={(e) => handleMasterChange(key, e.target.value as PrepFrequencyValue)} />
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Household */}
            {currentStep === 2 && (
              <div className="bg-white p-6 rounded-lg shadow border">
                <h2 className="text-xl font-semibold">3. Household Habits</h2>

                <div className="mt-4">
                  <label className="block text-sm font-medium">7.7 How many family members usually share each meal?</label>
                  <input type="number" value={master.family_sharing as any} onChange={(e) => handleMasterChange("family_sharing", e.target.value)} className="w-full p-2 border rounded mt-1" disabled={!isEditable} />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium">7.8 How many times do you eat daily?</label>
                  <input type="number" value={master.meals_per_day as any} onChange={(e) => handleMasterChange("meals_per_day", e.target.value)} className="w-full p-2 border rounded mt-1" disabled={!isEditable} />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium">7.9 Water supply (Multiple Select)</label>
                  <select multiple value={JSON.parse(master.water_supply_json || "[]")} onChange={(e: any) => {
                    const opts = Array.from(e.target.selectedOptions).map((o: any) => o.value);
                    handleMasterChange("water_supply_json", JSON.stringify(opts));
                  }} className="w-full p-2 border rounded mt-1" disabled={!isEditable}>
                    {["River", "Govt Municipal", "Tube", "Water Well", "Pond", "Other"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Step navigation */}
            <div className="flex justify-between items-center mt-6">
              <Link to="/food-recall/page1" onClick={(e) => {
                if (isUnsaved) {
                  setAlert({ show: true, header: "Unsaved Changes", message: "Please save before leaving." });
                  e.preventDefault();
                }
              }}>
                <Button label="Back to Patient List" icon="pi pi-arrow-left" outlined />
              </Link>

              <div className="flex gap-3 items-center">
                {currentStep > 0 && <Button label="Previous" onClick={handlePrevClick} outlined />}
                <Button label={currentStep < steps.length - 1 ? "Next Section" : "Next (to Recall)"} onClick={handleNextClick} severity="success" />
              </div>
            </div>

            <div style={{ paddingBottom: 160 }} />
          </main>
        </div>

        <IonAlert isOpen={alert.show} onDidDismiss={() => setAlert({ show: false, header: "", message: "" })} header={alert.header} message={alert.message} buttons={["OK"]} />
      </IonContent>
    </IonPage>
  );
}
