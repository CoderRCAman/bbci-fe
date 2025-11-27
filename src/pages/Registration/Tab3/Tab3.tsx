import { IonAlert, IonContent, IonIcon, IonPage } from "@ionic/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Header from "../../../components/Header";
import { useSQLite } from "../../../utils/Sqlite";
import { useLocation } from "react-router";
import { set } from "date-fns";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { exportToCSV, PULL_FROM_CLOUD, PUSH_TO_CLOUD } from "./helper";
import { saveToStore } from "../../../utils/helper";
import {
  checkmarkCircleOutline,
  closeCircleOutline,
  cloudDownloadOutline,
} from "ionicons/icons";
export type UNSYNC_RECORD = {
  id: number;
  rowId: string;
  synch: number;
  table_name: string;
};
export type TABLE_INFO = {
  table_name: string;
  table_data: any[];
};
const initialPullState = {
  show: false,
  applyingPatch: false,
  appliedPatch: false,
  data: [
    {
      table_name: "patients",
      display_name: "Participants",
      status: false,
      error: false,
    },
    {
      table_name: "residential_history",
      display_name: "Residential History",
      status: false,
      error: false,
    },
    {
      table_name: "personal_medical_history",
      display_name: "Personal Medical History",
      status: false,
      error: false,
    },
    {
      table_name: "TOBACCO_ALCOHOL_CONSUMPTION",
      display_name: "Tobacco Alcohol Consumption",
      status: false,
      error: false,
    },
    {
      table_name: "ENDOSCOPY",
      display_name: "Endoscopy",
      status: false,
      error: false,
    },
    {
      table_name: "blood_sample",
      display_name: "Blood Sample",
      status: false,
      error: false,
    },
    {
      table_name: "blood_tube_collection",
      display_name: "Blood Tube Collection",
      status: false,
      error: false,
    },
    {
      table_name: "gtgh_blood_report",
      display_name: "Gtgh Blood Report",
      status: false,
      error: false,
    },
    {
      table_name: "anthropometry",
      display_name: "Anthropometry",
      status: false,
      error: false,
    },
    {
      table_name: "indoor_air_pollution",
      display_name: "Indoor Air Pollution",
      status: false,
      error: false,
    },
    {
      table_name: "TOBACCO_ALCOHOL_CONSUMPTION_MASTER",
      display_name: "Tobacco Alcohol Consumption Master",
      status: false,
      error: false,
    },
    {
      table_name: "demographic_info",
      display_name: "Demographic Info",
      status: false,
      error: false,
    },
    {
      table_name: "FAMILY_HISTORY_OF_CANCER_MASTER",
      display_name: "Family History Of Cancer Master",
      status: false,
      error: false,
    },
    {
      table_name: "FAMILY_HISTORY_OF_CANCER_RELATIVES",
      display_name: "Family History Of Cancer Relatives",
      status: false,
      error: false,
    },
    {
      table_name: "FOOD_HABITS_MASTER",
      display_name: "Food Habits Master",
      status: false,
      error: false,
    },
    {
      table_name: "FOOD_HABITS_FAT_USAGE",
      display_name: "Food Habits Fat Usage",
      status: false,
      error: false,
    },
    {
      table_name: "FOOD_RECALL_ENTRY",
      display_name: "Food Recall Entry",
      status: false,
      error: false,
    },
    {
      table_name: "FOOD_RECALL_INGREDIENT",
      display_name: "Food Recall Ingredient",
      status: false,
      error: false,
    },
  ],
};

