import { SQLiteConnection, SQLiteDBConnection } from "@capacitor-community/sqlite";
import { BLOOD_SAMPLE } from "./BloodPage2";
import { saveToStore } from "../../../utils/helper";

export const ErrorDetectionBloodSample = (data: BLOOD_SAMPLE): string | null => {
    if (!data.id) return "Missing: Sample ID";
    if (!data.user_id) return "Missing: User ID";
    if (!data.date_collected) return "Missing: Date Collected";
    if (!data.time_collected) return "Missing: Time Collected";
    if (!data.last_meal_date) return "Missing: Last Meal Date";
    if (!data.last_meal_time) return "Missing: Last Meal Time";
    const validReceivedValues = [0, 1, 2, 8, 9];
    if (!validReceivedValues.includes(data.received_blood_last_6_months)) {
        return "Invalid or Missing: Received Blood in Last 6 Months";
    }
    if (!data.sample_classification) return "Missing: Sample Classification";
    if (data.is_sample_collected !== 0 && data.is_sample_collected !== 1)
        return "Invalid or Missing: Is Sample Collected (should be 0 or 1)";

    // Check collection_tubes array
    if (!Array.isArray(data.collection_tubes) || data.collection_tubes.length === 0)
        return "Missing: At least one collection tube is required";

    // Loop through each collection_tube and validate its fields
    for (let i = 0; i < data.collection_tubes.length; i++) {
        const tube = data.collection_tubes[i];
        if (!tube.id) return `Missing: Blood collection id`;
        if (!tube.blood_collection_tube) return `Missing: Blood Collection Tube`;
        if (!tube.blood_collection_tube && !tube.blood_collection_tube_other)
            return `Missing: Either Blood Collection Tube or Blood Collection Tube Other`;
        if (!tube.identification_code_tube) return `Missing: Identification Code Tube`;
        if (typeof tube.volume !== 'number' || isNaN(tube.volume))
            return `Missing or Invalid: Volume`;
        if (!tube.characteristic) return `Missing: Characteristic`;
        // blood_sample_id is optional
    }
    // If all fields are valid
    return null;
}

export const saveBloodSampleRecord = async (bloodSample: BLOOD_SAMPLE, db: SQLiteDBConnection | null, sqlite: SQLiteConnection | null) => {
    try {
        const bloodCollectionTube = bloodSample.collection_tubes;
        const query = `
                  INSERT INTO blood_sample (
                    id, user_id, date_collected, time_collected,
                    last_meal_date, received_blood_last_6_months,
                    sample_classification, is_sample_collected, last_meal_time
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                  ON CONFLICT(id) DO UPDATE SET
                    user_id = excluded.user_id,
                    date_collected = excluded.date_collected,
                    time_collected = excluded.time_collected,
                    last_meal_date = excluded.last_meal_date,
                    received_blood_last_6_months = excluded.received_blood_last_6_months,
                    sample_classification = excluded.sample_classification,
                    is_sample_collected = excluded.is_sample_collected,
                    last_meal_time = excluded.last_meal_time;
                `;
        const values = [
            bloodSample.id,
            bloodSample.user_id,
            bloodSample.date_collected,
            bloodSample.time_collected,
            bloodSample.last_meal_date,
            bloodSample.received_blood_last_6_months,
            bloodSample.sample_classification,
            bloodSample.is_sample_collected,
            bloodSample.last_meal_time,
        ];
        await db?.run(query, values);
        for (let i = 0; i < bloodCollectionTube.length; i++) {
            const item = bloodCollectionTube[i];
            const q = `
                INSERT INTO blood_tube_collection (
                  id,
                  blood_collection_tube,
                  blood_collection_tube_other,
                  identification_code_tube,
                  volume,
                  characteristic,
                  blood_sample_id
                ) VALUES ('${item.id}', '${item.blood_collection_tube}',
                  '${item.blood_collection_tube_other}', '${item.identification_code_tube}', 
                  ${item.volume}, '${item.characteristic}', '${bloodSample.id}')
                ON CONFLICT(id) DO UPDATE SET
                  blood_collection_tube = excluded.blood_collection_tube,
                  blood_collection_tube_other = excluded.blood_collection_tube_other,
                  identification_code_tube = excluded.identification_code_tube,
                  volume = excluded.volume,
                  characteristic = excluded.characteristic,
                  blood_sample_id = excluded.blood_sample_id;
              `;
            await db?.execute(q)
        }
        await saveToStore(sqlite)
    } catch (error) {

    }
}