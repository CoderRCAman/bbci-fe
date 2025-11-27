import { SQLiteConnection, SQLiteDBConnection } from "@capacitor-community/sqlite";
import { saveToStore } from "../../utils/helper"; // Adjusted path
import shortUUID from "short-uuid";

// ----------------------------------------------------------------
// 1. DATA MODELS & TYPES
// (Defines the shape of your data in React)
// ----------------------------------------------------------------

// --- MODULE 1: HABITS ---
export interface IFoodHabitMaster {
    id: string; // PK
    user_id: string; // FK to patient
    diet_type: string;
    diet_duration: string;
    additives_json: string; // JSON array
    method_shallow_frying: '0' | '1' | '2';
    method_deep_frying: '0' | '1' | '2';
    method_boiling: '0' | '1' | '2';
    method_steaming: '0' | '1' | '2';
    method_sauting: '0' | '1' | '2';
    method_grill_bbq: '0' | '1' | '2';
    family_sharing: number | string;
    meals_per_day: number | string;
    water_supply_json: string; // JSON array
    created_at?: string;
    updated_at?: string;
    tab_id?: string;
    synch_flag?: number;
}

export interface IFoodHabitFat {
    id: string; // PK
    master_id: string; // FK to FOOD_HABITS_MASTER
    name: string;
    usage: string;
    family_consumption: string;
    years_used: string;
}

// --- MODULE 2: RECALL ---
export interface IFoodRecallEntry {
    id: string; // PK
    master_id: string; // FK to FOOD_HABITS_MASTER
    timing: string;
    name_of_dish: string;
    quantity: string;
    date_time: string;
    diet_context: 'regular' | 'fasting' | 'festival';
    festival_name: string;
    created_at?: string;
    updated_at?: string;
    tab_id?: string;
    synch_flag?: number;
    // UI-only state (not in DB table)
    ingredients: IFoodRecallIngredient[];
}

export interface IFoodRecallIngredient {
    id: string; // PK
    entry_id: string; // FK to FOOD_RECALL_ENTRY
    name: string;
    quantity: string;
    prep_method: string;
}

// ----------------------------------------------------------------
// 2. DEFAULT STATE GENERATORS
// (Creates a new, blank record for the UI)
// ----------------------------------------------------------------

// generateDefaultHabitState — change diet_type from 'O' to ''
export const generateDefaultHabitState = (user_id: string, tab_id: string): { master: IFoodHabitMaster, fats: IFoodHabitFat[] } => {
    const translator = shortUUID();
    const masterId = translator.generate();
    const now = new Date().toLocaleString("SV-SE").replace("T", " ");

    return {
        master: {
            id: masterId,
            user_id: user_id,
            diet_type: '', // <-- changed from 'O' to '' so no radio selected by default
            diet_duration: '',
            additives_json: '[]',
            method_shallow_frying: '0',
            method_deep_frying: '0',
            method_boiling: '0',
            method_steaming: '0',
            method_sauting: '0',
            method_grill_bbq: '0',
            family_sharing: '',
            meals_per_day: '',
            water_supply_json: '[]',
            created_at: now,
            updated_at: now,
            tab_id: tab_id,
            synch_flag: 0,
        },
        fats: [] // Starts with no fats
    };
};


// ----------------------------------------------------------------
// 3. DATABASE SAVE/LOAD LOGIC
// (The "Upsert" logic you use in Tab11)
// ----------------------------------------------------------------

/**
 * Replicates the "creator-only" edit lock from Tab11/data.ts
 */
export const checkHabitEditEligibility = async (
    db: SQLiteDBConnection,
    master_id: string,
    current_tab_id: string , 
    table_name = "FOOD_HABITS_MASTER" , 
    field_name = "id"
): Promise<boolean> => {
    try {
        const res = await db.query(`SELECT tab_id FROM ${table_name} WHERE ${field_name} = ?`, [master_id]);
        const record = res?.values?.[0];
        if (!record) {
            return true; 
        }
        if (record.tab_id !== current_tab_id) return false; // Tab ID mismatch
        return true;
    } catch (error) {
        console.error("Error checking edit eligibility:", error);
        return false;
    }
};

