import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  PropsWithChildren,
} from "react";
import { Capacitor } from "@capacitor/core";
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
  capSQLiteSet,
  DBSQLiteValues,
} from "@capacitor-community/sqlite";

// Import the JeepSqlite component for the web platform
import { JeepSqlite } from "jeep-sqlite/dist/components/jeep-sqlite";
import { useLocation } from "react-router";
import {
  trackTable,
  trackTableDeleteTriggers,
  trackTableInsertTriggers,
  trackTableUpdateTriggers,
} from "./query";

// Define the shape of a patient

// Define the shape of the context value
interface SQLiteContextValue {
  db: SQLiteDBConnection | null;
  isLoading: boolean;
  error: Error | null;
  sqlite: SQLiteConnection | null;
  baseUrl: string | null;
  conflictedList: any[];
  setConflictedList: React.Dispatch<React.SetStateAction<any[]>>;
  setBaseUrl: React.Dispatch<React.SetStateAction<string | null>>;
  tabId: string;
  setTabId: React.Dispatch<React.SetStateAction<string>>;
}
0;
// Create the context with a default value
const SQLiteContext = createContext<SQLiteContextValue>({
  db: null,
  isLoading: true,
  error: null,
  sqlite: null,
  baseUrl: null,
  conflictedList: [],
  setBaseUrl: () => { },
  setConflictedList: () => { },
  tabId: "",
  setTabId: () => { },
});

// Create a custom hook to use the context
export const useSQLite = () => {
  return useContext(SQLiteContext);
};

