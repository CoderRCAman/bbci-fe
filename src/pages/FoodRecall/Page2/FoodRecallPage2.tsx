import { useEffect, useState } from "react";
import { useLocation } from "react-router";
// import { useSQLite } from "../../../utils/Sqlite"; // Omitted
import { IonAlert, IonContent, IonPage, IonSelect, IonSelectOption } from "@ionic/react";
import Header from "../../../components/Header";
import ShowRegisteredTab from "../../../components/ShowRegisteredTab";
import { Link } from "react-router-dom";
import { Button } from "primereact/button";

// Replicating your CustomRadio for simplicity and consistency
const CustomRadio = ({ id, name, value, checked, onChange, label, }: { id: string; name: string; value: any; checked: boolean; onChange: any; label: string; label: string; }) => (
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

// --- TYPE DEFINITIONS for 7.3 (Food Log) ---
interface Ingredient {
    ingrdient_id: number;
    name: string;
    quantity: string;
    prepMethod: string;
}

interface FoodEntry {
    ID: number;
    diet: string; // V/N/O
    timing: string; // Breakfast, Lunch, Snack, etc.
    nameOfDish: string;
    quantity: string;
    dateTime: string; // Date and Time of consumption
    ingredients: Ingredient[];

    // --- NEW FIELDS ---
    dietContext: 'regular' | 'fasting' | 'festival'; // Added context field
    festivalName: string; // Added conditional text field
}
// --- NEW TYPE DEFINITION for 7.5 (Fat/Oil Log) ---
interface FatEntry {
    id: number;
    name: string;
    usage: string; // yes/no/dont know/refused
    familyConsumption: string; // lt/kg
    yearsUsed: string;
}
// ---------------------------------

// --- CONSTANTS for 7.6 Preparation Methods ---
const PREP_METHODS = ["Shallow Frying", "Deep Frying", "Boiling", "Steaming", "Sauting", "Grill/Barbeque"] as const;
type PrepMethodKey = typeof PREP_METHODS[number];
type PrepFrequencyValue = '0' | '1' | '2'; // 0: Never, 1: Rarely, 2: Most of the time
type PrepFrequencyState = Record<PrepMethodKey, PrepFrequencyValue>;

const initialPrepMethods: PrepFrequencyState = Object.fromEntries(
    PREP_METHODS.map(method => [method, '0' as PrepFrequencyValue])
) as PrepFrequencyState;
// ---------------------------------

export default function FoodRecallSurveyPage() {
    // --- Initial Setup/Routing State ---
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const [participantId, setParticipantId] = useState(searchParams.get("id") || "");
    const [recallRecordId, setRecallRecordId] = useState("FRD" + Date.now()); // Mock ID
    const [alert, setAlert] = useState({ show: false, header: "", message: "" });
    // const editFlag = searchParams.get("edit") === "yes"; // unused

    // --- State for 7.1 & 7.2 (Dietary Profile) ---
    const [dietType, setDietType] = useState("O");
    const [dietDuration, setDietDuration] = useState("");
    // --- Add this block to the 'State for 7.1 & 7.2 (Dietary Profile)' section ---
    const [dietTypeContext, setDietTypeContext] = useState("regular"); // 'regular', 'fasting', 'festival'
    const [festivalName, setFestivalName] = useState("");
    // --- State for 7.3 (24 Hour Recall) ---
    const [foodLog, setFoodLog] = useState<FoodEntry[]>([]);

    // --- State for 7.4, 7.5 (Fats & Additives) ---
    const [additives, setAdditives] = useState<string[]>([]);
    const [fatLog, setFatLog] = useState<FatEntry[]>([]); // New state for 7.5

    // --- State for 7.6, 7.7, 7.8, 7.9 (Habits) ---
    // UPDATED: Replaced single `prepMethod` string with mapping object for 7.6 frequency
    const [prepFrequency, setPrepFrequency] = useState<PrepFrequencyState>(initialPrepMethods); 
    const [familySharing, setFamilySharing] = useState(""); 
    const [mealsPerDay, setMealsPerDay] = useState(""); 
    const [waterSupply, setWaterSupply] = useState<string[]>([]); 
    // useEffect for initialization/loading data...
    useEffect(() => { /* ... */ }, [participantId]);


    // --- 7.3 Dynamic Log Functions (FoodEntry/Dish and Ingredients) ---
    // (Existing functions for 7.3 omitted for brevity but remain the same)
    // Updated handleAddFoodEntry function
    const handleAddFoodEntry = () => {
        const newEntry: FoodEntry = {
            ID: Date.now(),
            diet: dietType, // Inherit overall diet type
            timing: "Breakfast",
            nameOfDish: "",
            quantity: "",
            dateTime: new Date().toISOString().substring(0, 16),
            ingredients: [],
            // --- NEW DEFAULTS ---
            dietContext: 'regular', // Default to regular
            festivalName: '',
        };
        setFoodLog([...foodLog, newEntry]);
    };
    const handleRemoveFoodEntry = (id: number) => { setFoodLog(foodLog.filter((entry) => entry.ID !== id)); };
    const handleFoodEntryChange = (id: number, field: keyof FoodEntry, value: any) => { setFoodLog(foodLog.map((entry) => entry.ID === id ? { ...entry, [field]: value } : entry)); };
    const handleAddIngredient = (foodId: number) => { setFoodLog(foodLog.map((food) => { if (food.ID === foodId) { const newIng: Ingredient = { ingrdient_id: Date.now() + Math.random(), name: "", quantity: "", prepMethod: "" }; return { ...food, ingredients: [...food.ingredients, newIng] }; } return food; })); };
    const handleIngredientChange = (foodId: number, ingId: number, field: keyof Ingredient, value: any) => { setFoodLog(foodLog.map((food) => { if (food.ID === foodId) { return { ...food, ingredients: food.ingredients.map((ing) => ing.ingrdient_id === ingId ? { ...ing, [field]: value } : ing), }; } return food; })); };
    const handleRemoveIngredient = (foodId: number, ingId: number) => { setFoodLog(foodLog.map((food) => { if (food.ID === foodId) { return { ...food, ingredients: food.ingredients.filter((ing) => ing.ingrdient_id !== ingId), }; } return food; })); };


    // --- NEW 7.5 Dynamic Log Functions (Fat/Oil) ---
    const handleAddFatEntry = () => {
        const newFat: FatEntry = {
            id: Date.now(),
            name: "",
            usage: "yes", // Default
            familyConsumption: "",
            yearsUsed: "",
        };
        setFatLog([...fatLog, newFat]);
    };

    const handleRemoveFatEntry = (id: number) => {
        setFatLog(fatLog.filter((fat) => fat.id !== id));
    };

    const handleFatEntryChange = (id: number, field: keyof FatEntry, value: any) => {
        setFatLog(
            fatLog.map((fat) =>
                fat.id === id ? { ...fat, [field]: value } : fat
            )
        );
    };

    // --- NEW 7.6 Frequency Handler ---
    const handlePrepFrequencyChange = (method: PrepMethodKey, frequency: PrepFrequencyValue) => {
        setPrepFrequency(prev => ({
            ...prev,
            [method]: frequency,
        }));
    };

    const handleSave = () => {
        console.log("Saving 24 Hour Food Recall Data...");
        // Logic to structure and save all state variables (foodLog, fatLog, habits, etc.)
        setAlert({ show: true, header: "Saved", message: "24-Hour Recall Data Saved." });
    };

    return (
        <IonPage>
            <Header title={"24-Hour Food Recall Survey"} />
            <IonContent className="ion-padding" fullscreen>
                <ShowRegisteredTab id={recallRecordId} table_name="FOOD_RECALL_SURVEY" />

                <main className="space-y-10 p-2">

                    {/* --- Section 1: Dietary Profile (7.1 & 7.2) --- */}
                    <div className="bg-white p-6 rounded-lg shadow border">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                            1. Dietary Profile
                        </h2>

                        {/* 7.1 Veg/Non-Veg */}
                        <fieldset className="border border-gray-200 p-4 rounded-md mb-4">
                            <legend className="text-sm font-semibold text-gray-600 px-2">
                                7.1 Are you Vegetarian or Non-Veg?
                            </legend>
                            <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
                                <CustomRadio id="d_veg" name="dietType" value="V" onChange={(e: any) => setDietType(e.target.value)} checked={dietType === "V"} label="Vegetarian (1)" />
                                <CustomRadio id="d_nonveg" name="dietType" value="N" onChange={(e: any) => setDietType(e.target.value)} checked={dietType === "N"} label="Non-Veg (2)" />
                                <CustomRadio id="d_other" name="dietType" value="O" onChange={(e: any) => setDietType(e.target.value)} checked={dietType === "O"} label="Other/Mixed (0)" />
                            </div>
                        </fieldset>

                        {/* 7.2 Diet Duration */}
                        <div className="mt-4">
                            <label htmlFor="diet_duration" className="block text-gray-600 font-semibold mb-2 text-sm">
                                7.2 How long have you been following this type of diet? (Years/Months)
                            </label>
                            <input
                                type="text"
                                id="diet_duration"
                                value={dietDuration}
                                onChange={(e) => setDietDuration(e.target.value)}
                                placeholder="e.g., 5 years or 6 months"
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-cyan-500 transition"
                            />
                        </div>

                    </div>

                    {/* --- Section 2: 24-Hour Recall Log (7.3) --- */}
                    {/* --- Section 2: 24-Hour Food Log (7.3) --- */}
                    <div className="bg-white p-6 rounded-lg shadow border">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                            2. 24-Hour Food Log (7.3)
                        </h2>

                        <div className="flex justify-end mb-4">
                            <Button label="+ Add Meal/Dish" severity="info" onClick={handleAddFoodEntry} />
                        </div>

                        {foodLog.length === 0 && (
                            <p className="text-sm text-gray-500 text-center italic py-4">
                                Please add the first meal/dish consumed in the last 24 hours.
                            </p>
                        )}

                        <div className="space-y-6">
                            {foodLog.map((entry, index) => (
                                <div key={entry.ID} className="border-2 border-cyan-100 rounded-lg p-4 bg-cyan-50/50 relative">
                                    <h3 className="font-bold text-gray-800 mb-3">Meal/Dish {index + 1}</h3>
                                    <button
                                        onClick={() => handleRemoveFoodEntry(entry.ID)}
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl px-2 py-0"
                                        title="Remove Dish"
                                    >
                                        &times;
                                    </button>

                                    {/* Row 1: Timing and Date/Time (Food Master Table Fields) */}
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Timing</label>
                                            <IonSelect value={entry.timing} onIonChange={(e) => handleFoodEntryChange(entry.ID, 'timing', e.detail.value)} interface="popover">
                                                <IonSelectOption value="Breakfast">Breakfast</IonSelectOption>
                                                <IonSelectOption value="Lunch">Lunch</IonSelectOption>
                                                <IonSelectOption value="Dinner">Dinner</IonSelectOption>
                                                <IonSelectOption value="Snack">Snack</IonSelectOption>
                                                <IonSelectOption value="Other">Other</IonSelectOption>
                                            </IonSelect>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Date/Time</label>
                                            <input type="datetime-local" value={entry.dateTime} onChange={(e) => handleFoodEntryChange(entry.ID, 'dateTime', e.target.value)} className="w-full p-2 border rounded-md" />
                                        </div>
                                    </div>

                                    {/* Row 2: NEW Diet Context and Festival Name */}
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Type of Diet for this Dish</label>
                                            <IonSelect
                                                value={entry.dietContext}
                                                onIonChange={(e) => {
                                                    handleFoodEntryChange(entry.ID, 'dietContext', e.detail.value);
                                                    // Clear festival name if switching away from 'festival'
                                                    if (e.detail.value !== 'festival') {
                                                        handleFoodEntryChange(entry.ID, 'festivalName', '');
                                                    }
                                                }}
                                                interface="popover"
                                            >
                                                <IonSelectOption value="regular">Regular</IonSelectOption>
                                                <IonSelectOption value="fasting">Fasting</IonSelectOption>
                                                <IonSelectOption value="festival">Festival</IonSelectOption>
                                            </IonSelect>
                                        </div>

                                        {/* Conditional Festival Name Input */}
                                        {entry.dietContext === 'festival' ? (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Festival Name</label>
                                                <input
                                                    type="text"
                                                    value={entry.festivalName}
                                                    onChange={(e) => handleFoodEntryChange(entry.ID, 'festivalName', e.target.value)}
                                                    placeholder="Name of Festival"
                                                    className="w-full p-2 border rounded-md"
                                                />
                                            </div>
                                        ) : (
                                            // Placeholder to maintain grid layout consistency
                                            <div className="h-full"></div>
                                        )}
                                    </div>

                                    {/* Row 3: Name of Dish and Quantity Consumed */}
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Name of Dish</label>
                                            <input type="text" value={entry.nameOfDish} onChange={(e) => handleFoodEntryChange(entry.ID, 'nameOfDish', e.target.value)} placeholder="e.g., Dal, Roti, Chicken Curry" className="w-full p-2 border rounded-md" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Quantity Consumed</label>
                                            <input type="text" value={entry.quantity} onChange={(e) => handleFoodEntryChange(entry.ID, 'quantity', e.target.value)} placeholder="e.g., 2 cups, 3 rotis" className="w-full p-2 border rounded-md" />
                                        </div>
                                    </div>

                                    {/* Ingredient Table Section */}
                                    <div className="border border-dashed border-gray-300 p-3 mt-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-md font-semibold text-gray-700">Ingredients Detail (7.3)</h4>
                                            <Button label="+ Ingredient" severity="secondary" className="p-button-sm" onClick={() => handleAddIngredient(entry.ID)} />
                                        </div>

                                        {entry.ingredients.length === 0 && (
                                            <p className="text-xs text-gray-500 text-center italic">
                                                Add ingredients used in this dish.
                                            </p>
                                        )}

                                        {entry.ingredients.map((ing, ingIndex) => (
                                            <div key={ing.ingrdient_id} className="grid grid-cols-1 md:grid-cols-4 gap-2 border-t pt-2 mt-2 items-end">
                                                <input type="text" value={ing.name} onChange={(e) => handleIngredientChange(entry.ID, ing.ingrdient_id, 'name', e.target.value)} placeholder="Ingredient Name" className="p-1 border rounded-md col-span-1" />
                                                <input type="text" value={ing.quantity} onChange={(e) => handleIngredientChange(entry.ID, ing.ingrdient_id, 'quantity', e.target.value)} placeholder="Qty" className="p-1 border rounded-md col-span-1" />
                                                <input type="text" value={ing.prepMethod} onChange={(e) => handleIngredientChange(entry.ID, ing.ingrdient_id, 'prepMethod', e.target.value)} placeholder="Prep Method" className="p-1 border rounded-md col-span-1" />
                                                <Button icon="pi pi-times" severity="danger" className="p-button-sm p-button-text" onClick={() => handleRemoveIngredient(entry.ID, ing.ingrdient_id)} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- Section 3: Cooking Habits (7.4, 7.5, 7.6) --- */}
                    <div className="bg-white p-6 rounded-lg shadow border">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                            3. Cooking Habits
                        </h2>

                        {/* 7.4 Additives */}
                        <fieldset className="border border-gray-200 p-4 rounded-md mb-4">
                            <legend className="text-sm font-semibold text-gray-600 px-2">
                                7.4 Do you add following to cooked food? (Multiple Select)
                            </legend>
                            <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
                                {["Salt", "Sugar", "Jaggery", "Ghee", "Raw Chilli with Salt", "None"].map(item => (
                                    <div key={item} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`add-${item}`}
                                            checked={additives.includes(item)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setAdditives([...additives, item]);
                                                } else {
                                                    setAdditives(additives.filter(a => a !== item));
                                                }
                                            }}
                                            className="w-4 h-4"
                                        />
                                        <label htmlFor={`add-${item}`} className="ml-2 text-sm font-medium text-gray-700">{item}</label>
                                    </div>
                                ))}
                            </div>
                        </fieldset>

                        {/* 7.5 Fats Used - DYNAMIC INLINE LOG */}
                        <div className="mt-6 border border-gray-200 p-4 rounded-md">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-semibold text-gray-600">
                                    7.5 Which of the following you cook your food with? (Fats/Oils)
                                </h3>
                                <Button label="+ Add Fat/Oil" severity="info" className="py-2" onClick={handleAddFatEntry} />
                            </div>

                            {fatLog.length === 0 && (
                                <p className="text-xs text-gray-500 text-center italic py-2">
                                    No fats/oils added. Click '+ Add Fat/Oil' to record details.
                                </p>
                            )}

                            <div className="space-y-4">
                                {fatLog.map((fat, index) => (
                                    <div key={fat.id} className="border border-dashed border-gray-300 rounded-md p-3 bg-white relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-md font-semibold text-gray-800">Fat/Oil {index + 1}</h4>
                                            <button
                                                onClick={() => handleRemoveFatEntry(fat.id)}
                                                className="text-red-500 hover:text-red-700 font-bold text-xl px-2 py-0"
                                                title="Remove Fat/Oil"
                                            >
                                                &times;
                                            </button>
                                        </div>

                                        <input
                                            type="text"
                                            value={fat.name}
                                            onChange={(e) => handleFatEntryChange(fat.id, 'name', e.target.value)}
                                            placeholder="Type of Fat/Oil (e.g., Mustard Oil, Ghee)"
                                            className="w-full p-2 border rounded-md mb-3"
                                        />

                                        <div className="grid grid-cols-3 gap-3 items-center">
                                            {/* Usage */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Used?</label>
                                                <IonSelect value={fat.usage} onIonChange={(e) => handleFatEntryChange(fat.id, 'usage', e.detail.value)} interface="popover" placeholder="Select">
                                                    <IonSelectOption value="yes">Yes</IonSelectOption>
                                                    <IonSelectOption value="no">No</IonSelectOption>
                                                    <IonSelectOption value="dont know">Don't Know</IonSelectOption>
                                                    <IonSelectOption value="refused">Refused</IonSelectOption>
                                                </IonSelect>
                                            </div>

                                            {/* Consumption */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Consumption (Lt/Kg/M)</label>
                                                <input
                                                    type="text"
                                                    value={fat.familyConsumption}
                                                    onChange={(e) => handleFatEntryChange(fat.id, 'familyConsumption', e.target.value)}
                                                    placeholder="e.g., 2 Liters/Month"
                                                    className="w-full p-2 border rounded-md"
                                                />
                                            </div>

                                            {/* Years Used */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Years Used</label>
                                                <input
                                                    type="text"
                                                    value={fat.yearsUsed}
                                                    onChange={(e) => handleFatEntryChange(fat.id, 'yearsUsed', e.target.value)}
                                                    placeholder="e.g., 10 years"
                                                    className="w-full p-2 border rounded-md"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>


{/* 7.6 Preparation Method Frequency (UPDATED TO MATRIX) */}
                        <div className="mt-6 border border-gray-200 p-4 rounded-md">
                            <h3 className="text-sm font-semibold text-gray-600 mb-4">
                                7.6 How often do you prepare food using these methods?
                            </h3>
                            
                            {/* Header Row */}
                            <div className="grid grid-cols-4 text-xs font-bold text-gray-600 border-b pb-2 mb-2">
                                <div className="col-span-1">Method</div>
                                <div className="text-center">Never (0)</div>
                                <div className="text-center">Rarely (1)</div>
                                <div className="text-center">Most Time (2)</div>
                            </div>

                            {/* Data Rows */}
                            {PREP_METHODS.map((method) => (
                                <div key={method} className="grid grid-cols-4 items-center py-2 border-b border-gray-100 last:border-b-0">
                                    <div className="col-span-1 text-sm font-medium text-gray-800">{method}</div>
                                    
                                    {/* Radio Buttons for Frequency */}
                                    {['0', '1', '2'].map((frequency) => (
                                        <div key={`${method}-${frequency}`} className="flex justify-center">
                                            <input
                                                type="radio"
                                                id={`prep-${method}-${frequency}`}
                                                name={`prepMethod-${method}`}
                                                value={frequency as PrepFrequencyValue}
                                                checked={prepFrequency[method] === frequency}
                                                onChange={(e) => handlePrepFrequencyChange(method, e.target.value as PrepFrequencyValue)}
                                                className="w-4 h-4 text-cyan-600 border-gray-300 focus:ring-cyan-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                    </div>

                    {/* --- Section 4: Household Habits (7.7, 7.8, 7.9) --- */}
                    <div className="bg-white p-6 rounded-lg shadow border">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                            4. Household Habits
                        </h2>

                        {/* 7.7 Family Sharing */}
                        <div className="mb-4">
                            <label htmlFor="family_sharing" className="block text-gray-600 font-semibold mb-2 text-sm">
                                7.7 How many family members usually share each meal?
                            </label>
                            <input
                                type="number"
                                id="family_sharing"
                                value={familySharing}
                                onChange={(e) => setFamilySharing(e.target.value)}
                                placeholder="Enter number"
                                className="w-full p-2 border rounded-md focus:outline-none focus:ring-cyan-500 transition"
                            />
                        </div>

                        {/* 7.8 Meals Per Day */}
                        <div className="mb-4">
                            <label htmlFor="meals_per_day" className="block text-gray-600 font-semibold mb-2 text-sm">
                                7.8 How many times do you eat daily (including breakfast/snacks)?
                            </label>
                            <input
                                type="number"
                                id="meals_per_day"
                                value={mealsPerDay}
                                onChange={(e) => setMealsPerDay(e.target.value)}
                                placeholder="Enter number"
                                className="w-full p-2 border rounded-md focus:outline-none focus:ring-cyan-500 transition"
                            />
                        </div>

                        {/* 7.9 Water Supply (Multiple Select) */}
                        <div className="mb-4">
                            <label htmlFor="water_supply" className="block text-gray-600 font-semibold mb-2 text-sm">
                                7.9 Water supply (Multiple Select)
                            </label>
                            <IonSelect
                                value={waterSupply}
                                multiple={true}
                                onIonChange={(e) => setWaterSupply(e.detail.value)}
                                placeholder="Select all that apply"
                                className="p-2 border rounded-md"
                            >
                                {["River", "Govt Municipal", "Tube", "Water Well", "Pond", "Other"].map(source => (
                                    <IonSelectOption key={source} value={source}>{source}</IonSelectOption>
                                ))}
                            </IonSelect>
                        </div>
                    </div>

                    {/* --- Save and Navigation Buttons --- */}
                    <div className="mt-10 flex justify-between gap-2">
                        <div>
                            <Button label="Save & Continue" severity="success" className="px-10 py-2" onClick={handleSave} />
                        </div>
                        <Link to={`/participant/details?id=${participantId}`}>
                            <Button label="BACK TO PARTICIPANT" className="px-5 py-2 rounded" />
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
    );
    <>
        <IonPage>
            <Header title={"Collect Food Recalls"} />
            <IonContent class='' fullscreen>

            </IonContent>
        </IonPage>
    </>

}