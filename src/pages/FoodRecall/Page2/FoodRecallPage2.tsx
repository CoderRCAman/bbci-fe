// /mnt/data/FoodRecallPage2.tsx
import React, { useEffect, useState } from "react";
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
  loadRecallData,
  saveHabitData,
  checkHabitEditEligibility,
} from "../data";
import shortUUID from "short-uuid";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
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
const PREP_KEYS: Record<string, keyof IFoodHabitMaster> = {
  "Shallow Frying": "method_shallow_frying",
  "Deep Frying": "method_deep_frying",
  "Boiling": "method_boiling",
  "Steaming": "method_steaming",
  "Sauting": "method_sauting",
  "Grill/Barbeque": "method_grill_bbq",
};

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

  const [master, setMaster] = useState<IFoodHabitMaster | null>(null);
  const [fats, setFats] = useState<IFoodHabitFat[]>([]);
  const [alert, setAlert] = useState({ show: false, header: "", message: "" });

  // UI-only states
  const [patientName, setPatientName] = useState<string>("");
  const [readOnlyNotice, setReadOnlyNotice] = useState<string>(""); // subtle inline read-only badge text

  // water supply tags local state + add input toggle
  const [waterSupplyTags, setWaterSupplyTags] = useState<string[]>([]);
  const [showAddWater, setShowAddWater] = useState(false);
  const [newWaterValue, setNewWaterValue] = useState("");

  // IDs from URL (user_id for create)
  const searchParams = new URLSearchParams(location.search);
  const userId = searchParams.get("user_id") || "";
  const masterIdFromUrl = searchParams.get("master_id") || null;

  useBlockNavigation(isUnsaved, () => {
    setAlert({ show: true, header: "Unsaved Changes", message: "You have unsaved changes. Please save before leaving the page." });
  });

  // two-step flow (Food Habits + 24-Hr Recall)
  const steps = [
    { label: "Food Habits", path: "/food-recall/page2", order: 1 },
    { label: "24-Hr Recall", path: "/food-recall/page3", order: 2 },
  ];
  const idQueryParam = master && master.id ? "master_id" : "user_id";

  // ---------- Helper: try finding existing master for user ----------
  const fetchExistingMasterByUser = async (dbConn: any, uId: string) => {
    if (!dbConn || !uId) return null;
    try {
      const existing = await loadHabitData(dbConn, uId, null);
      return existing || null;
    } catch (err) {
      console.warn("fetchExistingMasterByUser failed", err);
      return null;
    }
  };

  // ---------- Helper: fetch patient name (best-effort) ----------
  const fetchPatientName = async (dbConn: any, uId: string) => {
    if (!dbConn || !uId) return "";
    try {
      // try common fields; adapt if your patients table uses different column names
      let name = "";
      const tryQuery = async (q: string) => {
        try {
          const res = await dbConn.query(q, [uId]);
          if (res?.values && res.values[0]) {
            const val = res.values[0];
            // pick first string-like property
            for (const k of Object.keys(val)) {
              if (typeof val[k] === "string" && val[k].trim().length > 0) return val[k];
            }
          }
          return "";
        } catch {
          return "";
        }
      };

      name = await tryQuery(`SELECT name FROM patients WHERE id = ?`);
      if (!name) name = await tryQuery(`SELECT full_name FROM patients WHERE id = ?`);
      if (!name) name = await tryQuery(`SELECT patient_name FROM patients WHERE id = ?`);
      return name || "";
    } catch (err) {
      console.warn("fetchPatientName failed", err);
      return "";
    }
  };

  // ---------- Load or create with the new rules ----------
  const loadOrCreateData = async () => {
    setIsLoading(true);
    setReadOnlyNotice("");
    try {
      // Fetch patient name (best-effort) early so we can show under stepper
      if (db && userId) {
        const name = await fetchPatientName(db, userId);
        setPatientName(name);
      } else {
        setPatientName("");
      }

      // 1) If explicit master_id passed via URL, prefer that
      let existing: any = null;
      if (masterIdFromUrl) {
        existing = await loadHabitData(db!!, userId, masterIdFromUrl);
      }

      // 2) If no masterIdFromUrl or nothing found, try find by userId (reuse existing record)
      if (!existing && userId) {
        existing = await loadHabitData(db!!, userId, null); // assume loadHabitData can search by userId if masterId null
      }

      if (existing) {
        // Use canonical master (edit-only)
        setMaster(existing.master);
        setFats(existing.fats || []);

        try {
          const ws = JSON.parse(existing.master.water_supply_json || "[]");
          setWaterSupplyTags(Array.isArray(ws) ? ws : []);
        } catch {
          setWaterSupplyTags([]);
        }

        // Load recall presence (non-blocking)
        try {
          await loadRecallData(db!!, existing.master.id);
        } catch {
          // intentionally ignored
        }

        // Permission check: editing allowed only for the tab that created this record
        try {
          const allowed = await checkHabitEditEligibility(db!!, existing.master.id, tabId);
          setIsEditable(!!allowed);
          if (!allowed) {
            // don't show alert popup — show inline subtle badge instead
            setReadOnlyNotice(`Read-only (created by another tab)`);
          } else {
            setReadOnlyNotice("");
          }
        } catch (e: any) {
          setIsEditable(false);
          setReadOnlyNotice(`Read-only (permission check failed)`);
          console.warn("Eligibility check failed:", e);
        }
      } else if (userId) {
        // No existing master: create default master for this tab
        const { master: m, fats: f } = generateDefaultHabitState(userId, tabId);
        setMaster(m);
        setFats(f);
        try {
          const ws = JSON.parse(m.water_supply_json || "[]");
          setWaterSupplyTags(Array.isArray(ws) ? ws : []);
        } catch {
          setWaterSupplyTags([]);
        }
        // new record created by this tab => editable
        setIsEditable(true);
      } else {
        setAlert({ show: true, header: "Error", message: "Could not load or create habit record. Please go back to Page 1 and select a patient." });
        setIsEditable(false);
      }
    } catch (e: any) {
      setAlert({ show: true, header: "Load Error", message: `Failed to load data: ${e.message}` });
      setIsEditable(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!db || !sqlite || !tabId) return;
    loadOrCreateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, sqlite, userId, masterIdFromUrl, tabId]);

  // ---------- handlers ----------
  const handleMasterChange = (field: keyof IFoodHabitMaster, value: any) => {
    if (!master) return;
    setIsUnsaved(true);
    setMaster((prev) => ({ ...prev!, [field]: value }));
  };

  // fats (compact table)
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

  // water supply tag local state + selector for static options
  const WATER_OPTIONS = [
    "River",
    "Govt/Municipal",
    "Tube Well",
    "Water Well",
    "Pond",
    "Other (input)",
  ];

  // selected option from dropdown (one of WATER_OPTIONS)
  const [selectedWaterOption, setSelectedWaterOption] = useState<string>(WATER_OPTIONS[0]);
  // free-text value used only when selectedWaterOption === "Other (input)"
  const [otherWaterValue, setOtherWaterValue] = useState("");

  const addWaterTag = () => {
    let val = "";
    if (selectedWaterOption === "Other (input)") {
      val = otherWaterValue?.trim();
      if (!val) return; // nothing to add
      val = `Other: ${val}`; // store with prefix per your instruction
    } else {
      val = selectedWaterOption;
    }

    // prevent duplicates
    if (waterSupplyTags.includes(val)) {
      setOtherWaterValue("");
      setShowAddWater(false);
      return;
    }

    setWaterSupplyTags(prev => [...prev, val]);
    setOtherWaterValue("");
    setSelectedWaterOption(WATER_OPTIONS[0]);
    setShowAddWater(false);
    setIsUnsaved(true);
  };

  const removeWaterTag = (tag: string) => {
    setWaterSupplyTags(prev => prev.filter(t => t !== tag));
    setIsUnsaved(true);
  };

  // save flow - ensure waterSupply JSON and master values synced before save
  const handleSave = async (): Promise<boolean> => {
    if (!db || !sqlite || !master) {
      setAlert({ show: true, header: "Cannot Save", message: "The database is not ready or data is missing." });
      return false;
    }

    // If the record is read-only for this tab, prevent saving
    if (!isEditable) {
      setAlert({ show: true, header: "Read-only", message: "You do not have permission to edit this record." });
      return false;
    }

    // double-check eligibility on the current master id (defensive)
    const effectiveMasterId = masterIdFromUrl || master.id || "";
    try {
      const allowed = await checkHabitEditEligibility(db, effectiveMasterId, tabId);
      if (!allowed) {
        setAlert({ show: true, header: "Restricted access", message: "This record was registered with a different tab id." });
        setIsEditable(false);
        setReadOnlyNotice(`Read-only (created by another tab)`);
        return false;
      }
    } catch (e: any) {
      // if the check fails unexpectedly, block save (conservative)
      setAlert({ show: true, header: "Save Blocked", message: "Could not verify permissions to save this record." });
      console.warn("checkHabitEditEligibility error:", e);
      return false;
    }

    // Attach existing master id if a master for this user already exists (prevent duplicates)
    if (userId && (!master.id || master.id === "")) {
      try {
        const existing = await fetchExistingMasterByUser(db, userId);
        if (existing && existing.master && existing.master.id) {
          // attach canonical id: keep existing tab_id as-is (do not overwrite)
          const patched: IFoodHabitMaster = {
            ...master,
            id: existing.master.id,
            tab_id: existing.master.tab_id || master.tab_id,
          };
          setMaster(patched);
        }
      } catch (err) {
        // ignore; we will still attempt to save the current master (it may create a new one)
        console.warn("fetchExistingMasterByUser during save failed", err);
      }
    }

    // sync waterSupplyTags into master before save
    const updatedMaster = { ...master, water_supply_json: JSON.stringify(waterSupplyTags) } as IFoodHabitMaster;
    setMaster(updatedMaster);
    console.log(updatedMaster)
    setSaveInProgress(true);
    try {
      await saveHabitData(db, sqlite, updatedMaster, fats, tabId);
      setIsUnsaved(false);

      // reload to get canonical master id (if newly created)
      const reload = await loadHabitData(db!!, userId, updatedMaster.id);
      if (reload) {
        setMaster(reload.master);
        setFats(reload.fats || []);
        const ws = JSON.parse(reload.master.water_supply_json || "[]");
        setWaterSupplyTags(Array.isArray(ws) ? ws : []);
        // ensure editability recomputed after save (creator tab preserved)
        try {
          const allowedAfter = await checkHabitEditEligibility(db, reload.master.id, tabId);
          setIsEditable(!!allowedAfter);
          if (!allowedAfter) setReadOnlyNotice("Read-only (created by another tab)");
          else setReadOnlyNotice("");
        } catch {
          // keep previous isEditable/readOnlyNotice
        }
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

  const handleSaveAndGotoRecall = async () => {
    const ok = await handleSave();
    if (!ok) return;

    // After save, ensure we have canonical master id to navigate
    let mId = master?.id;
    if (!mId && userId && db) {
      const existing = await fetchExistingMasterByUser(db, userId);
      mId = existing?.master?.id || "";
    }

    const uId = master?.user_id || userId;
    if (!mId) {
      setAlert({ show: true, header: "Missing ID", message: "Could not determine master_id after save." });
      return;
    }
    history.push(`/food-recall/page3?master_id=${mId}&user_id=${uId}`);
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadOrCreateData();
    setIsUnsaved(false);
    event.detail.complete();
  };

  // ----------------- RENDER -----------------
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

  return (
    <IonPage>
      <Header title="Food Habit Survey (Module 1)" />
      <IonContent className="ion-padding" fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent refreshingSpinner="circles" />
        </IonRefresher>

        <div className="max-w-5xl mx-auto p-2">
          {/* Stepper + right-justified tab-id + read-only badge */}
          <div className="flex items-start gap-3 mb-2">
            <div className="flex-1">
              <FlowCrumbs steps={steps} currentPageLabel={steps[0].label} idQueryParam={idQueryParam} />
              {/* patient name shown under stepper */}
              {patientName ? (
                <div className="mt-2 text-sm font-medium text-gray-700">Participant: <span className="font-semibold">{patientName}</span></div>
              ) : (
                <div className="mt-2 text-sm text-gray-500">Participant: <span className="italic">Unknown</span></div>
              )}
            </div>

            <div className="flex flex-col items-end ml-4">
              <div className="text-xs text-gray-600">Recorded with tab id :</div>
              <div className="mt-1">
                <Tag value={master.tab_id || tabId || "—"} severity="info" rounded className="text-sm px-3 py-1" />
              </div>

              {readOnlyNotice ? (
                <div className="mt-2">
                  <Tag value={readOnlyNotice} severity="warning" rounded className="text-xs px-2 py-1" />
                </div>
              ) : null}
            </div>
          </div>

          {/* STATUS line removed 'Module: Food Habits' per request */}
          <div className="mb-2">
            {/* left intentionally minimal */}
          </div>

          {/* show registered tab component removed from top (we replaced with stepper tab text) */}
          {/* If you still want the old ShowRegisteredTab somewhere, you can re-enable it. */}

          <main className="bg-white p-4 rounded shadow space-y-4">
            {/* Dietary Profile */}
            <section>
              <h2 className="text-lg font-semibold">1. Dietary Profile</h2>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                <fieldset className="border p-3 rounded" disabled={!isEditable}>
                  <legend className="px-1 text-sm text-gray-600">Are you Vegetarian or Non-Veg?</legend>
                  <div className="flex gap-4 mt-2">
                    <CustomRadio id="d_veg" name="dietType" value="V" onChange={(e: any) => handleMasterChange("diet_type", e.target.value)} checked={master.diet_type === "V"} label="Vegetarian" />
                    <CustomRadio id="d_nonveg" name="dietType" value="N" onChange={(e: any) => handleMasterChange("diet_type", e.target.value)} checked={master.diet_type === "N"} label="Non-Veg" />
                    <CustomRadio id="d_other" name="dietType" value="O" onChange={(e: any) => handleMasterChange("diet_type", e.target.value)} checked={master.diet_type === "O"} label="Other/Mixed" />
                  </div>
                </fieldset>

                <div>
                  <label className="block text-sm font-medium">How long have you been following this diet? (Years)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="\d*"
                    value={master.diet_duration}
                    onChange={(e) => handleMasterChange("diet_duration", e.target.value)}
                    className="w-full p-2 border rounded mt-1 disabled:bg-gray-100"
                    disabled={!isEditable}
                    placeholder="e.g., 5"
                  />
                </div>
              </div>
            </section>

            <hr className="my-4 border-gray-200" />

            {/* Cooking Habits */}
            <section>
              <h2 className="text-lg font-semibold">2. Cooking Habits</h2>
              <div className="mt-3">
                <label className="block text-sm font-semibold">Do you add any of the following to cooked food?</label>
                <div className="flex flex-wrap gap-3 mt-2 text-sm">
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
              </div>

              <div className="mt-4 border p-3 rounded">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-md font-semibold">Fats / Oils Used</h3>
                  <div className="flex gap-2 items-center">
                    <Button label="+ Add" size="small" onClick={handleAddFat} disabled={!isEditable} />
                  </div>
                </div>

                {/* Compact table-like view for fats */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2 pr-3">Name</th>
                        <th className="py-2 pr-3">Usage</th>
                        <th className="py-2 pr-3">Monthly Consumption(Ltr/Kg)</th>
                        <th className="py-2 pr-3">Years</th>
                        <th className="py-2 pr-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fats.map((fat) => (
                        <tr key={fat.id} className="border-b last:border-b-0">
                          <td className="py-2 pr-3">
                            <input value={fat.name} onChange={(e) => handleFatChange(fat.id, "name", e.target.value)} placeholder="Fat/Oil" className="w-full p-1 border rounded text-sm" disabled={!isEditable} />
                          </td>
                          <td className="py-2 pr-3">
                            <select value={fat.usage} onChange={(e) => handleFatChange(fat.id, "usage", e.target.value)} disabled={!isEditable} className="p-1 border rounded text-sm">
                              <option value="yes">Yes</option>
                              <option value="no">No</option>
                              <option value="dont know">Don't Know</option>
                            </select>
                          </td>
                          <td className="py-2 pr-3">
                            <input value={fat.family_consumption} onChange={(e) => handleFatChange(fat.id, "family_consumption", e.target.value)} placeholder="Qty" inputMode="numeric" pattern="\d*" className="p-1 border rounded text-sm" disabled={!isEditable} />
                          </td>
                          <td className="py-2 pr-3">
                            <input value={fat.years_used} onChange={(e) => handleFatChange(fat.id, "years_used", e.target.value)} placeholder="Years" type="number" inputMode="numeric" pattern="\d*" className="p-1 border rounded text-sm w-20" disabled={!isEditable} />
                          </td>
                          <td className="py-2 pr-3">
                            <button onClick={() => handleRemoveFat(fat.id)} disabled={!isEditable} className="text-red-500 text-sm px-2 py-1">Remove</button>
                          </td>
                        </tr>
                      ))}

                      {fats.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-3 text-xs text-gray-500">No fat/oil recorded. Click Add to insert.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 border p-3 rounded">
                <h3 className="font-semibold mb-2">Preparation Method Frequency</h3>
                <div className="grid grid-cols-4 gap-2 text-xs font-bold border-b pb-2 mb-2">
                  <div>Method</div>
                  <div className="text-center">Never (0)</div>
                  <div className="text-center">Rarely (1)</div>
                  <div className="text-center">Most Time (2)</div>
                </div>
                {PREP_METHODS.map((method) => {
                  const key = PREP_KEYS[method] ;
                  return (
                    <div key={key} className="grid grid-cols-4 items-center py-2 border-b last:border-b-0 text-sm">
                      <div>{method}</div>
                      {["0", "1", "2"].map((val) => (
                        <div key={val} className="flex justify-center">
                          <input
                            type="radio"
                            name={`prep-${method}`}
                            value={val}
                            checked={(master as any)[key] === val}
                            disabled={!isEditable}
                            onChange={(e) => handleMasterChange(key, e.target.value)}
                          />

                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </section>

            <hr className="my-4 border-gray-200" />

            {/* Household */}
            <section>
              <h2 className="text-lg font-semibold">3. Household Habits</h2>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium">How many family members usually share each meal?</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="\d*"
                    value={master.family_sharing as any}
                    onChange={(e) => handleMasterChange("family_sharing", e.target.value)}
                    className="w-full p-2 border rounded mt-1 text-sm"
                    disabled={!isEditable}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">How many times do you eat daily?</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="\d*"
                    value={master.meals_per_day as any}
                    onChange={(e) => handleMasterChange("meals_per_day", e.target.value)}
                    className="w-full p-2 border rounded mt-1 text-sm"
                    disabled={!isEditable}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Water supply</label>

                  {/* tags display */}
                  <div className="flex gap-2 flex-wrap items-center mb-3">
                    {waterSupplyTags.map((tag) => (
                      <div key={tag} className="inline-flex items-center bg-gray-200 rounded-full px-3 py-1 text-xs mr-2">
                        <span className="mr-2">{tag}</span>
                        <button aria-label={`Remove ${tag}`} onClick={() => removeWaterTag(tag)} className="text-xs text-gray-600 hover:text-red-600 px-1">×</button>
                      </div>
                    ))}

                    {waterSupplyTags.length === 0 && (
                      <div className="text-xs text-gray-500 italic">No water source recorded</div>
                    )}
                  </div>

                  {/* add control: dropdown + optional other input */}
                  <div className="flex items-center gap-2">
                    {showAddWater ? (
                      <>
                        <select
                          value={selectedWaterOption}
                          onChange={(e) => setSelectedWaterOption(e.target.value)}
                          className="p-1 border rounded text-sm"
                        >
                          {WATER_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>

                        {selectedWaterOption === "Other (input)" && (
                          <input
                            type="text"
                            value={otherWaterValue}
                            onChange={(e) => setOtherWaterValue(e.target.value)}
                            placeholder="Specify other source"
                            className="p-1 border rounded text-sm"
                          />
                        )}

                        <div className="flex gap-1">
                          <button onClick={addWaterTag} className="px-2 py-1 border rounded text-sm bg-cyan-50">Add</button>
                          <button onClick={() => { setShowAddWater(false); setOtherWaterValue(""); setSelectedWaterOption(WATER_OPTIONS[0]); }} className="px-2 py-1 border rounded text-sm">Cancel</button>
                        </div>
                      </>
                    ) : (
                      <button onClick={() => setShowAddWater(true)} className="px-2 py-1 border rounded text-sm">+ Add</button>
                    )}
                  </div>
                </div>

              </div>
            </section>

            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-2">
                <Button label="Save Habits" onClick={handleSave} disabled={!isEditable || saveInProgress} />
                <Button label="Save & Go to 24-Hr Recall" severity="success" onClick={handleSaveAndGotoRecall} disabled={!isEditable || saveInProgress} />
              </div>
            </div>
          </main>
        </div>

        {/* Persistent bottom-center status toast (does not auto-hide) */}
        <div className="fixed left-1/2 transform -translate-x-1/2 bottom-20 z-50">
          <div className={`px-4 py-2 rounded-full shadow-md text-sm flex items-center gap-3 ${saveInProgress ? "bg-blue-600 text-white" : isUnsaved ? "bg-orange-500 text-white" : "bg-green-600 text-white"}`}>
            {saveInProgress ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 01-8 8z"></path></svg>
                <span>Saving...</span>
              </>
            ) : isUnsaved ? (
              <>
                <span>Unsaved changes</span>
              </>
            ) : (
              <>
                <span>All changes saved</span>
              </>
            )}
          </div>
        </div>

        <div className="pb-[250px]"></div>

        <IonAlert isOpen={alert.show} onDidDismiss={() => setAlert({ show: false, header: "", message: "" })} header={alert.header} message={alert.message} buttons={["OK"]} />
      </IonContent>
    </IonPage>
  );
}
