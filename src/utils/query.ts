export const trackTable = `

        -- Create Table: tracksync_patients
CREATE TABLE IF NOT EXISTS tracksync_patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rowId TEXT,
    synch INTEGER
);

------------------------------------------------------

-- Create Table: tracksync_residential_history
CREATE TABLE IF NOT EXISTS tracksync_residential_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rowId TEXT,
    synch INTEGER
);

------------------------------------------------------

-- Create Table: tracksync_personal_medical_history
CREATE TABLE IF NOT EXISTS tracksync_personal_medical_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rowId TEXT,
    synch INTEGER
);

------------------------------------------------------

-- Create Table: tracksync_TOBACCO_ALCOHOL_CONSUMPTION
CREATE TABLE IF NOT EXISTS tracksync_TOBACCO_ALCOHOL_CONSUMPTION (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rowId TEXT,
    synch INTEGER
);

------------------------------------------------------

-- Create Table: tracksync_ENDOSCOPY
CREATE TABLE IF NOT EXISTS tracksync_ENDOSCOPY (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rowId TEXT,
    synch INTEGER
);

------------------------------------------------------

-- Create Table: tracksync_blood_sample
CREATE TABLE IF NOT EXISTS tracksync_blood_sample (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rowId TEXT,
    synch INTEGER
);

------------------------------------------------------

-- Create Table: tracksync_blood_tube_collection
CREATE TABLE IF NOT EXISTS tracksync_blood_tube_collection (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rowId TEXT,
    synch INTEGER
);

------------------------------------------------------

-- Create Table: tracksync_gtgh_blood_report
CREATE TABLE IF NOT EXISTS tracksync_gtgh_blood_report (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rowId TEXT,
    synch INTEGER
);

------------------------------------------------------

-- Create Table: tracksync_anthropometry
CREATE TABLE IF NOT EXISTS tracksync_anthropometry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rowId TEXT,
    synch INTEGER
);

------------------------------------------------------

-- Create Table: tracksync_indoor_air_pollution
CREATE TABLE IF NOT EXISTS tracksync_indoor_air_pollution (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rowId TEXT,
    synch INTEGER
);

------------------------------------------------------

-- Create Table: tracksync_TOBACCO_ALCOHOL_CONSUMPTION_MASTER
CREATE TABLE IF NOT EXISTS tracksync_TOBACCO_ALCOHOL_CONSUMPTION_MASTER (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rowId TEXT,
    synch INTEGER
);

------------------------------------------------------

-- Create Table: tracksync_demographic_info
CREATE TABLE IF NOT EXISTS tracksync_demographic_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rowId TEXT,
    synch INTEGER
);

------------------------------------------------------

-- Create Table: tracksync_FAMILY_HISTORY_OF_CANCER_MASTER
CREATE TABLE IF NOT EXISTS tracksync_FAMILY_HISTORY_OF_CANCER_MASTER (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rowId TEXT,
    synch INTEGER
);

------------------------------------------------------

-- Create Table: tracksync_FAMILY_HISTORY_OF_CANCER_RELATIVES
CREATE TABLE IF NOT EXISTS tracksync_FAMILY_HISTORY_OF_CANCER_RELATIVES (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rowId TEXT,
    synch INTEGER
);

  
`