export const trackTable = `

CREATE TABLE IF NOT EXISTS tracksync (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rowId TEXT,
    synch INTEGER ,
    table_name TEXT
);

`;

export const trackTableInsertTriggers = `
-- Triggers to track inserts and set synch = 0 in the unified tracksync table

CREATE TRIGGER IF NOT EXISTS trg_patients_insert
AFTER INSERT ON patients
BEGIN
    INSERT INTO tracksync (rowId, synch, table_name)
    VALUES (NEW.id, 0, 'patients');
END;

CREATE TRIGGER IF NOT EXISTS trg_residential_history_insert
AFTER INSERT ON residential_history
BEGIN
    INSERT INTO tracksync (rowId, synch, table_name)
    VALUES (NEW.id, 0, 'residential_history');
END;

CREATE TRIGGER IF NOT EXISTS trg_personal_medical_history_insert
AFTER INSERT ON personal_medical_history
BEGIN
    INSERT INTO tracksync (rowId, synch, table_name)
    VALUES (NEW.id, 0, 'personal_medical_history');
END;

CREATE TRIGGER IF NOT EXISTS trg_tobacco_alcohol_consumption_insert
AFTER INSERT ON tobacco_alcohol_consumption
BEGIN
    INSERT INTO tracksync (rowId, synch, table_name)
    VALUES (NEW.id, 0, 'tobacco_alcohol_consumption');
END;

CREATE TRIGGER IF NOT EXISTS trg_endoscopy_insert
AFTER INSERT ON endoscopy
BEGIN
    INSERT INTO tracksync (rowId, synch, table_name)
    VALUES (NEW.id, 0, 'endoscopy');
END;

CREATE TRIGGER IF NOT EXISTS trg_blood_sample_insert
AFTER INSERT ON blood_sample
BEGIN
    INSERT INTO tracksync (rowId, synch, table_name)
    VALUES (NEW.id, 0, 'blood_sample');
END;

CREATE TRIGGER IF NOT EXISTS trg_blood_tube_collection_insert
AFTER INSERT ON blood_tube_collection
BEGIN
    INSERT INTO tracksync (rowId, synch, table_name)
    VALUES (NEW.id, 0, 'blood_tube_collection');
END;

CREATE TRIGGER IF NOT EXISTS trg_gtgh_blood_report_insert
AFTER INSERT ON gtgh_blood_report
BEGIN
    INSERT INTO tracksync (rowId, synch, table_name)
    VALUES (NEW.id, 0, 'gtgh_blood_report');
END;

CREATE TRIGGER IF NOT EXISTS trg_anthropometry_insert
AFTER INSERT ON anthropometry
BEGIN
    INSERT INTO tracksync (rowId, synch, table_name)
    VALUES (NEW.id, 0, 'anthropometry');
END;

CREATE TRIGGER IF NOT EXISTS trg_indoor_air_pollution_insert
AFTER INSERT ON indoor_air_pollution
BEGIN
    INSERT INTO tracksync (rowId, synch, table_name)
    VALUES (NEW.id, 0, 'indoor_air_pollution');
END;

CREATE TRIGGER IF NOT EXISTS trg_tobacco_alcohol_consumption_master_insert
AFTER INSERT ON tobacco_alcohol_consumption_master
BEGIN
    INSERT INTO tracksync (rowId, synch, table_name)
    VALUES (NEW.id, 0, 'tobacco_alcohol_consumption_master');
END;

CREATE TRIGGER IF NOT EXISTS trg_demographic_info_insert
AFTER INSERT ON demographic_info
BEGIN
    INSERT INTO tracksync (rowId, synch, table_name)
    VALUES (NEW.id, 0, 'demographic_info');
END;

CREATE TRIGGER IF NOT EXISTS trg_family_history_of_cancer_master_insert
AFTER INSERT ON family_history_of_cancer_master
BEGIN
    INSERT INTO tracksync (rowId, synch, table_name)
    VALUES (NEW.id, 0, 'family_history_of_cancer_master');
END;

CREATE TRIGGER IF NOT EXISTS trg_family_history_of_cancer_relatives_insert
AFTER INSERT ON family_history_of_cancer_relatives
BEGIN
    INSERT INTO tracksync (rowId, synch, table_name)
    VALUES (NEW.id, 0, 'family_history_of_cancer_relatives');
END;

CREATE TRIGGER IF NOT EXISTS trg_endo_reports_insert
AFTER INSERT ON endo_reports
BEGIN
    INSERT INTO tracksync (rowId, synch, table_name)
    VALUES (NEW.id, 0, 'endo_reports');
END;


CREATE TRIGGER IF NOT EXISTS trg_stomach_lesions_insert
AFTER INSERT ON stomach_lesions
BEGIN
    INSERT INTO tracksync (rowId, synch, table_name)
    VALUES (NEW.id, 0, 'stomach_lesions');
END;

CREATE TRIGGER IF NOT EXISTS trg_FOOD_HABITS_MASTER_insert
AFTER INSERT ON FOOD_HABITS_MASTER
BEGIN
    INSERT INTO tracksync (rowId, synch, table_name)
    VALUES (NEW.id, 0, 'FOOD_HABITS_MASTER');
END;

CREATE TRIGGER IF NOT EXISTS trg_FOOD_HABITS_FAT_USAGE_insert
AFTER INSERT ON FOOD_HABITS_FAT_USAGE
BEGIN
    INSERT INTO tracksync (rowId, synch, table_name)
    VALUES (NEW.id, 0, 'FOOD_HABITS_FAT_USAGE');
END;

CREATE TRIGGER IF NOT EXISTS trg_FOOD_RECALL_ENTRY_insert
AFTER INSERT ON FOOD_RECALL_ENTRY
BEGIN
    INSERT INTO tracksync (rowId, synch, table_name)
    VALUES (NEW.id, 0, 'FOOD_RECALL_ENTRY');
END;
CREATE TRIGGER IF NOT EXISTS trg_FOOD_RECALL_INGREDIENT_insert
AFTER INSERT ON FOOD_RECALL_INGREDIENT
BEGIN
    INSERT INTO tracksync (rowId, synch, table_name)
    VALUES (NEW.id, 0, 'FOOD_RECALL_INGREDIENT');
END;
`;

