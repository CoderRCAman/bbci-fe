import React, { useState, useEffect, createContext, useContext, PropsWithChildren } from 'react';
import { Capacitor } from '@capacitor/core';
import {
    CapacitorSQLite,
    SQLiteConnection,
    SQLiteDBConnection,
    capSQLiteSet,
    DBSQLiteValues
} from '@capacitor-community/sqlite';

// Import the JeepSqlite component for the web platform
import { JeepSqlite } from "jeep-sqlite/dist/components/jeep-sqlite";

// Define the shape of a patient
interface Patient {
    id: number;
    name: string;
    age: number;
    gender: string;
}

// Define the shape of the context value
interface SQLiteContextValue {
    db: SQLiteDBConnection | null;
    isLoading: boolean;
    error: Error | null;
    sqlite: SQLiteConnection | null
    baseUrl: string | null,
    conflictedList: any[],
    setConflictedList: React.Dispatch<React.SetStateAction<any[]>>,
    setBaseUrl: React.Dispatch<React.SetStateAction<string | null>>;
}
0
// Create the context with a default value
const SQLiteContext = createContext<SQLiteContextValue>({
    db: null,
    isLoading: true,
    error: null,
    sqlite: null,
    baseUrl: null,
    conflictedList: [],
    setBaseUrl: () => { },
    setConflictedList: () => { }
});

// Create a custom hook to use the context
export const useSQLite = () => {
    return useContext(SQLiteContext);
};

// The provider component that initializes and manages the database connection
export const SQLiteProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    const [db, setDb] = useState<SQLiteDBConnection | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const sqlite = new SQLiteConnection(CapacitorSQLite);
    const [baseUrl, setBaseUrl] = useState<string | null>('http://localhost:11142');
    const [ConflictedList, setConflictedList] = useState<any[]>([]);
    useEffect(() => {
        const initDb = async () => {
            try {
                const platform = Capacitor.getPlatform();

                if (platform === 'web') {
                    // Create the 'jeep-sqlite' Stencil component for the web platform
                    customElements.define("jeep-sqlite", JeepSqlite);
                    const jeepSqliteEl = document.createElement("jeep-sqlite");
                    document.body.appendChild(jeepSqliteEl);
                    await customElements.whenDefined("jeep-sqlite");

                    // Initialize the Web store
                    await sqlite.initWebStore();
                }

                // Check if a connection already exists
                const dbName = 'patientdb';
                const isCon = await sqlite.isConnection(dbName, false);
                let newDb: SQLiteDBConnection;

                if (isCon.result) {
                    newDb = await sqlite.retrieveConnection(dbName, false);
                } else {
                    newDb = await sqlite.createConnection(
                        dbName,
                        false,
                        'no-encryption',
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
                        updated_by TEXT DEFAULT 'UNKNOWN'
                    );
                `;


                //synch flag -> 0 1 2 
                // 0 -> never synched 
                // 1 -> synched
                // 2 -> updated 

                await newDb.execute(query);


                try {
                    const migration1 = `
                    CREATE TABLE IF NOT EXISTS tracksync (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    patient_id TEXT UNIQUE,
                    synch INT DEFAULT 0,
                    FOREIGN KEY (patient_id) REFERENCES patients(id));`
                    await newDb.execute(migration1);
                } catch (error) {
                    console.log('--------- tracksync table already exist! ---------');
                }

                try {
                    const triger1 = `
                    CREATE TRIGGER insert_tracksync_on_patient_insert
                    AFTER INSERT ON patients
                    FOR EACH ROW
                    BEGIN
                        INSERT INTO tracksync (patient_id, synch)
                        VALUES (NEW.id, 0);
                    END;
                    `
                    await newDb.execute(triger1);
                } catch (error) {
                    console.log('--------- Trigger1 already exist! ---------');
                }


                try {
                    const migration2 = 'ALTER TABLE patients ADD COLUMN _rev TEXT;'
                    await newDb?.execute(migration2);
                } catch (error) {
                    console.log("--------- _rev colum already exist ----------");
                }

                try {
                    const query = `
                    CREATE TABLE IF NOT EXISTS residential_history (
                        id TEXT PRIMARY KEY NOT NULL ,
                        from_age INT  , 
                        to_age TEXT ,
                        city TEXT , 
                        village TEXT,
                        state TEXT,
                        code INT,
                        user_id TEXT 
                    );
                `;
                    await newDb?.execute(query);
                } catch (error) {

                }


                setDb(newDb);
                setIsLoading(false);
            } catch (err: any) {
                console.error('SQLite DB initialization failed:', err);
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
        db, isLoading, error, sqlite,
        baseUrl, setBaseUrl,
        conflictedList: ConflictedList,
        setConflictedList
    };

    return (
        <SQLiteContext.Provider value={value}>
            {children}
        </SQLiteContext.Provider>
    );
};