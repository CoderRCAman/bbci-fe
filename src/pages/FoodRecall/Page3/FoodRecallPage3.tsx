import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
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
} from "../data"; // Corrected path (up one level)
import shortUUID from "short-uuid";
import { Button } from "primereact/button";
import ShowRegisteredTab from "../../../components/ShowRegisteredTab";
import { useBlockNavigation } from "../../../utils/blockBackNavigation";

export default function FoodRecallEntryPage() {
  const { db, sqlite, tabId } = useSQLite();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(true);
  const [isEditable, setIsEditable] = useState(true);

  // State for this page
  const [foodLog, setFoodLog] = useState<IFoodRecallEntry[]>([]);
  const [alert, setAlert] = useState({ show: false, header: "", message: "" });
  const [isUnsaved, setIsUnsaved] = useState(false);
  // Get IDs from URL
  const searchParams = new URLSearchParams(location.search);
  const userId = searchParams.get("user_id") || "";
  const masterId = searchParams.get("master_id") || null; // This IS REQUIRED here

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Check Edit Eligibility (Creator Lock)
      // Load existing recall data
      const existingData = await loadRecallData(db!!, masterId!!);
      setFoodLog(existingData);
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
    if (!masterId) {
      setAlert({
        show: true,
        header: "Error",
        message:
          "No Master Survey ID was provided. Please go back and save the Food Habit page first.",
      });
      setIsEditable(false);
      setIsLoading(false);
      return;
    }

    loadData();
  }, [db, sqlite, masterId, tabId]);
  useBlockNavigation(isUnsaved, () => {
    setAlert({
      show: true,
      header: "Unsaved Changes",
      message: "You have unsaved changes. Please save before navigating away.",
    });
  });
  // --- 7.3 Dynamic Log Functions ---
  const handleAddFoodEntry = () => {
    if (!masterId) return;
    setIsUnsaved(true);
    const newEntry: IFoodRecallEntry = {
      id: shortUUID.generate(),
      master_id: masterId,
      timing: "Breakfast",
      name_of_dish: "",
      quantity: "",
      date_time: new Date().toLocaleString("sv-SE").replace("T", " "),
      ingredients: [],
      diet_context: "regular",
      festival_name: "",
      synch_flag: 0,
      created_at: new Date().toLocaleString("sv-SE").replace("T", " "),
      updated_at: new Date().toLocaleString("sv-SE").replace("T", " "),
      tab_id: tabId,
    };
    setFoodLog([...foodLog, newEntry]);
  };

  const handleRemoveFoodEntry = (id: string) => {
    setIsUnsaved(true);
    setFoodLog(foodLog.filter((entry) => entry.id !== id));
  };

  const handleFoodEntryChange = (
    id: string,
    field: keyof IFoodRecallEntry,
    value: any
  ) => {
    setIsUnsaved(true);
    setFoodLog(
      foodLog.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleAddIngredient = (foodId: string) => {
    setIsUnsaved(true);
    setFoodLog(
      foodLog.map((food) => {
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
      })
    );
  };

  const handleIngredientChange = (
    foodId: string,
    ingId: string,
    field: keyof IFoodRecallIngredient,
    value: any
  ) => {
    setIsUnsaved(true);
    setFoodLog(
      foodLog.map((food) => {
        if (food.id === foodId) {
          return {
            ...food,
            ingredients: food.ingredients.map((ing: any) =>
              ing.id === ingId ? { ...ing, [field]: value } : ing
            ),
          };
        }
        return food;
      })
    );
  };

  const handleRemoveIngredient = (foodId: string, ingId: string) => {
    setIsUnsaved(true);
    setFoodLog(
      foodLog.map((food) => {
        if (food.id === foodId) {
          return {
            ...food,
            ingredients: food.ingredients.filter(
              (ing: any) => ing.id !== ingId
            ),
          };
        }
        return food;
      })
    );
  };

  // --- Save Handler ---
  const handleSave = async () => {
    if (!db || !sqlite || !masterId || !isEditable) {
      setAlert({
        show: true,
        header: "Cannot Save",
        message:
          "The database is not ready, data is missing, or you do not have permission to edit.",
      });
      return;
    }
    if (
      db &&
      !(await checkHabitEditEligibility(
        db,
        masterId,
        tabId,
        "FOOD_RECALL_ENTRY",
        "master_id"
      ))
    ) {
      setAlert({
        show: true,
        header: "Restricted access",
        message: "This record was registered with a different tab id.",
      });
      return;
    }
    setIsLoading(true);
    try {
      await saveRecallData(db, sqlite, foodLog, masterId, tabId);
      setIsLoading(false);
      setAlert({
        show: true,
        header: "Success",
        message: "Food Recall (7.3) data has been saved.",
      });
      setIsUnsaved(false);
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
          <IonRefresherContent
            className="spinner-only"
            refreshingSpinner="circles"
          />
        </IonRefresher>
        <ShowRegisteredTab
          id={masterId || ""}
          table_name="FOOD_RECALL_ENTRY"
          field_name="master_id"
        />
        <main className="space-y-10 p-2">
          {/* --- Section 2: 24-Hour Food Log (7.3) --- */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl font-semibold text-gray-700">
                24-Hour Food Log (7.3)
              </h2>
              <Button
                label="+ Add Meal/Dish"
                severity="info"
                onClick={handleAddFoodEntry}
                disabled={!isEditable}
              />
            </div>

            {foodLog.length === 0 && (
              <p className="text-sm text-gray-500 text-center italic py-4">
                Please add the first meal/dish consumed in the last 24 hours.
              </p>
            )}

            <div className="space-y-6">
              {foodLog.map((entry, index) => (
                <div
                  key={entry.id}
                  className="border-2 border-cyan-100 rounded-lg p-4 bg-cyan-50/50 relative"
                >
                  <h3 className="font-bold text-gray-800 mb-3">
                    Meal/Dish {index + 1}
                  </h3>
                  <button
                    onClick={() => handleRemoveFoodEntry(entry.id)}
                    disabled={!isEditable}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl px-2 py-0 disabled:text-gray-300"
                    title="Remove Dish"
                  >
                    &times;
                  </button>

                  {/* Row 1: Timing and Date/Time */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Timing
                      </label>
                      <IonSelect
                        value={entry.timing}
                        onIonChange={(e) =>
                          handleFoodEntryChange(
                            entry.id,
                            "timing",
                            e.detail.value
                          )
                        }
                        interface="popover"
                        placeholder="Select"
                        disabled={!isEditable}
                      >
                        <IonSelectOption value="Breakfast">
                          Breakfast
                        </IonSelectOption>
                        <IonSelectOption value="Lunch">Lunch</IonSelectOption>
                        <IonSelectOption value="Dinner">Dinner</IonSelectOption>
                        <IonSelectOption value="Snack">Snack</IonSelectOption>
                        <IonSelectOption value="Other">Other</IonSelectOption>
                      </IonSelect>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Date/Time
                      </label>
                      <input
                        type="datetime-local"
                        value={entry.date_time}
                        onChange={(e) =>
                          handleFoodEntryChange(
                            entry.id,
                            "date_time",
                            e.target.value
                          )
                        }
                        disabled={!isEditable}
                        className="w-full p-2 border rounded-md disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                                    {/* Row 2: Diet Context and Festival Name */}
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Type of Diet for this Dish</label>
                                            <IonSelect value={entry.diet_context} disabled={!isEditable}
                                                onIonChange={(e) => {
                                                    handleFoodEntryChange(entry.id, 'diet_context', e.detail.value);
                                                    if (e.detail.value !== 'festival') handleFoodEntryChange(entry.id, 'festival_name', '');
                                                }}
                                                interface="popover" placeholder="Select"
                                            >
                                                <IonSelectOption value="regular">Regular</IonSelectOption>
                                                <IonSelectOption value="fasting">Fasting</IonSelectOption>
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

                  {/* Row 3: Name of Dish and Quantity */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Name of Dish
                      </label>
                      <input
                        type="text"
                        value={entry.name_of_dish}
                        onChange={(e) =>
                          handleFoodEntryChange(
                            entry.id,
                            "name_of_dish",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Dal, Roti"
                        disabled={!isEditable}
                        className="w-full p-2 border rounded-md disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Quantity Consumed
                      </label>
                      <input
                        type="text"
                        value={entry.quantity}
                        onChange={(e) =>
                          handleFoodEntryChange(
                            entry.id,
                            "quantity",
                            e.target.value
                          )
                        }
                        placeholder="e.g., 2 cups"
                        disabled={!isEditable}
                        className="w-full p-2 border rounded-md disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* Ingredient Table Section */}
                  <div className="border border-dashed border-gray-300 p-3 mt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-md font-semibold text-gray-700">
                        Ingredients Detail
                      </h4>
                      <Button
                        label="+ Ingredient"
                        severity="secondary"
                        className="p-button-sm"
                        onClick={() => handleAddIngredient(entry.id)}
                        disabled={!isEditable}
                      />
                    </div>
                    {entry.ingredients.map((ing: any) => (
                      <div
                        key={ing.id}
                        className="grid grid-cols-1 md:grid-cols-4 gap-2 border-t pt-2 mt-2 items-end"
                      >
                        <input
                          type="text"
                          value={ing.name}
                          onChange={(e) =>
                            handleIngredientChange(
                              entry.id,
                              ing.id,
                              "name",
                              e.target.value
                            )
                          }
                          placeholder="Ingredient Name"
                          disabled={!isEditable}
                          className="p-1 border rounded-md col-span-1 disabled:bg-gray-100"
                        />
                        <input
                          type="text"
                          value={ing.quantity}
                          onChange={(e) =>
                            handleIngredientChange(
                              entry.id,
                              ing.id,
                              "quantity",
                              e.target.value
                            )
                          }
                          placeholder="Qty"
                          disabled={!isEditable}
                          className="p-1 border rounded-md col-span-1 disabled:bg-gray-100"
                        />
                        <input
                          type="text"
                          value={ing.prep_method}
                          onChange={(e) =>
                            handleIngredientChange(
                              entry.id,
                              ing.id,
                              "prep_method",
                              e.target.value
                            )
                          }
                          placeholder="Prep Method"
                          disabled={!isEditable}
                          className="p-1 border rounded-md col-span-1 disabled:bg-gray-100"
                        />
                        <Button
                          icon="pi pi-times"
                          severity="danger"
                          className="p-button-sm p-button-text"
                          onClick={() =>
                            handleRemoveIngredient(entry.id, ing.id)
                          }
                          disabled={!isEditable}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- Save and Navigation Buttons --- */}
          <div className="mt-10 flex justify-between gap-2">
            <Button
              label="Save Recalls (7.3)"
              severity="success"
              className="px-10 py-2"
              onClick={handleSave}
              disabled={!isEditable || isLoading}
            />
            <Link
              to={`/food-recall/page2?master_id=${masterId}&user_id=${userId}`}
              onClick={(e) => {
                if (isUnsaved) {
                  e.preventDefault();
                  setAlert({
                    show: true,
                    header: "Unsaved Changes",
                    message:
                      "You have unsaved changes. Please save before navigating away.",
                  });
                }
              }}
            >
              <Button
                label="Back to Habits (Module 1)"
                className="px-5 py-2 rounded"
              />
            </Link>
          </div>
          <div className="pb-[250px]"></div>
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