/**
 * Saves Module 1: The Food Habits data (Master + Fats)
 * Uses "INSERT ON CONFLICT" (Upsert) just like your Tab11
 */
export const saveHabitData = async (
    db: SQLiteDBConnection,
    sqlite: SQLiteConnection,
    master: IFoodHabitMaster,
    fats: IFoodHabitFat[] , 
    tabId : string
) => {
    try { 
        
        const now = new Date().toLocaleString("SV-SE").replace("T", " ");
        master.updated_at = now;
        master.synch_flag = 2; // Mark as updated

        // --- 1. Save Master Record (Upsert) ---
        const queryM = `
            INSERT INTO FOOD_HABITS_MASTER (
                id, user_id, diet_type, diet_duration, additives_json, 
                method_shallow_frying, method_deep_frying, method_boiling, 
                method_steaming, method_sauting, method_grill_bbq, 
                family_sharing, meals_per_day, water_supply_json, 
                created_at, updated_at, tab_id, synch_flag
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                diet_type = excluded.diet_type,
                diet_duration = excluded.diet_duration,
                additives_json = excluded.additives_json,
                method_shallow_frying = excluded.method_shallow_frying,
                method_deep_frying = excluded.method_deep_frying,
                method_boiling = excluded.method_boiling,
                method_steaming = excluded.method_steaming,
                method_sauting = excluded.method_sauting,
                method_grill_bbq = excluded.method_grill_bbq,
                family_sharing = excluded.family_sharing,
                meals_per_day = excluded.meals_per_day,
                water_supply_json = excluded.water_supply_json,
                updated_at = excluded.updated_at,
                tab_id = excluded.tab_id,
                synch_flag = excluded.synch_flag;
        `;
        await db.run(queryM, [
            master.id, master.user_id, master.diet_type, master.diet_duration, master.additives_json,
            master.method_shallow_frying, master.method_deep_frying, master.method_boiling,
            master.method_steaming, master.method_sauting, master.method_grill_bbq,
            master.family_sharing, master.meals_per_day, master.water_supply_json,
            master.created_at || now, master.updated_at, tabId, master.synch_flag
        ]);

        // --- 2. Save Fat Usage (Section 7.5) ---
        // Delete fats that are no longer in the UI list
        const fatIds = fats.map(f => `'${f.id}'`).join(',');
        const deleteQuery = `DELETE FROM FOOD_HABITS_FAT_USAGE WHERE master_id = ? AND id NOT IN (${fatIds || "''"})`;
        await db.run(deleteQuery, [master.id]);
        
        // Then, "Upsert" all fats currently in the UI
        const queryF = `
            INSERT INTO FOOD_HABITS_FAT_USAGE (
                id, master_id, name, usage, family_consumption, years_used
            ) VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                usage = excluded.usage,
                family_consumption = excluded.family_consumption,
                years_used = excluded.years_used;
        `;
        for (const fat of fats) {
            await db.run(queryF, [fat.id, master.id, fat.name, fat.usage, fat.family_consumption, fat.years_used]);
        }

        await saveToStore(sqlite); // Commit changes
    } catch (error) {
        console.error("Failed to save habit data:", error);
        throw error;
    }
};

/**
 * Saves Module 2: The Food Recall entries (7.3)
 */
