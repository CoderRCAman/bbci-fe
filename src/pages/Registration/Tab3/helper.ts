//this helper page is meant for synchronizing the data with the cloud server
import axios from "axios";
import axiosRetry from "axios-retry";
import PQueue from "p-queue";
import { TABLE_INFO, UNSYNC_RECORD } from "./Tab3";
import { format, set } from "date-fns";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import ExcelJS from "exceljs";
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from "@capacitor/core";
// Limit to 5 concurrent requests
const queue = new PQueue({ concurrency: 1 });
// Create an axios instance
const api = axios.create({
  baseURL: "http://14.139.205.198/api",
  // baseURL : "http://localhost:11142/api", 
  // baseURL: "https://ziro.devetc.site/api",
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
  "deletedRecords",
  "FOOD_HABITS_MASTER",
  "FOOD_HABITS_FAT_USAGE",
  "FOOD_RECALL_ENTRY",
  "FOOD_RECALL_INGREDIENT",
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
        await queue.add(async () => {
          try {
            await api.post(`/push`, {
              table_name,
              table_data: chunk,
              operation: "INSERT_UPDATE",
            });
          } catch (error) {
            console.log(error);
            throw error;
            // throw new Error(
            //   `Failed to push data to cloud for table : ${table_name}`
            // );
          }
        });
      }
    }
    if (deletedRecords.length > 0) {
      await queue.add(async () => {
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
          console.log(JSON.stringify(error));
          throw error;
          // throw new Error(`Failed to push data to cloud for deleted records`);
        }
      });
    }
    await queue.onIdle();
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function fetchTable(tableName: string, db: SQLiteDBConnection | null) {
  let offset = 0;
  let totalCount = 0;
  let allRows: any[] = [];
  let LIMIT = 50;
  let updatedat_ids: { id: string, updated_at: string }[] = [];
  console.log(`🔄 Syncing table: ${tableName}`);
  if (tableName === 'patients') {
    const res = await db?.query(`select id , updated_at from patients where updated_at is not null `);
    updatedat_ids = res?.values as { id: string, updated_at: string }[];
  }
  while (true) {
    try {
      const res = await api.post(`/pull`, {
        table_name: tableName, limit: LIMIT, offset, updatedat_ids
      });

      const { success, results, total_count } = res.data;

      if (!success) {
        console.error(`❌ Failed to fetch ${tableName}`, JSON.stringify(res.data));
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
      console.error(`⚠️ Error fetching ${tableName} at offset ${offset}:`, JSON.stringify(err));
      throw err;
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
        error: boolean;
      }[];
    }>
  >,
  db: SQLiteDBConnection | null

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
        try {
          const tableData = await fetchTable(table_name, db);
          result.push({ table_name, table_data: tableData });
          setPullState((prev) => ({
            ...prev,
            data: prev.data.map((item) =>
              item.table_name === table_name
                ? { ...item, status: true, error: false }
                : item
            ),
          }));
        } catch (err) {
          console.error("Error in table:", table_name, JSON.stringify(err));
          setPullState((prev) => ({
            ...prev,
            data: prev.data.map((item) =>
              item.table_name === table_name
                ? { ...item, status: false, error: true }
                : item
            ),
          }));
        }
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
    console.log(JSON.stringify(error));
    throw error;
  }
}

async function opLoadCSV(
  data: { table_name: string; data: { [key: string]: any }[] }[]
) {
  try {
    const workbook = new ExcelJS.Workbook();

    workbook.creator = "My App";
    workbook.created = new Date();

    for (const table of data) {
      // Clean + shorten sheet name 
      const sheetName = validateSheetName(table.table_name === "patients" ? "participants" : table.table_name);
      const sheet = workbook.addWorksheet(sheetName);

      const rows = table.data; // <-- updated

      if (!rows || rows.length === 0) {
        sheet.addRow(["No data available"]);
        continue;
      }

      // Extract headers from the first row
      const headers = Object.keys(rows[0]);
      sheet.addRow(headers);

      // Add each row
      rows.forEach((row: any) => {
        sheet.addRow(headers.map((h) => row[h]));
      });

      // Style header row
      sheet.getRow(1).eachCell((cell: any) => {
        cell.font = { bold: true };
      });

      // Auto-fit columns (optional)
      sheet.columns.forEach((col: any) => {
        let maxLength = 10;
        col.eachCell({ includeEmpty: true }, (cell: any) => {
          const cellValue = cell.value ? cell.value.toString() : "";
          maxLength = Math.max(maxLength, cellValue.length);
        });
        col.width = maxLength + 2;
      });
    }

    // Generate buffer for download
    const buffer = await workbook.xlsx.writeBuffer();
    const platform = Capacitor.getPlatform();
    const dateStr = format(new Date(), "dd-MM-yyyy_HH-mm-ss");
    if (platform === "android") {
      saveExcelAndroid(buffer, `PulledData_${dateStr}.xlsx`);
    }
    else if (platform === "web") {
      downloadBlob(buffer, `PulledData_${dateStr}.xlsx`);
    }
    else {
      console.log("Unknown platform:", platform);
    }
   
  } catch (error) {
    throw error;
  }
}
export async function exportToCSV(db: SQLiteDBConnection | null) {
  try {
    const result: { table_name: string; data: { [key: string]: any }[] }[] = [];
    for (const table of Tables) {
      // Your code to fetch and push table data here
      if (table === "deletedRecords") continue;
      const res = await db?.query(`SELECT * FROM ${table}`);
      result.push({ table_name: table, data: res?.values || [] });
    }
    await opLoadCSV(result);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

function validateSheetName(name: string) {
  return name.replace(/[*?:/\\[\]]/g, "_").substring(0, 31);
}

function downloadBlob(buffer: any, filename: string) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

async function saveExcelAndroid(buffer: ArrayBuffer, filename: string) {
  try {
    // Convert ArrayBuffer → Base64
    const uint8 = new Uint8Array(buffer);
    let binary = "";
    uint8.forEach((b) => (binary += String.fromCharCode(b)));
    const base64 = btoa(binary);

    await Filesystem.writeFile({
      path: filename,
      data: base64,
      directory: Directory.Documents,
      recursive: true,
    });

    console.log("Excel saved:", filename);
  } catch (err) {
    console.error("Error saving Excel on Android:", err);
    throw err;
  }
}