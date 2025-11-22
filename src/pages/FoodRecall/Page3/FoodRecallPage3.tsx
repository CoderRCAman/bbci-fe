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
  saveRecallData,
  checkHabitEditEligibility,
} from "../data";
import shortUUID from "short-uuid";
import { Button } from "primereact/button";
import ShowRegisteredTab from "../../../components/ShowRegisteredTab";
import { useBlockNavigation } from "../../../utils/blockBackNavigation";
import { Steps } from "primereact/steps";
import { Accordion, AccordionTab } from "primereact/accordion";

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

  const searchParams = new URLSearchParams(location.search);
  const userId = searchParams.get("user_id") || "";
  const masterId = searchParams.get("master_id") || null;

  // Steps - same as Page 2
  const steps = [
    { label: "Dietary Profile" },
    { label: "Cooking Habits" },
    { label: "Household Habits" },
  ];

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (!masterId) {
        setAlert({ show: true, header: "Error", message: "No Master Survey ID was provided. Please go back and save the Food Habit page first." });
        setIsEditable(false);
        setIsLoading(false);
        return;
      }
      const entries = await loadRecallData(db!!, masterId);
      setFoodLog(entries || []);
    } catch (e: any) {
      setAlert({ show: true, header: "Load Error", message: `Failed to load data: ${e.message}` });
      setIsEditable(false);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!db || !sqlite || !tabId) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, sqlite, masterId, tabId]);

  useBlockNavigation(isUnsaved, () => {
    setAlert({ show: true, header: "Unsaved Changes", message: "You have unsaved changes. Please save before navigating away." });
  });

  // Utilities: group by date (YYYY-MM-DD)
  const getDateKey = (dateTime: string) => {
    try {
      // Try to parse ISO-ish or 'sv-SE' format; fallback to substring
      const d = new Date(dateTime);
      if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      }
      // fallback: first 10 chars
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

    // Sort dates descending (newest first), and entries in each group reverse chronological
    const sortedKeys = Object.keys(groups).sort((a, b) => (a < b ? 1 : -1));
    const ordered: [string, IFoodRecallEntry[]][] = sortedKeys.map(k => {
      const entries = groups[k].sort((e1, e2) => {
        const t1 = new Date(e1.date_time || e1.updated_at || e1.created_at || 0).getTime();
        const t2 = new Date(e2.date_time || e2.updated_at || e2.created_at || 0).getTime();
        return t2 - t1; // newest first
      });
      return [k, entries];
    });

    return { ordered, keys: sortedKeys };
  }, [foodLog]);

  // Expand default: latest date group
  useEffect(() => {
    if (groupedByDate.keys && groupedByDate.keys.length > 0) {
      setExpandedKey(groupedByDate.keys[0]);
    } else {
      setExpandedKey(null);
    }
  }, [groupedByDate.keys.length]);

  // CRUD handlers for entries & ingredients
  const handleAddFoodEntry = () => {
    if (!masterId) return;
    setIsUnsaved(true);
    const newEntry: IFoodRecallEntry = {
      id: shortUUID.generate(),
      master_id: masterId,
      timing: "Breakfast",
      name_of_dish: "",
      quantity: "",
      date_time: new Date().toISOString(),
      ingredients: [],
      diet_context: "regular",
      festival_name: "",
      synch_flag: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tab_id: tabId,
    };
    setFoodLog(prev => [...prev, newEntry]);
    // Ensure the new date group becomes expanded
    const newKey = getDateKey(newEntry.date_time);
    setExpandedKey(newKey);
  };

  const handleRemoveFoodEntry = (id: string) => {
    setIsUnsaved(true);
    setFoodLog(prev => prev.filter(e => e.id !== id));
  };

  const handleFoodEntryChange = (id: string, field: keyof IFoodRecallEntry, value: any) => {
    setIsUnsaved(true);
    setFoodLog(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleAddIngredient = (foodId: string) => {
    setIsUnsaved(true);
    setFoodLog(prev => prev.map(food => {
      if (food.id === foodId) {
        const newIng: IFoodRecallIngredient = {
          id: shortUUID.generate(),
          entry_id: foodId,
          name: "",
          quantity: "",
          prep_method: "",
        };
        return { ...food, ingredients: [...food.ingredients, newIng] };
      }
      return food;
    }));
  };

  const handleIngredientChange = (foodId: string, ingId: string, field: keyof IFoodRecallIngredient, value: any) => {
    setIsUnsaved(true);
    setFoodLog(prev => prev.map(food => {
      if (food.id === foodId) {
        return { ...food, ingredients: food.ingredients.map(ing => ing.id === ingId ? { ...ing, [field]: value } : ing) };
      }
      return food;
    }));
  };

  const handleRemoveIngredient = (foodId: string, ingId: string) => {
    setIsUnsaved(true);
    setFoodLog(prev => prev.map(food => {
      if (food.id === foodId) {
        return { ...food, ingredients: food.ingredients.filter(ing => ing.id !== ingId) };
      }
      return food;
    }));
  };

  // Save recalls
  const handleSave = async () => {
    if (!db || !sqlite || !masterId || !isEditable) {
      setAlert({ show: true, header: "Cannot Save", message: "The database is not ready, data is missing, or you do not have permission to edit." });
      return;
    }

    if (db && !(await checkHabitEditEligibility(db, masterId, tabId, "FOOD_RECALL_ENTRY", "master_id"))) {
      setAlert({ show: true, header: "Restricted access", message: "This record was registered with a different tab id." });
      return;
    }

    setIsLoading(true);
    try {
      await saveRecallData(db, sqlite, foodLog, masterId, tabId);
      setIsLoading(false);
      setAlert({ show: true, header: "Success", message: "Food Recall (7.3) data has been saved." });
      setIsUnsaved(false);
    } catch (e: any) {
      setIsLoading(false);
      setAlert({ show: true, header: "Save Error", message: `Failed to save data: ${e.message}` });
    }
  };

  // If the user clicks a step on the Steps (visible on Page 3), navigate back to Page 2 with ?step=index
  const handleStepClick = (e: any) => {
    // The Steps onSelect passes e.index
    const stepIndex = e.index;
    // navigate to page 2 and include step param
    const params = new URLSearchParams();
    if (masterId) params.set("master_id", masterId);
    if (userId) params.set("user_id", userId);
    params.set("step", String(stepIndex));
    history.push(`/food-recall/page2?${params.toString()}`);
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

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadData();
    setIsUnsaved(false);
    event.detail.complete();
  };

  return (
    <IonPage>
      <Header title="Food Recall Entry (Module 2: 7.3)" />
      <IonContent className="ion-padding" fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent className="spinner-only" refreshingSpinner="circles" />
        </IonRefresher>

        <div className="max-w-5xl mx-auto p-2">
          {/* Steps visible for context when in edit mode */}
          {masterId && (
            <div className="mb-4">
              <Steps model={steps} onSelect={handleStepClick} readOnly={false} />
              <div className="text-xs text-gray-500 mt-1">You are editing a saved survey — click a step to jump back to that section.</div>
            </div>
          )}

          <ShowRegisteredTab id={masterId || ""} table_name="FOOD_RECALL_ENTRY" field_name="master_id" />

          {/* Add Entry button moved to top */}
          <div className="flex justify-between items-center mb-4">
            <div />
            <div>
              <Button label="+ Add Meal/Dish" severity="info" onClick={handleAddFoodEntry} disabled={!isEditable} />
            </div>
          </div>

          {/* Accordion grouped by date */}
          <div className="bg-white p-4 rounded-lg shadow border">
            {groupedByDate.ordered.length === 0 && (
              <p className="text-sm text-gray-500 text-center italic py-6">No entries yet — use "Add Meal/Dish" to create the first entry.</p>
            )}

            {groupedByDate.ordered.length > 0 && (
              <Accordion activeIndex={expandedKey ? groupedByDate.keys.indexOf(expandedKey) : -1} onTabChange={(e) => {
                const idx = e.index;
                if (idx === -1) {
                  setExpandedKey(null);
                } else {
                  setExpandedKey(groupedByDate.keys[idx as any]);
                }
              }}>
                {groupedByDate.ordered.map(([dateKey, entries]) => (
                  <AccordionTab key={dateKey} header={`${dateKey} — ${entries.length} item(s)`}>
                    <div className="space-y-4">
                      {entries.map((entry, idx) => (
                        <div key={entry.id} className="border-2 border-cyan-100 rounded-lg p-4 bg-cyan-50/50 relative">
                          <h3 className="font-bold text-gray-800 mb-2">Meal/Dish {idx + 1}</h3>
                          <button onClick={() => handleRemoveFoodEntry(entry.id)} disabled={!isEditable} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl px-2 py-0 disabled:text-gray-300" title="Remove Dish">&times;</button>

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Timing</label>
                              <IonSelect value={entry.timing} onIonChange={(e) => handleFoodEntryChange(entry.id, "timing", e.detail.value)} interface="popover" placeholder="Select" disabled={!isEditable}>
                                <IonSelectOption value="Breakfast">Breakfast</IonSelectOption>
                                <IonSelectOption value="Lunch">Lunch</IonSelectOption>
                                <IonSelectOption value="Dinner">Dinner</IonSelectOption>
                                <IonSelectOption value="Snack">Snack</IonSelectOption>
                                <IonSelectOption value="Other">Other</IonSelectOption>
                              </IonSelect>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Date/Time</label>
                              <input type="datetime-local" value={entry.date_time} onChange={(e) => handleFoodEntryChange(entry.id, "date_time", e.target.value)} disabled={!isEditable} className="w-full p-2 border rounded-md disabled:bg-gray-100" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Type of Diet for this Dish</label>
                              <IonSelect value={entry.diet_context} disabled={!isEditable} onIonChange={(e) => {
                                handleFoodEntryChange(entry.id, 'diet_context', e.detail.value);
                                if (e.detail.value !== 'festival') handleFoodEntryChange(entry.id, 'festival_name', '');
                              }} interface="popover" placeholder="Select">
                                <IonSelectOption value="regular">Regular</IonSelectOption>
                                <IonSelectOption value="fasting">Ritual</IonSelectOption>
                                <IonSelectOption value="festival">Festival</IonSelectOption>
                              </IonSelect>
                            </div>
                            {entry.diet_context === 'festival' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Festival Name</label>
                                <input type="text" value={entry.festival_name} onChange={(e) => handleFoodEntryChange(entry.id, 'festival_name', e.target.value)} placeholder="Name of Festival" disabled={!isEditable} className="w-full p-2 border rounded-md disabled:bg-gray-100" />
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Name of Dish</label>
                              <input type="text" value={entry.name_of_dish} onChange={(e) => handleFoodEntryChange(entry.id, "name_of_dish", e.target.value)} placeholder="e.g., Dal, Roti" disabled={!isEditable} className="w-full p-2 border rounded-md disabled:bg-gray-100" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Quantity Consumed</label>
                              <input type="text" value={entry.quantity} onChange={(e) => handleFoodEntryChange(entry.id, "quantity", e.target.value)} placeholder="e.g., 2 cups" disabled={!isEditable} className="w-full p-2 border rounded-md disabled:bg-gray-100" />
                            </div>
                          </div>

                          <div className="border border-dashed border-gray-300 p-3 mt-4">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-md font-semibold text-gray-700">Ingredients Detail</h4>
                              <Button label="+ Ingredient" severity="secondary" className="p-button-sm" onClick={() => handleAddIngredient(entry.id)} disabled={!isEditable} />
                            </div>

                            {entry.ingredients.map((ing) => (
                              <div key={ing.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 border-t pt-2 mt-2 items-end">
                                <input type="text" value={ing.name} onChange={(e) => handleIngredientChange(entry.id, ing.id, "name", e.target.value)} placeholder="Ingredient Name" disabled={!isEditable} className="p-1 border rounded-md col-span-1 disabled:bg-gray-100" />
                                <input type="text" value={ing.quantity} onChange={(e) => handleIngredientChange(entry.id, ing.id, "quantity", e.target.value)} placeholder="Qty" disabled={!isEditable} className="p-1 border rounded-md col-span-1 disabled:bg-gray-100" />
                                <input type="text" value={ing.prep_method} onChange={(e) => handleIngredientChange(entry.id, ing.id, "prep_method", e.target.value)} placeholder="Prep Method" disabled={!isEditable} className="p-1 border rounded-md col-span-1 disabled:bg-gray-100" />
                                <Button icon="pi pi-times" severity="danger" className="p-button-sm p-button-text" onClick={() => handleRemoveIngredient(entry.id, ing.id)} disabled={!isEditable} />
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

          {/* Save and Back */}
          <div className="mt-6 flex justify-between items-center">
            <Button label="Save Recalls (7.3)" severity="success" className="px-10 py-2" onClick={handleSave} disabled={!isEditable || isLoading} />
            <Link to={`/food-recall/page2?master_id=${masterId}&user_id=${userId}`} onClick={(e) => {
              if (isUnsaved) {
                e.preventDefault();
                setAlert({ show: true, header: "Unsaved Changes", message: "You have unsaved changes. Please save before navigating away." });
              }
            }}>
              <Button label="Back to Habits (Module 1)" className="px-5 py-2 rounded" />
            </Link>
          </div>
        </div>

        <IonAlert isOpen={alert.show} onDidDismiss={() => setAlert((a) => ({ ...a, show: false }))} header={alert.header} message={alert.message} buttons={["OK"]} />
      </IonContent>
    </IonPage>
  );
}