export const trackTableUpdateTriggers = `
    -- Triggers to track updates and set synch = 2 in track tables

CREATE TRIGGER IF NOT EXISTS trg_patients_update
AFTER UPDATE ON patients
BEGIN
    UPDATE tracksync
    SET synch = 2
    WHERE rowId = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_residential_history_update
AFTER UPDATE ON residential_history
BEGIN
    UPDATE tracksync
    SET synch = 2
    WHERE rowId = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_personal_medical_history_update
AFTER UPDATE ON personal_medical_history
BEGIN
    UPDATE tracksync
    SET synch = 2
    WHERE rowId = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_tobacco_alcohol_consumption_update
AFTER UPDATE ON tobacco_alcohol_consumption
BEGIN
    UPDATE tracksync
    SET synch = 2
    WHERE rowId = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_endoscopy_update
AFTER UPDATE ON endoscopy
BEGIN
    UPDATE tracksync
    SET synch = 2
    WHERE rowId = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_blood_sample_update
AFTER UPDATE ON blood_sample
BEGIN
    UPDATE tracksync
    SET synch = 2
    WHERE rowId = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_blood_tube_collection_update
AFTER UPDATE ON blood_tube_collection
BEGIN
    UPDATE tracksync
    SET synch = 2
    WHERE rowId = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_gtgh_blood_report_update
AFTER UPDATE ON gtgh_blood_report
BEGIN
    UPDATE tracksync
    SET synch = 2
    WHERE rowId = NEW.id;   
END;

CREATE TRIGGER IF NOT EXISTS trg_anthropometry_update
AFTER UPDATE ON anthropometry
BEGIN
    UPDATE tracksync
    SET synch = 2
    WHERE rowId = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_indoor_air_pollution_update
AFTER UPDATE ON indoor_air_pollution
BEGIN
    UPDATE tracksync
    SET synch = 2
    WHERE rowId = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_tobacco_alcohol_consumption_master_update
AFTER UPDATE ON tobacco_alcohol_consumption_master
BEGIN
    UPDATE tracksync
    SET synch = 2
    WHERE rowId = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_demographic_info_update
AFTER UPDATE ON demographic_info
BEGIN
    UPDATE tracksync
    SET synch = 2
    WHERE rowId = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_family_history_of_cancer_master_update
AFTER UPDATE ON family_history_of_cancer_master
BEGIN
    UPDATE tracksync
    SET synch = 2
    WHERE rowId = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_family_history_of_cancer_relatives_update
AFTER UPDATE ON family_history_of_cancer_relatives
BEGIN
    UPDATE tracksync
    SET synch = 2
    WHERE rowId = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_endo_reports_update
AFTER UPDATE ON endo_reports
BEGIN
    UPDATE tracksync
    SET synch = 2
    WHERE rowId = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_stomach_lesions_update
AFTER UPDATE ON stomach_lesions
BEGIN
    UPDATE tracksync
    SET synch = 2
    WHERE rowId = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_FOOD_HABITS_MASTER_update
AFTER UPDATE ON FOOD_HABITS_MASTER
BEGIN
    UPDATE tracksync
    SET synch = 2
    WHERE rowId = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_FOOD_HABITS_FAT_USAGE_update
AFTER UPDATE ON FOOD_HABITS_FAT_USAGE
BEGIN
    UPDATE tracksync
    SET synch = 2
    WHERE rowId = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_FOOD_RECALL_ENTRY_update
AFTER UPDATE ON FOOD_RECALL_ENTRY
BEGIN
    UPDATE tracksync
    SET synch = 2
    WHERE rowId = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_FOOD_RECALL_INGREDIENT_update
AFTER UPDATE ON FOOD_RECALL_INGREDIENT
BEGIN
    UPDATE tracksync
    SET synch = 2
    WHERE rowId = NEW.id;
END;

`;