export default function Tab3() {
  const { db, sqlite } = useSQLite();
  const [insertOrUpdatedRecords, setInsertOrUpdatedRecords] = useState<
    TABLE_INFO[]
  >([]);
  const [deletedRecords, setDeletedRecords] = useState<UNSYNC_RECORD[]>([]); //for this we only need to send id thats it!
  const [userInfos, setUserInfos] = useState<any[]>([]);
  const location = useLocation();
  const [pullState, setPullState] = useState(initialPullState);
  const [alert, setAlert] = useState({
    show: false,
    header: "",
    message: "",
  });
  const [pushing, setPushing] = useState(false);
  async function fetchUnsyncedRecords() {
    try {
      const res = await db?.query(`
             SELECT * FROM tracksync where synch = 0 OR synch = 2 or synch = 3
            `);
      const tracks = (res?.values as UNSYNC_RECORD[]) ?? [];
      const temp1 = tracks.filter(
        (track) => track.synch == 0 || track.synch == 2
      ); //here holds records which are either 0 or 2
      const temp2 = tracks.filter((track) => track.synch == 3); //here holds records which are 3
      //set deleted records
      setDeletedRecords(temp2);
      let records: any[] = [];
      //now fetch the records which are 0 or 2
      let existing: TABLE_INFO[] = [];
      for (const item of temp1) {
        const res = await db?.query(`
             SELECT * FROM ${item.table_name} where id = '${item.rowId}'
            `);
        const tableName = item.table_name; // replace with actual table name
        const newRecords = res?.values as any[];

        // check if table already exists
        let existingIndex = existing.findIndex(
          (item) => item.table_name === tableName
        );
        if (existingIndex === -1) {
          existing.push({
            table_name: tableName,
            table_data: newRecords,
          });
        } else {
          existing[existingIndex].table_data =
            existing[existingIndex].table_data.concat(newRecords);
        }
        records = records.concat(res?.values as any[]);
      }
      setInsertOrUpdatedRecords(existing);
      const ids = records.map((record) =>
        record?.user_id ? record.user_id : record.id
      );
      const q = `SELECT * FROM patients WHERE id IN (${ids
        .map((id) => `'${id}'`)
        .join(",")})`;
      const res2 = await db?.query(q);
      console.log(res, res2, q, existing);
      setUserInfos(res2?.values as any[]);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    setPullState(initialPullState);
    fetchUnsyncedRecords();
  }, [db, location.pathname]);
  console.log(insertOrUpdatedRecords, deletedRecords);
  const handlePush = async () => {
    try {
      setPushing(true);
      await PUSH_TO_CLOUD(insertOrUpdatedRecords, deletedRecords);
      const ids = Array.from(
        new Set(
          deletedRecords
            .map((record) => record.rowId)
            .concat(
              insertOrUpdatedRecords
                .map((record) => record.table_data.map((record) => record.id))
                .flat()
            )
        )
      );
      await db?.run(`
         UPDATE tracksync
         SET synch = 1
         WHERE rowId IN (${ids.map((id) => `'${id}'`).join(",")})
        `);
      await saveToStore(sqlite);
      setAlert({
        show: true,
        header: "Success",
        message: "Pushed Successfully",
      });
      setPushing(false);
      await fetchUnsyncedRecords();
    } catch (error: any) {
      setPushing(false);
      console.log(error);
      setAlert({
        show: true,
        header: "Error",
        message: error.toString(),
      });
    }
  };
  const handlePull = async () => {
    try {
      setPullState(initialPullState);
      if (insertOrUpdatedRecords.length > 0 || deletedRecords.length > 0)
        return setAlert({
          show: true,
          header: "Warning!",
          message:
            "You have made changes that needs to be synched to our cloud first!",
        });

      const pulled: TABLE_INFO[] = await PULL_FROM_CLOUD(setPullState, db);
      setPullState((prev) => ({ ...prev, applyingPatch: true }));
      for (const { table_name, table_data } of pulled) {
        console.log(`⬇️ Syncing table: ${table_name}`);
        if (table_name === "deletedRecords" && table_data.length > 0) {
          //delete from db
          let deleteQueries = table_data
            .map(
              (row) =>
                `DELETE FROM ${row.table_name} WHERE id = '${row.rowId}';`
            )
            .join(" ");
          await db?.execute(deleteQueries);
          continue;
        }
        if (!table_data || table_data.length === 0) continue;

        const statements: { statement: string; values: any[] }[] = [];
        for (const row of table_data) {
          const columns = Object.keys(row);
          const placeholders = columns.map(() => "?").join(",");
          const updateSet = columns
            .filter((col) => col !== "id")
            .map((col) => `${col} = excluded.${col}`)
            .join(", ");

          const query = `
          INSERT INTO ${table_name} (${columns.join(",")})
          VALUES (${placeholders})
          ON CONFLICT(id) DO UPDATE SET
          ${updateSet};
        `;

          const values = columns.map((col) => row[col]);
          statements.push({ statement: query, values });
        }

        try {
          // ✅ Execute all inserts/updates atomically (no manual BEGIN/COMMIT)
          await db?.executeSet(statements);
          console.log(`✅ Table ${table_name} synced successfully.`);
        } catch (err) {
          console.error(`❌ Error syncing table ${table_name}:`, err);
        }
      }
      setPullState((prev) => ({
        ...prev,
        appliedPatch: true,
        applyingPatch: false,
      }));
      for (const { table_data } of pulled) {
        await db?.run(
          `UPDATE  tracksync SET synch = 1 WHERE rowId in (${table_data
            .map((record) => `'${record.id}'`)
            .join(",")}) `
        );
      }
      await saveToStore(sqlite);
      const data: any = getPullState().data;
      if (data.every((table: any) => table.error)) {
        setAlert({
          show: true,
          header: "Failed",
          message: "None of the records pulled!",
        });
      } else if (data.some((table: any) => table.error)) {
        setAlert({
          show: true,
          header: "Partial Success",
          message: "Pulled Successfully",
        });
      } else {
        setAlert({
          show: true,
          header: "Success",
          message: "Pulled Successfully",
        });
      }
      setPullState(ps => ({ ...ps, show: false }))
    } catch (error: any) {
      console.log(error);
      setAlert({
        show: true,
        header: "Error",
        message: error,
      });
    }
  };

  const pullStateRef = useRef(pullState);
  useEffect(() => {
    pullStateRef.current = pullState;
  }, [pullState]);

  function getPullState() {
    return pullStateRef.current;
  }

  console.log(pullState);
  return (
    <IonPage>
      <Header title={"Sync Data"} />
      <IonContent class="" fullscreen>
        <main className="p-2 text-slate-600">
          <h1 className="text-xl font-semibold">Records to be synced!</h1>
          {insertOrUpdatedRecords.length == 0 && deletedRecords.length == 0 ? (
            <div className=" rounded flex mt-10 justify-center ">
              <p className="border-1 p-2 rounded text-emerald-500 border-emerald-500">
                No records to be synced
              </p>
            </div>
          ) : (
            <>
              <div className="mt-5 space-y-2">
                <div className="p-4 border border-orange-500 rounded-lg text-left shadow-sm">
                  <p className="text-base text-orange-700 font-semibold flex items-center gap-3">
                    <i className="pi pi-exclamation-triangle text-xl"></i>
                    <span>Data Status: **Sync Required** — Unsaved changes detected.</span>
                  </p>
                </div>
                <div>
                  <Button
                    label="Sync Now"
                    className="px-6 py-2"
                    onClick={handlePush}
                  />
                </div>
              </div>
            </>
          )}
          <div className="mt-10 flex justify-end">
            <Button
              label="Pull from cloud"
              severity="contrast"
              onClick={handlePull}
              disabled={pullState.show || pushing}
            />
            <Button
              label="Export Excel"
              severity="success"
              className="ml-2"
              onClick={async () => {
                try {
                  await exportToCSV(db);
                  setAlert({
                    show: true,
                    header: "Success",
                    message: "Exported Successfully",
                  });
                } catch (error) {
                  setAlert({
                    show: true,
                    header: "Error",
                    message: "Failed to export data",
                  });
                }
              }}
            />
          </div>
          {pushing && (
            <div className="mt-10 p-2 border-2 rounded text-emerald-500 border-emerald-500 text-center">
              We are synchronizing your data to cloud hang tight! . . .{" "}
            </div>
          )}
          {pullState.show && (
            <div className="mt-10 border-2 p-2 rounded">
              {pullState?.data?.map((table) => {
                let icon;
                let color;
                let text;

                if (table.error) {
                  // ❌ FAILED
                  icon = closeCircleOutline;
                  color = "danger";
                  text = `Failed to pull ${table.display_name}!`;
                } else if (table.status) {
                  // ✅ SUCCESS
                  icon = checkmarkCircleOutline;
                  color = "success";
                  text = `Pulled ${table.display_name} successfully!`;
                } else {
                  // ⏳ LOADING
                  icon = cloudDownloadOutline;
                  color = "primary";
                  text = `Pulling ${table.display_name} ...`;
                }

                return (
                  <div
                    key={table.table_name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <IonIcon
                      icon={icon}
                      color={color}
                      style={{ fontSize: 24, marginRight: 10 }}
                    />
                    <span
                      className={table.error ? "text-red-600 font-bold" : ""}
                    >
                      {text}
                    </span>
                  </div>
                );
              })}

              {pullState.applyingPatch && (
                <div className="border-t py-2 ">
                  <p>Please wait while pulled data is being patched...</p>
                </div>
              )}

              {pullState.appliedPatch && (
                <div className="border-t py-2 ">
                  <p className="flex items-center font-bold">
                    <IonIcon
                      icon={checkmarkCircleOutline}
                      color={"success"}
                      style={{ fontSize: 24, marginRight: 10 }}
                    />
                    Applied patches successfully!
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
        <IonAlert
          isOpen={alert.show}
          onDidDismiss={() => setAlert((a) => ({ ...a, show: false }))}
          header={alert.header}
          message={alert.message}
          buttons={["OK"]}
        />
      </IonContent>
      <div className="pb-[250px]"></div>
    </IonPage>
  );
}
