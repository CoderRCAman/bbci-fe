//this helper page is meant for synchronizing the data with the cloud server
import axios from "axios";
import axiosRetry from "axios-retry";
import PQueue from "p-queue";
import { TABLE_INFO, UNSYNC_RECORD } from "./Tab3";
import { set } from "date-fns";

// Limit to 5 concurrent requests
const queue = new PQueue({ concurrency: 1 });
// Create an axios instance
const api = axios.create({
  baseURL: "http://localhost:11142/api",
  timeout: 5000,
});

const Tables = [
  "patients",
  "residential_history",
  "personal_medical_history",
  "TOBACCO_ALCOHOL_CONSUMPTION",
  "ENDOSCOPY",
  "blood_sample",
  "blood_tube_collection",
  "gtgh_blood_report",
  "anthropometry",
  "indoor_air_pollution",
  "TOBACCO_ALCOHOL_CONSUMPTION_MASTER",
  "demographic_info",
  "FAMILY_HISTORY_OF_CANCER_MASTER",
  "FAMILY_HISTORY_OF_CANCER_RELATIVES", 
  "deletedRecords"
];

// Retry failed requests up to 3 times
axiosRetry(api, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

export async function PUSH_TO_CLOUD(
  insertOrUpdated: TABLE_INFO[],
  deletedRecords: UNSYNC_RECORD[]
) {
  const LIMIT = 50;
  try {
    for (const item of insertOrUpdated) {
      const { table_name, table_data } = item;
      for (let i = 0; i < table_data.length; i += LIMIT) {
        const chunk = table_data.slice(i, i + LIMIT);
        queue.add(async () => {
          try {
            await api.post(`/push`, {
              table_name,
              table_data: chunk,
              operation: "INSERT_UPDATE",
            });
          } catch (error) {
            console.log(error);
            throw new Error(
              `Failed to push data to cloud for table : ${table_name}`
            );
          }
        });
      }
    }
    if (deletedRecords.length > 0) {
      queue.add(async () => {
        try {
          await api.post(`/push`, {
            table_name: "",
            table_data: deletedRecords.map((item) => ({
              rowId: item.rowId,
              table_name: item.table_name,
            })),
            operation: "DELETE",
          });
        } catch (error) {
          console.log(error);
          throw new Error(`Failed to push data to cloud for deleted records`);
        }
      });
    }
    await queue.onIdle();
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function fetchTable(tableName: string) {
  let offset = 0;
  let totalCount = 0;
  let allRows: any[] = [];
  let LIMIT = 200;
  console.log(`🔄 Syncing table: ${tableName}`);

  while (true) {
    try {
      const res = await api.get(`/pull`, {
        params: { table_name: tableName, limit: LIMIT, offset },
      });

      const { success, results, total_count } = res.data;

      if (!success) {
        console.error(`❌ Failed to fetch ${tableName}`, res.data);
        break;
      }

      totalCount = total_count;

      if (results.length === 0) {
        console.log(`✅ Finished table: ${tableName}`);
        break;
      }

      console.log(
        `📦 ${tableName}: Fetched ${results.length} rows (offset ${offset}/${totalCount})`
      );

      // store/process the data here (for example, save locally)
      allRows = allRows.concat(results);

      offset += LIMIT;
      if (offset >= totalCount) {
        console.log(`✅ Completed ${tableName} (${allRows.length} total rows)`);
        break;
      }
    } catch (err) {
      console.error(`⚠️ Error fetching ${tableName} at offset ${offset}:`, err);
      break;
    }
  }

  return allRows;
}
export async function PULL_FROM_CLOUD(
  setPullState: React.Dispatch<
    React.SetStateAction<{
      show: boolean;
      applyingPatch: boolean;
      appliedPatch: boolean;
      data: {
        table_name: string;
        display_name: string;
        status: boolean;
      }[];
    }>
  >
) {
  try {
    const result: TABLE_INFO[] = [];
    setPullState((prev) => ({ ...prev, show: true }));
    for (const table_name of Tables) {
      setPullState((prev) => ({
        ...prev,
        data: prev.data.map((item) =>
          item.table_name === table_name ? { ...item, status: false } : item
        ),
      }));
      await queue.add(async () => {
        const tableData = await fetchTable(table_name);
        result.push({ table_name, table_data: tableData });
      });
      setPullState((prev) => ({
        ...prev,
        data: prev.data.map((item) =>
          item.table_name === table_name ? { ...item, status: true } : item
        ),
      }));
    }
    await queue.onIdle();
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