export const trackTableDeleteTriggers = `
    -- Triggers to track deletions and set synch = 3 in track tables

CREATE TRIGGER IF NOT EXISTS trg_patients_delete
AFTER DELETE ON patients
BEGIN
    UPDATE tracksync
    SET synch = 3
    WHERE rowId = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_residential_history_delete
AFTER DELETE ON residential_history
BEGIN
    UPDATE tracksync
    SET synch = 3
    WHERE rowId = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_personal_medical_history_delete
AFTER DELETE ON personal_medical_history
BEGIN
    UPDATE tracksync
    SET synch = 3
    WHERE rowId = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_tobacco_alcohol_consumption_delete
AFTER DELETE ON tobacco_alcohol_consumption
BEGIN
    UPDATE tracksync
    SET synch = 3
    WHERE rowId = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_endoscopy_delete
AFTER DELETE ON endoscopy
BEGIN
    UPDATE tracksync
    SET synch = 3
    WHERE rowId = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_blood_sample_delete
AFTER DELETE ON blood_sample
BEGIN
    UPDATE tracksync
    SET synch = 3
    WHERE rowId = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_blood_tube_collection_delete
AFTER DELETE ON blood_tube_collection
BEGIN
    UPDATE tracksync
    SET synch = 3
    WHERE rowId = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_gtgh_blood_report_delete
AFTER DELETE ON gtgh_blood_report
BEGIN
    UPDATE tracksync
    SET synch = 3
    WHERE rowId = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_anthropometry_delete
AFTER DELETE ON anthropometry
BEGIN
    UPDATE tracksync
    SET synch = 3
    WHERE rowId = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_indoor_air_pollution_delete
AFTER DELETE ON indoor_air_pollution
BEGIN
    UPDATE tracksync
    SET synch = 3
    WHERE rowId = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_tobacco_alcohol_consumption_master_delete
AFTER DELETE ON tobacco_alcohol_consumption_master
BEGIN
    UPDATE tracksync
    SET synch = 3
    WHERE rowId = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_demographic_info_delete
AFTER DELETE ON demographic_info
BEGIN
    UPDATE tracksync
    SET synch = 3
    WHERE rowId = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_family_history_of_cancer_master_delete
AFTER DELETE ON family_history_of_cancer_master
BEGIN
    UPDATE tracksync
    SET synch = 3
    WHERE rowId = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_family_history_of_cancer_relatives_delete
AFTER DELETE ON family_history_of_cancer_relatives
BEGIN
    UPDATE tracksync
    SET synch = 3
 WHERE rowId = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_endo_reports_delete
AFTER DELETE ON endo_reports
BEGIN
    UPDATE tracksync
    SET synch = 3
 WHERE rowId = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_stomach_lesions_delete
AFTER DELETE ON stomach_lesions
BEGIN
    UPDATE tracksync
    SET synch = 3
 WHERE rowId = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_FOOD_HABITS_MASTER_delete
AFTER DELETE ON FOOD_HABITS_MASTER
BEGIN
    UPDATE tracksync
    SET synch = 3
 WHERE rowId = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_FOOD_HABITS_FAT_USAGE_delete
AFTER DELETE ON FOOD_HABITS_FAT_USAGE
BEGIN
    UPDATE tracksync
    SET synch = 3
 WHERE rowId = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_FOOD_RECALL_ENTRY_delete
AFTER DELETE ON FOOD_RECALL_ENTRY
BEGIN
    UPDATE tracksync
    SET synch = 3
 WHERE rowId = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_FOOD_RECALL_INGREDIENT_delete
AFTER DELETE ON FOOD_RECALL_INGREDIENT
BEGIN
    UPDATE tracksync
    SET synch = 3
 WHERE rowId = OLD.id;
END;
`;