export const saveRecallData = async (
    db: SQLiteDBConnection,
    sqlite: SQLiteConnection,
    recalls: IFoodRecallEntry[], // The full list of recalls for this master_id
    master_id: string,
    tab_id: string
) => {
    try {
        const now = new Date().toISOString();
        
        // --- 1. Delete old entries/ingredients not in the current UI state ---
        const recallIds = recalls.map(r => `'${r.id}'`).join(',');
        const ingredientIds: string[] = [];
        recalls.forEach(r => {
            r.ingredients.forEach(i => ingredientIds.push(`'${i.id}'`));
        });
        const ingredientIdList = ingredientIds.join(',') || "''";

        // Delete ingredients no longer associated with these recalls
        const deleteIngredientsQuery = `
            DELETE FROM FOOD_RECALL_INGREDIENT 
            WHERE entry_id IN (SELECT id FROM FOOD_RECALL_ENTRY WHERE master_id = ?) 
            AND id NOT IN (${ingredientIdList});
        `;
        await db.run(deleteIngredientsQuery, [master_id]);

        // Delete recall entries no longer in the list
        const deleteEntriesQuery = `DELETE FROM FOOD_RECALL_ENTRY WHERE master_id = ? AND id NOT IN (${recallIds || "''"});`;
        await db.run(deleteEntriesQuery, [master_id]);

        // --- 2. "Upsert" all current recall entries and their ingredients ---
        const queryE = `
            INSERT INTO FOOD_RECALL_ENTRY (
                id, master_id, timing, name_of_dish, quantity, date_time, 
                diet_context, festival_name, created_at, updated_at, tab_id, synch_flag
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                timing = excluded.timing,
                name_of_dish = excluded.name_of_dish,
                quantity = excluded.quantity,
                date_time = excluded.date_time,
                diet_context = excluded.diet_context,
                festival_name = excluded.festival_name,
                updated_at = excluded.updated_at,
                synch_flag = excluded.synch_flag;
        `;
        
        const queryI = `
            INSERT INTO FOOD_RECALL_INGREDIENT (
                id, entry_id, name, quantity, prep_method
            ) VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                quantity = excluded.quantity,
                prep_method = excluded.prep_method;
        `;

        for (const recall of recalls) {
            recall.updated_at = now;
            recall.synch_flag = 2;
            await db.run(queryE, [
                recall.id, master_id, recall.timing, recall.name_of_dish, recall.quantity, recall.date_time,
                recall.diet_context, recall.festival_name, recall.created_at || now, recall.updated_at, tab_id, recall.synch_flag
            ]);

            for (const ingredient of recall.ingredients) {
                if (!ingredient.id) ingredient.id = shortUUID.generate();
                await db.run(queryI, [ingredient.id, recall.id, ingredient.name, ingredient.quantity, ingredient.prep_method]);
            }
        }

        await saveToStore(sqlite); // Commit changes
    } catch (error) {
        console.error("Failed to save recall data:", error);
        throw error;
    }
};

// ----------------------------------------------------------------
// 4. DATABASE LOAD LOGIC
// (Fetches data from DB to populate the UI)
// ----------------------------------------------------------------

/**
 * Loads all data for Module 1 (Habits)
 */
export const loadHabitData = async (db: SQLiteDBConnection, user_id: string, master_id: string | null): Promise<{ master: IFoodHabitMaster, fats: IFoodHabitFat[] } | null> => {
    if (!user_id && !master_id) return null;

    let queryM: string;
    let queryParams: string[] = [];

    if (master_id) {
        queryM = `SELECT * FROM FOOD_HABITS_MASTER WHERE id = ?`;
        queryParams = [master_id];
    } else {
        // When creating new, check if a record *already* exists for this user.
        queryM = `SELECT * FROM FOOD_HABITS_MASTER WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1`;
        queryParams = [user_id];
    }

    try {
        const resM = await db.query(queryM, queryParams);
        const master = resM?.values?.[0] as IFoodHabitMaster;

        if (!master) return null; // No existing record found

        const queryF = `SELECT * FROM FOOD_HABITS_FAT_USAGE WHERE master_id = ?`;
        const resF = await db.query(queryF, [master.id]);
        const fats = resF?.values as IFoodHabitFat[];

        return { master, fats };
    } catch (e) {
        console.error("Error loading habit data:", e);
        return null;
    }
};

