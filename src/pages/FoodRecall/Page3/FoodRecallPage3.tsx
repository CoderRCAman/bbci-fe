// /mnt/data/FoodRecallPage3.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useLocation, Link, useHistory } from "react-router-dom";
import { useSQLite } from "../../../utils/Sqlite";
import {
  IonContent,
  IonPage,
  IonAlert,
  IonSelect,
  IonSelectOption,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
} from "@ionic/react";
import Header from "../../../components/Header";
import {
  IFoodRecallEntry,
  IFoodRecallIngredient,
  loadRecallData,
  loadHabitData,
  saveRecallData,
  checkHabitEditEligibility,
} from "../data";
import shortUUID from "short-uuid";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Accordion, AccordionTab } from "primereact/accordion";
import { useBlockNavigation } from "../../../utils/blockBackNavigation";
import FlowCrumbs from "../../../components/FlowCrumbs";
import AlphaOnlyInput from "../../../components/AlphaOnlyInput";

// ---------- PREP METHODS LIST (standardized) ----------
const PREP_METHODS = [
  "Shallow Frying",
  "Deep Frying",
  "Boiling",
  "Steaming",
  "Sauting",
  "Grill/Barbeque",
  "Other (input)",
] as const;

export default function FoodRecallEntryPage() {
  const { db, sqlite, tabId } = useSQLite();
  const location = useLocation();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditable, setIsEditable] = useState(true);
  const [foodLog, setFoodLog] = useState<IFoodRecallEntry[]>([]);
  const [alert, setAlert] = useState({ show: false, header: "", message: "" });
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [readOnlyNotice, setReadOnlyNotice] = useState<string>("");
  const [patientName, setPatientName] = useState<string>("");
  const [masterTabId, setMasterTabId] = useState<string>("");

  const searchParams = new URLSearchParams(location.search);
  const userId = searchParams.get("user_id") || "";
  const masterId = searchParams.get("master_id") || null;

  // TWO-STEP flow (Food Habits + 24-Hr Recall)
  const steps = [
    { label: "Food Habits", path: "/food-recall/page2", order: 1 },
    { label: "24-Hr Recall", path: "/food-recall/page3", order: 2 },
  ];

  // helpers for datetime conversion
  const formatDbNow = (): string => new Date().toLocaleString("sv-SE").replace("T", " ");
  const dbToInputDatetime = (dbDate?: string) => {
    if (!dbDate) return "";
    const d = new Date(dbDate);
    if (!isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const min = String(d.getMinutes()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    }
    const trimmed = dbDate.trim();
    if (trimmed.length >= 16 && trimmed[10] === " ") {
      return trimmed.substring(0, 16).replace(" ", "T");
    }
    return "";
  };
  const inputToDbDatetime = (inputVal: string) => {
    if (!inputVal) return "";
    const spacey = inputVal.replace("T", " ");
    if (spacey.length === 16) return `${spacey}:00`;
    return spacey;
  };

  // ---------- Helpers ----------
  const fetchMasterMeta = async (dbConn: any, mId: string | null) => {
    if (!dbConn || !mId) return null;
    try {
      // reuse loadHabitData: pass empty user_id and master_id present
      const res = await loadHabitData(dbConn, "", mId);
      return res?.master || null;
    } catch (err) {
      console.warn("fetchMasterMeta failed", err);
      return null;
    }
  };

  const fetchPatientName = async (dbConn: any, uId: string) => {
    if (!dbConn || !uId) return "";
    try {
      const tryQuery = async (q: string) => {
        try {
          const res = await dbConn.query(q, [uId]);
          if (res?.values && res.values[0]) {
            const val = res.values[0];
            for (const k of Object.keys(val)) {
              if (typeof val[k] === "string" && val[k].trim().length > 0) return val[k];
            }
          }
          return "";
        } catch {
          return "";
        }
      };
      let name = await tryQuery(`SELECT name FROM patients WHERE id = ?`);
      if (!name) name = await tryQuery(`SELECT full_name FROM patients WHERE id = ?`);
      if (!name) name = await tryQuery(`SELECT patient_name FROM patients WHERE id = ?`);
      return name || "";
    } catch (err) {
      console.warn("fetchPatientName failed", err);
      return "";
    }
  };

  // ---------- Load data and meta ----------
  const loadData = async () => {
    setIsLoading(true);
    setReadOnlyNotice("");
    try {
      if (!masterId) {
        setAlert({ show: true, header: "Error", message: "No Master Survey ID was provided. Please go back and save the Food Habit page first." });
        setIsEditable(false);
        setIsLoading(false);
        return;
      }

      // fetch master metadata (to show tab_id and patient)
      const masterMeta = await fetchMasterMeta(db!!, masterId);
      if (masterMeta) {
        setMasterTabId(masterMeta.tab_id || "");
        // try patient name if user_id present on master
        if (masterMeta.user_id) {
          const name = await fetchPatientName(db!!, masterMeta.user_id);
          setPatientName(name);
        }
      } else {
        // fallback: try fetch patientName from url userId
        if (userId) {
          const name = await fetchPatientName(db!!, userId);
          setPatientName(name);
        }
      }

      // permission check using same pattern (table_name and field_name)
      try {
        const allowed = await checkHabitEditEligibility(db!!, masterId, tabId, "FOOD_RECALL_ENTRY", "master_id");
        setIsEditable(!!allowed);
        if (!allowed) {
          setReadOnlyNotice("Read-only (created by another tab)");
        } else {
          setReadOnlyNotice("");
        }
      } catch (err) {
        console.warn("eligibility check failed", err);
        setIsEditable(false);
        setReadOnlyNotice("Read-only (permission check failed)");
      }

      // load entries and normalize ingredient prep_method fields
      const entries = await loadRecallData(db!!, masterId);
      const normalized = (entries || []).map((entry) => {
        const ents = { ...entry };
        ents.ingredients = (entry.ingredients || []).map((ing: any) => {
          const copy: any = { ...ing };
          // If DB stored "Other: x", normalize for UI
          if (typeof copy.prep_method === "string" && copy.prep_method.startsWith("Other: ")) {
            copy._prep_other = copy.prep_method.substring(7);
            copy.prep_method = "Other (input)";
          } else if (!copy.prep_method) {
            copy.prep_method = ""; // empty selection
          }
          // ensure fields exist
          if (!copy.quantity) copy.quantity = "";
          if (!copy.name) copy.name = "";
          return copy;
        });
        return ents;
      });

      setFoodLog(normalized || []);
    } catch (e: any) {
      setAlert({ show: true, header: "Load Error", message: `Failed to load data: ${e.message}` });
      setIsEditable(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!db || !sqlite || !tabId) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, sqlite, masterId, tabId]);

  useBlockNavigation(isUnsaved, () => {
    setAlert({ show: true, header: "Unsaved Changes", message: "You have unsaved changes. Please save before navigating away." });
  });

  // grouping logic
  const getDateKey = (dateTime: string) => {
    try {
      const d = new Date(dateTime);
      if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      }
      return dateTime.substring(0, 10);
    } catch {
      return dateTime.substring(0, 10);
    }
  };

  const groupedByDate = useMemo(() => {
    const groups: Record<string, IFoodRecallEntry[]> = {};
    (foodLog || []).forEach((entry) => {
      const key = getDateKey(entry.date_time || entry.created_at || "");
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => (a < b ? 1 : -1));
    const ordered: [string, IFoodRecallEntry[]][] = sortedKeys.map((k) => {
      const es = groups[k].sort((a, b) => {
        const t1 = new Date(a.date_time || a.updated_at || a.created_at || 0).getTime();
        const t2 = new Date(b.date_time || b.updated_at || b.created_at || 0).getTime();
        return t2 - t1;
      });
      return [k, es];
    });

    return { ordered, keys: sortedKeys };
  }, [foodLog]);

  useEffect(() => {
    if (groupedByDate.keys && groupedByDate.keys.length > 0) {
      setExpandedKey(groupedByDate.keys[0]);
    } else {
      setExpandedKey(null);
    }
  }, [groupedByDate.keys.length]);

  // CRUD handlers
  const handleAddFoodEntry = () => {
    if (!masterId) return;
    if (!isEditable) {
      setAlert({ show: true, header: "Read-only", message: "You do not have permission to add entries for this record." });
      return;
    }
    setIsUnsaved(true);
    const nowDb = formatDbNow();
    const newEntry: IFoodRecallEntry = {
      id: shortUUID.generate(),
      master_id: masterId,
      timing: "Breakfast",
      name_of_dish: "",
      quantity: "",
      date_time: nowDb,
      ingredients: [],
      diet_context: "regular",
      festival_name: "",
      synch_flag: 0,
      created_at: nowDb,
      updated_at: nowDb,
      tab_id: tabId,
    };
    setFoodLog((prev) => [...prev, newEntry]);
    const newKey = getDateKey(newEntry.date_time);
    setExpandedKey(newKey);
  };

  const handleRemoveFoodEntry = (id: string) => {
    setIsUnsaved(true);
    setFoodLog((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleFoodEntryChange = (id: string, field: keyof IFoodRecallEntry, value: any) => {
    setIsUnsaved(true);
    setFoodLog((prev) => prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)));
  };

  const handleAddIngredient = (foodId: string) => {
    if (!isEditable) {
      setAlert({ show: true, header: "Read-only", message: "You do not have permission to add ingredients for this record." });
      return;
    }
    setIsUnsaved(true);
    setFoodLog((prev) =>
      prev.map((food) => {
        if (food.id === foodId) {
          const newIng: IFoodRecallIngredient & { _prep_other?: string } = {
            id: shortUUID.generate(),
            entry_id: foodId,
            name: "",
            quantity: "",
            prep_method: "", // empty initially
          } as any;
          return { ...food, ingredients: [...food.ingredients, newIng] };
        }
        return food;
      })
    );
  };

  const handleIngredientChange = (
    foodId: string,
    ingId: string,
    field: keyof IFoodRecallIngredient | string,
    value: any
  ) => {
    setIsUnsaved(true);
    setFoodLog((prev) =>
      prev.map((food) => {
        if (food.id === foodId) {
          return {
            ...food,
            ingredients: food.ingredients.map((ing: any) => {
              if (ing.id !== ingId) return ing;
              // support UI-only '_prep_other' field as well
              if (field === "_prep_other") {
                return { ...ing, _prep_other: value, prep_method: value ? "Other (input)" : ing.prep_method };
              }
              return { ...ing, [field]: value };
            }),
          };
        }
        return food;
      })
    );
  };

  const handleRemoveIngredient = (foodId: string, ingId: string) => {
    setIsUnsaved(true);
    setFoodLog((prev) =>
      prev.map((food) => {
        if (food.id === foodId) {
          return { ...food, ingredients: food.ingredients.filter((ing) => ing.id !== ingId) };
        }
        return food;
      })
    );
  };

  const handleSave = async () => {
    if (!db || !sqlite || !masterId) {
      setAlert({ show: true, header: "Cannot Save", message: "The database is not ready or data is missing." });
      return;
    }
    if (!isEditable) {
      setAlert({ show: true, header: "Read-only", message: "You do not have permission to save changes." });
      return;
    }

    // permission check (defensive)
    try {
      const allowed = await checkHabitEditEligibility(db, masterId, tabId, "FOOD_RECALL_ENTRY", "master_id");
      if (!allowed) {
        setAlert({ show: true, header: "Restricted access", message: "This record was registered with a different tab id." });
        setIsEditable(false);
        setReadOnlyNotice("Read-only (created by another tab)");
        return;
      }
    } catch (err) {
      console.warn("checkHabitEditEligibility error:", err);
      setAlert({ show: true, header: "Save Blocked", message: "Could not verify permissions to save this record." });
      return;
    }

    setIsLoading(true);
    try {
      // sanitize foodLog before saving: convert prep_method "Other (input)" + _prep_other => "Other: <value>"
      const sanitized = (foodLog || []).map((entry) => {
        const ecopy: any = { ...entry };
        ecopy.ingredients = (entry.ingredients || []).map((ing: any) => {
          const icopy: any = { ...ing };
          if (icopy.prep_method === "Other (input)" && icopy._prep_other) {
            icopy.prep_method = `Other: ${icopy._prep_other}`;
          }
          // ensure no UI-only fields in the saved object (optional: keep them, but better to strip)
          delete icopy._prep_other;
          return icopy;
        });
        return ecopy;
      });

      await saveRecallData(db, sqlite, sanitized, masterId, tabId);
      try {
        sessionStorage.setItem(`foodrecall_saved_${masterId}`, String(Date.now()));
      } catch { }
      setIsLoading(false);
      setAlert({ show: true, header: "Success", message: "Food Recall (7.3) data has been saved." });
      setIsUnsaved(false);

      const latest = await loadRecallData(db, masterId);
      // normalize newly loaded entries same as during initial load
      const normalized = (latest || []).map((entry) => {
        const ents = { ...entry };
        ents.ingredients = (entry.ingredients || []).map((ing: any) => {
          const copy: any = { ...ing };
          if (typeof copy.prep_method === "string" && copy.prep_method.startsWith("Other: ")) {
            copy._prep_other = copy.prep_method.substring(7);
            copy.prep_method = "Other (input)";
          } else if (!copy.prep_method) {
            copy.prep_method = "";
          }
          if (!copy.quantity) copy.quantity = "";
          if (!copy.name) copy.name = "";
          return copy;
        });
        return ents;
      });
      setFoodLog(normalized || []);
    } catch (e: any) {
      setIsLoading(false);
      setAlert({ show: true, header: "Save Error", message: `Failed to save data: ${e.message}` });
    }
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadData();
    setIsUnsaved(false);
    event.detail.complete();
  };

  // FlowCrumbs step click -> go to Page2 with master_id
  const handleStepClick = (e: any) => {
    const params = new URLSearchParams();
    if (masterId) params.set("master_id", masterId);
    if (userId) params.set("user_id", userId);

    // Temporarily bypass the block (toggle off) to allow breadcrumb navigation even when editing.
    const prevUnsaved = isUnsaved;
    try {
      setIsUnsaved(false); // temporarily disable guard
      history.push(`/food-recall/page2?${params.toString()}`);
    } finally {
      // restore unsaved flag shortly after navigation so UI state remains correct if user returns
      setTimeout(() => setIsUnsaved(prevUnsaved), 150);
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

  return (
    <IonPage>
      <Header title="24-Hours Food Recall Entry" />
      <IonContent className="ion-padding" fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent refreshingSpinner="circles" />
        </IonRefresher>

        <div className="max-w-5xl mx-auto p-2">
          {/* Stepper + right-justified tab-id + read-only badge */}
          <div className="flex items-start gap-3 mb-2">
            <div className="flex-1">
              <FlowCrumbs steps={steps} currentPageLabel={steps[1].label} idQueryParam={"master_id"} />
              {/* patient name shown under stepper */}
              {patientName ? (
                <div className="mt-2 text-sm font-medium text-gray-700">
                  Participant: <span className="font-semibold">{patientName}</span>
                </div>
              ) : (
                <div className="mt-2 text-sm text-gray-500">
                  Participant: <span className="italic">Unknown</span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-end ml-4">
              <div className="text-xs text-gray-600">Recorded with tab id :</div>
              <div className="mt-1">
                <Tag value={masterTabId || tabId || "—"} severity="info" rounded className="text-sm px-3 py-1" />
              </div>

              {readOnlyNotice ? (
                <div className="mt-2">
                  <Tag value={readOnlyNotice} severity="warning" rounded className="text-xs px-2 py-1" />
                </div>
              ) : null}
            </div>
          </div>

          {/* replace ShowRegisteredTab with the lightweight header info (kept removed per your earlier request) */}

          <div className="flex justify-between items-center mb-4">
            <div />
            <div>
              <Button label="+ Add Meal/Dish" severity="info" onClick={handleAddFoodEntry} disabled={!isEditable} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            {groupedByDate.ordered.length === 0 ? (
              <p className="text-sm text-gray-500 text-center italic py-6">No entries yet — use "Add Meal/Dish" to create the first entry.</p>
            ) : (
              <Accordion
                activeIndex={expandedKey ? groupedByDate.keys.indexOf(expandedKey) : -1}
                onTabChange={(e) => {
                  const idx = e.index;
                  if (idx === -1) setExpandedKey(null);
                  else setExpandedKey(groupedByDate.keys[idx as number]);
                }}
              >
                {groupedByDate.ordered.map(([dateKey, entries]) => (
                  <AccordionTab key={dateKey} header={`${dateKey} — ${entries.length} item(s)`}>
                    <div className="space-y-4">
                      {entries.map((entry, idx) => (
                        <div key={entry.id} className="border-2 border-cyan-100 rounded-lg p-4 bg-cyan-50/50 relative">
                          <h3 className="font-bold text-gray-800 mb-2">Meal/Dish {idx + 1}</h3>
                          <button
                            onClick={() => handleRemoveFoodEntry(entry.id)}
                            disabled={!isEditable}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl px-2 py-0 disabled:text-gray-300"
                            title="Remove Dish"
                          >
                            &times;
                          </button>

                          {/* compact top row: Timing | Type of Diet | Date/Time */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Timing</label>
                              <IonSelect
                                value={entry.timing}
                                onIonChange={(e) => handleFoodEntryChange(entry.id, "timing", e.detail.value)}
                                interface="popover"
                                placeholder="Select"
                                disabled={!isEditable}
                              >
                                <IonSelectOption value="Breakfast">Breakfast</IonSelectOption>
                                <IonSelectOption value="Lunch">Lunch</IonSelectOption>
                                <IonSelectOption value="Dinner">Dinner</IonSelectOption>
                                <IonSelectOption value="Snack">Snack</IonSelectOption>
                                <IonSelectOption value="Other">Other</IonSelectOption>
                              </IonSelect>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">Type of Diet for this Dish</label>
                              <IonSelect
                                value={entry.diet_context}
                                disabled={!isEditable}
                                onIonChange={(e) => {
                                  handleFoodEntryChange(entry.id, "diet_context", e.detail.value);
                                  if (e.detail.value !== "festival") handleFoodEntryChange(entry.id, "festival_name", "");
                                }}
                                interface="popover"
                                placeholder="Select"
                              >
                                <IonSelectOption value="regular">Regular</IonSelectOption>
                                <IonSelectOption value="fasting">Ritual</IonSelectOption>
                                <IonSelectOption value="festival">Festival</IonSelectOption>
                              </IonSelect>

                              {/* festival name inline under Type column */}
                              {entry.diet_context === "festival" && (
                                <div className="mt-2">
                                  <label className="block text-sm font-medium text-gray-700">Festival Name</label>
                                  <AlphaOnlyInput
                                    value={entry.festival_name}
                                    onChange={(e: any) => handleFoodEntryChange(entry.id, "festival_name", e.target.value)}
                                    placeholder="Name of Festival"
                                    disabled={!isEditable}
                                    className="w-full p-2 border rounded-md disabled:bg-gray-100"
                                  />
                                </div>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">Date/Time</label>
                              <input
                                type="datetime-local"
                                value={dbToInputDatetime(entry.date_time)}
                                onChange={(e) => handleFoodEntryChange(entry.id, "date_time", inputToDbDatetime((e.target as HTMLInputElement).value))}
                                disabled={!isEditable}
                                className="w-full p-2 border rounded-md disabled:bg-gray-100"
                              />
                            </div>
                          </div>

                          {/* second row: Name of Dish | Quantity */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Name of Dish</label>
                              <AlphaOnlyInput
                                value={entry.name_of_dish}
                                onChange={(e: any) => handleFoodEntryChange(entry.id, "name_of_dish", e.target.value)}
                                placeholder="e.g., Dal, Roti"
                                disabled={!isEditable}
                                className="w-full p-2 border rounded-md disabled:bg-gray-100"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Quantity Consumed</label>
                              <input
                                type="text"
                                value={entry.quantity}
                                onChange={(e) => handleFoodEntryChange(entry.id, "quantity", e.target.value)}
                                placeholder="e.g., 2 gm"
                                disabled={!isEditable}
                                className="w-full p-2 border rounded-md disabled:bg-gray-100"
                              />
                            </div>
                          </div>

                          <div className="border border-dashed border-gray-300 p-3 mt-4">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-md font-semibold text-gray-700">Ingredients Detail</h4>
                              <Button label="+ Ingredient" severity="secondary" className="p-button-sm" onClick={() => handleAddIngredient(entry.id)} disabled={!isEditable} />
                            </div>

                            {/* Ingredients header row */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs font-bold border-b pb-2 mb-2">
                              <div>Ingredient</div>
                              <div>Qty</div>
                              <div>Prep Method</div>
                              <div className="text-right">Actions</div>
                            </div>

                            {(entry.ingredients || []).map((ing: any) => (
                              <div key={ing.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 border-t pt-2 mt-2 items-end">
                                <AlphaOnlyInput
                                  value={ing.name}
                                  onChange={(e: any) => handleIngredientChange(entry.id, ing.id, "name", e.target.value)}
                                  placeholder="Ingredient Name"
                                  disabled={!isEditable}
                                  className="p-1 border rounded-md col-span-1 disabled:bg-gray-100"
                                />
                                <input
                                  type="text"
                                  value={ing.quantity}
                                  onChange={(e) => handleIngredientChange(entry.id, ing.id, "quantity", e.target.value)}
                                  placeholder="Gram"
                                  disabled={!isEditable}
                                  className="p-1 border rounded-md col-span-1 disabled:bg-gray-100"
                                />

                                {/* Prep method: standardized select + optional other input */}
                                <div className="col-span-1 flex gap-2 items-center">
                                  <select
                                    value={ing.prep_method || ""}
                                    onChange={(e) => {
                                      const v = e.target.value;
                                      handleIngredientChange(entry.id, ing.id, "prep_method", v);
                                      // clear _prep_other if not other
                                      if (v !== "Other (input)") {
                                        handleIngredientChange(entry.id, ing.id, "_prep_other", "");
                                      }
                                    }}
                                    disabled={!isEditable}
                                    className="p-1 border rounded text-sm w-full"
                                  >
                                    <option value="">-- Select prep method --</option>
                                    {PREP_METHODS.map((pm) => (
                                      <option key={pm} value={pm}>
                                        {pm}
                                      </option>
                                    ))}
                                  </select>

                                  {/* other input when needed (alpha-only) */}
                                  {ing.prep_method === "Other (input)" && (
                                    <AlphaOnlyInput
                                      value={ing._prep_other || ""}
                                      onChange={(e: any) => handleIngredientChange(entry.id, ing.id, "_prep_other", e.target.value)}
                                      placeholder="Specify"
                                      disabled={!isEditable}
                                      className="p-1 border rounded text-sm w-36"
                                    />
                                  )}
                                </div>


                                <div className="flex justify-end">
                                  <Button icon="pi pi-times" severity="danger" className="p-button-sm p-button-text" onClick={() => handleRemoveIngredient(entry.id, ing.id)} disabled={!isEditable} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionTab>
                ))}
              </Accordion>
            )}
          </div>

          <div className="mt-6 flex justify-between items-center">
            <Button label="Save Recalls" severity="success" className="px-10 py-2" onClick={handleSave} disabled={!isEditable || isLoading} />
          </div>
        </div>

        {/* Persistent bottom-center status toast (does not auto-hide) */}
        <div className="fixed left-1/2 transform -translate-x-1/2 bottom-6 z-50">
          <div className={`px-4 py-2 rounded-full shadow-md text-sm flex items-center gap-3 ${isLoading ? "bg-blue-600 text-white" : isUnsaved ? "bg-orange-500 text-white" : "bg-green-600 text-white"}`}>
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 01-8 8z"></path></svg>
                <span>Loading...</span>
              </>
            ) : isUnsaved ? (
              <span>Unsaved changes</span>
            ) : (
              <span>All changes saved</span>
            )}
          </div>
        </div>

        <div className="pb-[250px]"></div>

        <IonAlert isOpen={alert.show} onDidDismiss={() => setAlert((a) => ({ ...a, show: false }))} header={alert.header} message={alert.message} buttons={["OK"]} />
      </IonContent>
    </IonPage>
  );
}