// The provider component that initializes and manages the database connection
export const SQLiteProvider: React.FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  const [db, setDb] = useState<SQLiteDBConnection | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const sqlite = new SQLiteConnection(CapacitorSQLite);
  const [baseUrl, setBaseUrl] = useState<string | null>(
    "http://localhost:11142"
  );
  const [ConflictedList, setConflictedList] = useState<any[]>([]);
  const [tabId, setTabId] = useState<string>("t");
  useEffect(() => {
    if (!db) return;
    async function fetchTabletData() {
      try {
        const res = await db?.query("select * from tablet_data where id = 1");
        const tabId = res?.values?.[0]?.tab_id || "";
        setTabId(tabId);
      } catch (error) {
        console.log(error);
      }
    }
    fetchTabletData();
  }, [db]);
  useEffect(() => {
    const initDb = async () => {
      try {
        const platform = Capacitor.getPlatform();

        if (platform === "web") {
          // Create the 'jeep-sqlite' Stencil component for the web platform
          customElements.define("jeep-sqlite", JeepSqlite);
          const jeepSqliteEl = document.createElement("jeep-sqlite");
          document.body.appendChild(jeepSqliteEl);
          await customElements.whenDefined("jeep-sqlite");

          // Initialize the Web store
          await sqlite.initWebStore();
        }

        // Check if a connection already exists
        const dbName = "patientdb";
        const isCon = await sqlite.isConnection(dbName, false);
        let newDb: SQLiteDBConnection;

        if (isCon.result) {
          newDb = await sqlite.retrieveConnection(dbName, false);
        } else {
          newDb = await sqlite.createConnection(
            dbName,
            false,
            "no-encryption",
            1,
            false
          );
        }

        await newDb.open();

        // Create the patients table if it doesn't exist
        const query = `
                    CREATE TABLE IF NOT EXISTS patients (
                        id TEXT PRIMARY KEY NOT NULL ,
                        i_name TEXT  , 
                        i_emp_code TEXT ,
                        name TEXT , 
                        dob TEXT,
                        age INTEGER,
                        gender TEXT,
                        lat INTEGER,
                        long INTEGER,
                        date TEXT,
                        time TEXT , 
                        created_at TEXT ,
                        updated_at TEXT ,
                        updated_by TEXT DEFAULT 'UNKNOWN',
                        tab_id TEXT ,
                        signature TEXT ,
                        card_type TEXT,
                        card_no TEXT
                    );
                `;
        const query2 = `
                    CREATE TABLE IF NOT EXISTS residential_history (
                        id TEXT PRIMARY KEY  NOT NULL , 
                        user_id TEXT NOT NULL , 
                        from_age INTEGER , 
                        to_age INTEGER , 
                        city TEXT , 
                        village TEXT , 
                        state TEXT , 
                        code INTEGER , 
                        tab_id TEXT ,
                        created_at TEXT
                    );
                `;
        const query3 = `
                    CREATE TABLE IF NOT EXISTS personal_medical_history (
                        id TEXT PRIMARY KEY NOT NULL ,
                        diagnoss TEXT  , 
                        diagnosed INTEGER ,  
                        age_first_diagnosis INTEGER ,
                        year_of_first_diagnosis TEXT ,
                        treatment_received INTEGER ,
                        mode_of_treatment TEXT ,
                        mode_of_diagnosis TEXT ,
                        mode_of_diagnosis_other TEXT ,
                        user_id TEXT,
                        tab_id TEXT,
                        created_at TEXT
                    );
                `;
        const query4 = `
              CREATE TABLE IF NOT EXISTS TOBACCO_ALCOHOL_CONSUMPTION (
              id TEXT PRIMARY KEY,
              user_id TEXT,
              type TEXT,
              product TEXT,
              consumes INTEGER,
              from_age INTEGER,
              to_age INTEGER,
              number_per_day INTEGER,
              days_in_week INTEGER,
              days_in_month INTEGER,
              duration_placement_hr INTEGER,
              duration_placement_min INTEGER,
              site_of_placement_L INTEGER,
              site_of_placement_R INTEGER,
              site_of_placement_F INTEGER,
              site_of_placement_NA INTEGER,
              without_tobacco INTEGER,
              consumption_unit_per_day INTEGER,
              is_other_product INTEGER,
              tab_id TEXT ,
              master_id TEXT ,
              created_at TEXT
             );
        `;
        const query5 = `
            CREATE TABLE IF NOT EXISTS ENDOSCOPY (
            id TEXT PRIMARY KEY, 
            vial_code TEXT ,
            endoscopy_video_filename TEXT , 
            endoscopy_pdf_filename TEXT,
            user_id TEXT ,
            date TEXT,
            tab_id TEXT ,
            created_at TEXT ,
            biopsy_collection_date TEXT 
            );
        `;
        const query6 = `
          CREATE TABLE IF NOT EXISTS blood_sample (
            id TEXT PRIMARY KEY , 
            user_id TEXT , 
            date_collected TEXT , 
            time_collected TEXT , 
            last_meal_date TEXT , 
            last_meal_time TEXT , 
            received_blood_last_6_months INTEGER , 
            sample_classification TEXT , 
            is_sample_collected INTEGER,
            tab_id TEXT ,
            created_at TEXT
          )
        `;
        const query7 = `
          CREATE TABLE IF NOT EXISTS blood_tube_collection (
            id TEXT PRIMARY KEY , 
            blood_collection_tube TEXT , 
            blood_collection_tube_other , 
            identification_code_tube , 
            volume INTEGER , 
            characteristic TEXT , 
            blood_sample_id TEXT,
            tab_id TEXT ,
            user_id TEXT,
            created_at TEXT
          )
        `;
        const query8 = `
          CREATE TABLE IF NOT EXISTS gtgh_blood_report (
            id TEXT PRIMARY KEY ,
            test_name TEXT , 
            result REAL , 
            unit TEXT , 
            sampleId TEXT ,
            test_type TEXT ,
            sample_id TEXT,
            tab_id TEXT ,
            user_id TEXT ,
            created_at TEXT
      )
          `;
        const query9 = `
            CREATE TABLE IF NOT EXISTS tablet_data (
              id INTEGER PRIMARY KEY ,
              tab_id TEXT
            );
        `;
        const query10 = `
            CREATE TABLE IF NOT EXISTS anthropometry (
              id TEXT PRIMARY KEY NOT NULL ,
              user_id TEXT ,
              date TEXT ,
              height REAL ,
              weight REAL ,
              tab_id TEXT ,
              created_at TEXT
            );          
        `;

        const query11 = `
            CREATE TABLE IF NOT EXISTS indoor_air_pollution (
              id TEXT PRIMARY KEY NOT NULL,
              from_age INTEGER,
              to_age INTEGER,
              hours INTEGER,
              minutes INTEGER,
              ventilation INTEGER,
              most_common_cooking_fuel INTEGER,
              smokiness INTEGER,
              most_cooking INTEGER,
              user_id TEXT,
              tab_id TEXT ,
              created_at TEXTF
            );
          `;

        const query12 = `
             CREATE TABLE IF NOT EXISTS TOBACCO_ALCOHOL_CONSUMPTION_MASTER (
                id TEXT PRIMARY KEY , 
                type TEXT , 
                user_id TEXT ,
                consumed INTEGER , 
                tab_id TEXT ,
                created_at TEXT
             );
          `;

        const query13 = `
             CREATE TABLE IF NOT EXISTS demographic_info (
               id TEXT PRIMARY KEY ,
               user_id TEXT,
               religion TEXT,
               marital_status TEXT,
               highest_education TEXT,
               highest_education_spouse TEXT,
               household_income TEXT,
               mother_tongue TEXT,
               place_of_birth TEXT,
               tab_id TEXT ,
               created_at TEXT
             );
          `;

        const query14 = `
          CREATE TABLE IF NOT EXISTS  FAMILY_HISTORY_OF_CANCER_MASTER (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            brothers INTEGER NOT NULL,
            sisters INTEGER NOT NULL,
            sons INTEGER NOT NULL,
            daughters INTEGER NOT NULL,
            history_of_cancer INTEGER ,
            tab_id TEXT ,
            created_at TEXT
          );
        `;
        const query15 = `
          CREATE TABLE IF NOT EXISTS  FAMILY_HISTORY_OF_CANCER_RELATIVES (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            relation TEXT NOT NULL,
            code INTEGER NOT NULL,
            age_at_diagnosis INTEGER NOT NULL,
            cancer_site TEXT NOT NULL,
            treatment_received INTEGER , 
            tab_id TEXT ,
            created_at TEXTF
          );

        `;
        const query20 = `
                    CREATE TABLE if not exists endo_reports (
                        id TEXT PRIMARY KEY ,
                        user_id TEXT,
                        endo_id TEXT,
                        -- Oral Cavity
                        oc_mucosa_status TEXT CHECK(oc_mucosa_status IN ('Normal', 'Lesion')),
                        oc_description TEXT,

                        -- Oesophagus
                        oe_status TEXT CHECK(oe_status IN ('Normal', 'Lesion')),
                        oe_description TEXT,

                        -- GE Junction
                        ge_level TEXT,
                        ge_status TEXT CHECK(ge_status IN ('Normal', 'Lesion')),
                        ge_description TEXT,

                        -- Stomach -- ST
                        st_fundus_status TEXT CHECK(st_fundus_status IN ('Normal', 'Description')),
                        st_fundus_desc TEXT,
                        st_body_status TEXT CHECK(st_body_status IN ('Normal', 'Description')),
                        st_body_desc TEXT,
                        st_antrum_status TEXT CHECK(st_antrum_status IN ('Normal', 'Description')),
                        st_antrum_desc TEXT,
                        created_at TEXT ,
                        updated_at TEXT ,
                        tab_id TEXT ,
                        FOREIGN KEY (user_id) REFERENCES patients(id)   
                    );

                    CREATE TABLE if not exists stomach_lesions (
                        id TEXT PRIMARY KEY ,
                        report_id TEXT NOT NULL,
                        location TEXT,
                        appearance TEXT,
                        mucosa_v TEXT ,
                        mucosa_s TEXT ,
                        mucosa_d TEXT ,
                        created_at TEXT , 
                        updated_at TEXT ,
                        tab_id TEXT ,
                        FOREIGN KEY (report_id) REFERENCES endo_reports(id) ON DELETE CASCADE 
                    );
        `;
        const query21 = `
                              /* Add these 4 tables to your utils/query.ts initialization logic */

                      CREATE TABLE IF NOT EXISTS FOOD_HABITS_MASTER (
                          id TEXT PRIMARY KEY NOT NULL,
                          user_id TEXT NOT NULL,
                          diet_type TEXT,
                          diet_duration TEXT,
                          additives_json TEXT,
                          method_shallow_frying TEXT DEFAULT '0',
                          method_deep_frying TEXT DEFAULT '0',
                          method_boiling TEXT DEFAULT '0',
                          method_steaming TEXT DEFAULT '0',
                          method_sauting TEXT DEFAULT '0',
                          method_grill_bbq TEXT DEFAULT '0',
                          family_sharing INTEGER,
                          meals_per_day INTEGER,
                          water_supply_json TEXT,
                          created_at TEXT,
                          updated_at TEXT,
                          tab_id TEXT,
                          synch_flag INTEGER DEFAULT 0,
                          FOREIGN KEY (user_id) REFERENCES patients(id)
                      );

                      CREATE TABLE IF NOT EXISTS FOOD_HABITS_FAT_USAGE (
                          id TEXT PRIMARY KEY NOT NULL,
                          master_id TEXT NOT NULL,
                          name TEXT,
                          usage TEXT,
                          family_consumption TEXT,
                          years_used TEXT,
                          FOREIGN KEY (master_id) REFERENCES FOOD_HABITS_MASTER(id) ON DELETE CASCADE
                      );

                      CREATE TABLE IF NOT EXISTS FOOD_RECALL_ENTRY (
                          id TEXT PRIMARY KEY NOT NULL,
                          master_id TEXT NOT NULL,
                          timing TEXT,
                          name_of_dish TEXT,
                          quantity TEXT,
                          date_time TEXT,
                          diet_context TEXT,
                          festival_name TEXT,
                          created_at TEXT,
                          updated_at TEXT,
                          tab_id TEXT,
                          synch_flag INTEGER DEFAULT 0,
                          FOREIGN KEY (master_id) REFERENCES FOOD_HABITS_MASTER(id) ON DELETE CASCADE
                      );
                      
                      CREATE TABLE IF NOT EXISTS FOOD_RECALL_INGREDIENT (
                          id TEXT PRIMARY KEY NOT NULL,
                          entry_id TEXT NOT NULL,
                          name TEXT,
                          quantity TEXT,
                          prep_method TEXT,
                          FOREIGN KEY (entry_id) REFERENCES FOOD_RECALL_ENTRY(id) ON DELETE CASCADE
                      );
        `
        const query16 = trackTable;
        const query17 = trackTableInsertTriggers;
        const query18 = trackTableUpdateTriggers;
        const query19 = trackTableDeleteTriggers;
        //synch flag -> 0 1 2
        // 0 -> never synched
        // 1 -> synched
        // 2 -> updated

        await newDb.execute(query);
        await newDb.execute(query2);
        await newDb.execute(query3);
        await newDb.execute(query4);
        await newDb.execute(query5);
        await newDb.execute(query6);
        await newDb.execute(query7);
        await newDb.execute(query8);
        await newDb.execute(query9);
        await newDb.execute(query10);
        await newDb.execute(query11);
        await newDb.execute(query12);
        await newDb.execute(query13);
        await newDb.execute(query14);
        await newDb.execute(query15);
        await newDb.execute(query20);
        await newDb.execute(query21);
        await newDb.execute(query16);
        await newDb.execute(query17);
        await newDb.execute(query18);
        await newDb.execute(query19);
        setDb(newDb);
        setIsLoading(false);
      } catch (err: any) {
        console.error("SQLite DB initialization failed:", err);
        setError(err);
        setIsLoading(false);
      }
    };

    initDb();

    // Cleanup function to close the database connection
    return () => {
      if (db) {
        db.close().catch(console.error);
      }
    };
  }, []);

  const value = {
    db,
    isLoading,
    error,
    sqlite,
    baseUrl,
    setBaseUrl,
    conflictedList: ConflictedList,
    setConflictedList,
    tabId,
    setTabId,
  };

  return (
    <SQLiteContext.Provider value={value}>{children}</SQLiteContext.Provider>
  );
};