/**
 * Loads all data for Module 2 (Recalls)
 */
export const loadRecallData = async (db: SQLiteDBConnection, master_id: string): Promise<IFoodRecallEntry[]> => {
    try {
        const recalls: IFoodRecallEntry[] = [];
        const queryE = `SELECT * FROM FOOD_RECALL_ENTRY WHERE master_id = ?`;
        const resE = await db.query(queryE, [master_id]);
        
        if (!resE.values) return [];

        for (const entry of resE.values as IFoodRecallEntry[]) {
            const queryI = `SELECT * FROM FOOD_RECALL_INGREDIENT WHERE entry_id = ?`;
            const resI = await db.query(queryI, [entry.id]);
            
            // This is the hydration step
            entry.ingredients = resI.values || [];
            recalls.push(entry);
        }
        return recalls;
    } catch (e) {
        console.error("Error loading recall data:", e);
        return [];
    }
};

// ----------------------------------------------------------------
// 5. SECTION COMPLETENESS HELPERS
// (Used by the Stepper to determine if a section is "complete")
// ----------------------------------------------------------------

/**
 * Basic completion checks for the Habit sections.
 * Tune rules as needed.
 */
export const isDietaryComplete = (master: IFoodHabitMaster | null): boolean => {
    if (!master) return false;
    // diet_type must be present, and diet_duration should not be empty (simple rule)
    return !!master.diet_type && (master.diet_duration?.toString().trim().length ?? 0) > 0;
};

export const isCookingComplete = (master: IFoodHabitMaster | null, fats: IFoodHabitFat[] | null): boolean => {
    if (!master) return false;
    // At least one prep method should be non-zero OR at least one fat should be present with a name
    const methodValues = [
        master.method_shallow_frying,
        master.method_deep_frying,
        master.method_boiling,
        master.method_steaming,
        master.method_sauting,
        master.method_grill_bbq,
    ];
    const hasMethod = methodValues.some(v => v && v !== '0');
    const hasFat = (fats || []).some(f => f.name && f.name.trim().length > 0);
    return hasMethod || hasFat;
};

export const isHouseholdComplete = (master: IFoodHabitMaster | null): boolean => {
    if (!master) return false;
    const familySharingOK = master.family_sharing !== undefined && master.family_sharing !== null && master.family_sharing.toString().trim() !== '';
    const mealsOK = master.meals_per_day !== undefined && master.meals_per_day !== null && master.meals_per_day.toString().trim() !== '';
    const water = JSON.parse(master.water_supply_json || '[]');
    const waterOK = Array.isArray(water) && water.length > 0;
    return familySharingOK && mealsOK && waterOK;
};

// add to data.ts near other exports
export const fetchPatientAgeOrCompute = async (db: SQLiteDBConnection, userId: string): Promise<number | null> => {
  if (!db || !userId) return null;
  try {
    // try age numeric column first
    const tryAge = await db.query(`SELECT age FROM patients WHERE id = ?`, [userId]);
    if (tryAge?.values && tryAge.values[0] && tryAge.values[0].age !== undefined && tryAge.values[0].age !== null) {
      const a = Number(tryAge.values[0].age);
      if (!isNaN(a)) return Math.floor(a);
    }

    // fallback: try DOB and compute
    const tryDob = await db.query(`SELECT dob FROM patients WHERE id = ?`, [userId]);
    if (tryDob?.values && tryDob.values[0] && tryDob.values[0].dob) {
      const dobRaw = tryDob.values[0].dob;
      const d = new Date(dobRaw);
      if (!isNaN(d.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - d.getFullYear();
        const m = today.getMonth() - d.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
        return age;
      }
    }
  } catch (err) {
    console.warn("fetchPatientAgeOrCompute failed", err);
  }
  return null;
};


