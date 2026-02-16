import {
  IonAlert,
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
} from "@ionic/react";
import { useEffect, useState } from "react";
import Header from "../../../components/Header";
import { useHistory, useLocation } from "react-router";
import { useSQLite } from "../../../utils/Sqlite";
import SampleCollectionType from "./SampleCollectionType";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import shortUUID from "short-uuid";
import { immerable } from "immer";
import { ErrorDetectionBloodSample, saveBloodSampleRecord } from "./helper";
import { Link } from "react-router-dom";
import { checkElibleToSave } from "../../Registration/Tab11/data";
import { saveToStore } from "../../../utils/helper";
import ShowRegisteredTab from "../../../components/ShowRegisteredTab";
import { Card } from "primereact/card";
import { RadioButton } from "primereact/radiobutton";
import { Fieldset } from "primereact/fieldset";
import { set } from "date-fns";
import { useBlockNavigation } from "../../../utils/blockBackNavigation";
export interface BLOOD_SAMPLE_COLLECTION {
  blood_collection_tube: string;
  blood_collection_tube_other: string;
  identification_code_tube: string;
  volume: number;
  characteristic: string;
  id: string;
  blood_sample_id?: string;
  user_id?: string;
}

export interface BLOOD_SAMPLE {
  id: string;
  user_id: string; //user_id
  date_collected: string;
  time_collected: string;
  last_meal_date: string;
  last_meal_time: string;
  received_blood_last_6_months: number; //0  or 1
  sample_classification: string;
  is_sample_collected: number; //0 or 1
  collection_tubes: BLOOD_SAMPLE_COLLECTION[];
}

class BloodSample implements BLOOD_SAMPLE_COLLECTION {
  blood_collection_tube: string = "";
  blood_collection_tube_other: string = "";
  identification_code_tube: string = "";
  volume: number = 0;
  characteristic: string = "";
  id: string = "";
  user_id?: string | undefined = "";
  [immerable] = true;
  constructor(init?: Partial<BLOOD_SAMPLE_COLLECTION>) {
    Object.assign(this, { ...this, ...init });
  }
  // You can add methods here if needed
}

export default function BloodPage2() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [id, setId] = useState("");
  const [sampleId, setSampleId] = useState("");
  const { db, sqlite, tabId } = useSQLite();
  const [participant, setParticipants] = useState<any | null>(null);
  const [editFlag, setEditFlag] = useState(false);
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [allowNext, setAllowNext] = useState(false);
  const [bloodSample, setBloodSample] = useState<BLOOD_SAMPLE>({
    id: shortUUID().generate(),
    user_id: id,
    date_collected: new Date().toLocaleString("sv-SE").replace("T", " "),
    time_collected: new Date().toLocaleString("sv-SE").replace("T", " "),
    last_meal_date: new Date().toLocaleString("sv-SE").replace("T", " "),
    last_meal_time: new Date().toLocaleString("sv-SE").replace("T", " "),
    received_blood_last_6_months: 2,
    sample_classification: "",
    is_sample_collected: 0,
    collection_tubes: [],
  });
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [alert, setAlert] = useState({
    show: false,
    header: "",
    message: "",
  });
  const history = useHistory();
  async function fetchCurrentUser(curId: string, sampleId: string) {
    try {
      console.log(sampleId);
      const query = `
                        select * from patients where id = '${curId}'
                    `;
      const query2 = `
         select * from blood_sample where id = '${sampleId}' ; 
        `;
      const query3 = `
         select * from blood_tube_collection where blood_sample_id = '${sampleId}'
        `;
      const res = await db?.query(query);
      setParticipants(res?.values?.[0]);
      const res1 = await db?.query(query2);
      const res2 = await db?.query(query3);
      if (!sampleId) {
        setBloodSample({
          id: shortUUID().generate(),
          user_id: curId,
          date_collected: new Date().toLocaleString("sv-SE").replace("T", " "),
          time_collected: new Date().toLocaleString("sv-SE").replace("T", " "),
          last_meal_date: new Date().toLocaleString("sv-SE").replace("T", " "),
          last_meal_time: new Date().toLocaleString("sv-SE").replace("T", " "),
          received_blood_last_6_months: 2,
          sample_classification: "",
          is_sample_collected: 0,
          collection_tubes: [
            new BloodSample({
              blood_collection_tube: "",
              blood_collection_tube_other: "",
              identification_code_tube: "",
              volume: 0,
              characteristic: "",
              id: shortUUID().generate(),
              user_id: curId,
            }),
          ],
        });
      }
      console.log(res1, res2);
      if (res1?.values?.length == 0) return;
      setAllowNext(true);
      setBloodSample((prev) => ({
        ...prev,
        ...res1?.values?.[0],

        collection_tubes:
          res2?.values?.length == 0
            ? [
              new BloodSample({
                blood_collection_tube: "",
                blood_collection_tube_other: "",
                identification_code_tube: "",
                volume: 0,
                characteristic: "",
                id: shortUUID().generate(),
                user_id: curId,
              }),
            ]
            : res2?.values,
      }));
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    const curId = searchParams.get("id") || "";
    const edit = searchParams.get("edit") || "";
    setId(curId);
    const sampleId = searchParams.get("sampleId") || "";
    if (edit === "yes") setEditFlag(true);
    setBloodSample((prev) => ({ ...prev, user_id: curId }));
    setSampleId(sampleId);
    if (!db) return;

    fetchCurrentUser(curId, sampleId);
  }, [location.pathname, db]);

  useBlockNavigation(isUnsaved, () => {
    setAlert({
      show: true,
      header: "Unsaved Changes",
      message: "You have unsaved changes. Please save before navigating away.",
    });
  });

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    const curId = searchParams.get("id") || "";
    const sampleId = searchParams.get("sampleId") || "";
    await fetchCurrentUser(curId, sampleId);
    setIsUnsaved(false);
    event.detail.complete();
  };


  const handleSave = async () => {
    try {
      if (
        db &&
        sampleId &&
        editFlag &&
        !(await checkElibleToSave(db, sampleId || "", tabId, "blood_sample"))
      ) {
        return setAlert({
          header: "Restricted access",
          message: "This user was registered with a different tab id.",
          show: true,
        });
      }
      const err = ErrorDetectionBloodSample(bloodSample);
      if (err) {
        return setAlert({
          header: "Error",
          message: err,
          show: true,
        });
      }
      await saveBloodSampleRecord(bloodSample, db, sqlite, tabId);
      console.log(removedIds);
      for (const removedId of removedIds) {
        await db?.run(
          `delete from blood_tube_collection where id = '${removedId}'`
        );
      }
      history.replace({
        pathname: location.pathname,
        search: `id=${id}&sampleId=${bloodSample.id}`,
      });
      await saveToStore(sqlite);
      setSampleId(bloodSample.id);
      setAllowNext(true);
      setIsUnsaved(false);
      setAlert({
        header: "Success",
        show: true,
        message: "Records saved!",
      });

    } catch (error) {
      console.log(error);
      setAlert({
        header: "Error",
        message: "Something went wrong!",
        show: true,
      });
    }
  };

  const addNewCollectionTube = () => {
    if (bloodSample.collection_tubes.length >= 1) setIsUnsaved(true);
    const translator = shortUUID();
    const newSample = new BloodSample({
      blood_collection_tube: "",
      blood_collection_tube_other: "",
      identification_code_tube: "",
      volume: 0,
      characteristic: "",
      id: translator.generate(),
    });
    setBloodSample((prev) => ({
      ...prev,
      collection_tubes: [...prev.collection_tubes, newSample],
    }));
  };
  const removeCollectionTube = (id: string) => {
    setIsUnsaved(true);
    if (bloodSample.collection_tubes.length === 1) return;
    setRemovedIds((prev) => [...prev, id]);
    const updatedTubes = bloodSample.collection_tubes.filter(
      (tube) => tube.id !== id
    );
    setBloodSample((prev) => ({
      ...prev,
      collection_tubes: updatedTubes,
    }));
  };

  useEffect(() => {
    if (bloodSample.collection_tubes.length > 0) return;
    addNewCollectionTube();
  }, [location.pathname]);
  console.log(bloodSample);
  return (
    <>
      <IonPage>
        <Header title={"Blood sample report"} />
        <IonContent fullscreen>
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent
              className="spinner-only"
              refreshingSpinner="circles"
            />
          </IonRefresher>
          <ShowRegisteredTab id={sampleId || ""} table_name="blood_sample" />
          {/* Use p-3 or p-4 for better spacing on mobile and desktop */}
          <main className="p-3 md:p-4">
            {/* --- 1. Replaced simple div with a Card --- */}
            <Card title="Participant's Details" className="shadow border">
              <div className="text-slate-600 dark:text-gray-300 space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold">ID: </span>
                  <span>{participant?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Name: </span>
                  <span>{participant?.name}</span>
                </div>
              </div>
            </Card>

            {/* --- 2. Replaced main form div with a Card --- */}
            <Card className="mt-4 shadow border">
              {/* Use space-y-8 for better separation of sections */}
              <div className="p-fluid space-y-8">
                {/* --- 3. Blood Sample Collected Radios --- */}
                <div className="flex items-center gap-5 flex-wrap">
                  <p className="font-semibold text-slate-600 dark:text-gray-300">
                    Blood sample collected
                  </p>
                  <div className="flex align-items-center gap-2">
                    <RadioButton
                      inputId="collected_yes"
                      name="collected"
                      value={1}
                      checked={bloodSample?.is_sample_collected === 1}
                      onChange={(e) => {
                        // Logic is unchanged, just using e.value
                        setIsUnsaved(true);
                        setBloodSample({
                          ...bloodSample,
                          is_sample_collected: e.checked ? 1 : 0,
                        });
                      }}
                    />
                    <label htmlFor="collected_yes">YES</label>
                  </div>
                  <div className="flex align-items-center gap-2">
                    <RadioButton
                      inputId="collected_no"
                      name="collected"
                      value={0}
                      checked={bloodSample?.is_sample_collected === 0}
                      onChange={(e) => {
                        setIsUnsaved(true);
                        setBloodSample({
                          ...bloodSample,
                          is_sample_collected: e.checked ? 0 : 1,
                        });
                      }}
                    />
                    <label htmlFor="collected_no">NO</label>
                  </div>
                </div>

                {/* This section is unchanged as it's a custom component */}
                {bloodSample?.collection_tubes.map((item, index) => (
                  <SampleCollectionType
                    addNewCollectionTube={addNewCollectionTube}
                    key={item.id}
                    data={item}
                    removeCollectionTube={removeCollectionTube}
                    setBloodSample={setBloodSample}
                    isSampleCollected={bloodSample?.is_sample_collected === 1}
                    setIsUnsaved={setIsUnsaved}
                  />
                ))}

                {/* --- 4. Used Fieldset for Sample Classification --- */}
                <Fieldset legend="Sample Classification (Please tick in the appropriate option)">
                  <div className="space-y-4 mt-2">
                    {[
                      {
                        label: "a. Category B(UN3373)[Non-Biohazard]",
                        value: "Category B(UN3373)[Non-Biohazard]",
                      },
                      {
                        label: "b. Category A(UN2814)[Biohazard]",
                        value: "Category A(UN2814)[Biohazard]",
                      },
                      { label: "c. Don't Know", value: "Don't Know" },
                    ].map((option) => (
                      <div
                        key={option.value}
                        className="flex align-items-center gap-3"
                      >
                        <RadioButton
                          inputId={option.value}
                          disabled={bloodSample?.is_sample_collected === 0}
                          type="radio"
                          name="sample_classification"
                          value={option.value}
                          onChange={(e) => {
                            setIsUnsaved(true);
                            setBloodSample({
                              ...bloodSample,
                              sample_classification: e.checked ? e.value : "",
                            });
                          }}
                          checked={
                            bloodSample?.sample_classification === option.value
                          }
                        />
                        <label
                          htmlFor={option.value}
                          className="text-slate-600 dark:text-gray-300"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </Fieldset>

                {/* --- 5. Used Fieldset for Collection Date & Time --- */}
                <Fieldset legend="Collection Date & Time">
                  <div className="p-fluid grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-slate-600 dark:text-gray-300">
                        Date of blood sample collection
                      </label>
                      <Calendar
                        appendTo="self"
                        disabled={bloodSample?.is_sample_collected === 0}
                        // Removed custom border/padding classes
                        value={
                          bloodSample?.date_collected
                            ? new Date(bloodSample.date_collected)
                            : null
                        }
                        onChange={(e) => {
                          setIsUnsaved(true);
                          setBloodSample({
                            ...bloodSample,
                            date_collected:
                              e.value
                                ?.toLocaleString("sv-SE")
                                .replace("T", " ") || "",
                          });
                        }}
                        showIcon
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-slate-600 dark:text-gray-300">
                        Time of blood sample collection
                      </label>
                      <Calendar
                        appendTo="self"
                        disabled={bloodSample?.is_sample_collected === 0}
                        value={
                          bloodSample?.time_collected
                            ? new Date(bloodSample.time_collected)
                            : null
                        }
                        onChange={(e) => {
                          setIsUnsaved(true);
                          setBloodSample({
                            ...bloodSample,
                            time_collected:
                              e.value
                                ?.toLocaleString("sv-SE")
                                .replace("T", " ") || "",
                          });
                        }}
                        timeOnly
                        hourFormat="12"
                        showIcon
                      />
                    </div>
                  </div>
                </Fieldset>

                {/* --- 6. Used Fieldset for Last Meal Details --- */}
                <Fieldset legend="Date and Time of last meal subject had before blood sample collection">
                  <div className="p-fluid grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-slate-600 dark:text-gray-300">
                        Date
                      </label>
                      <Calendar
                        appendTo="self"
                        disabled={bloodSample?.is_sample_collected === 0}
                        // Removed custom border/padding classes
                        showIcon
                        value={
                          bloodSample?.last_meal_date
                            ? new Date(bloodSample.last_meal_date)
                            : null
                        }
                        onChange={(e) => {
                          setIsUnsaved(true);
                          setBloodSample({
                            ...bloodSample,
                            last_meal_date:
                              e.value
                                ?.toLocaleString("sv-SE")
                                .replace("T", " ") || "",
                          });
                        }}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-slate-600 dark:text-gray-300">
                        Time
                      </label>
                      <Calendar
                        appendTo="self"
                        disabled={bloodSample?.is_sample_collected === 0}
                        value={
                          bloodSample?.last_meal_time
                            ? new Date(bloodSample.last_meal_time)
                            : null
                        }
                        onChange={(e) => {
                          setIsUnsaved(true);
                          setBloodSample({
                            ...bloodSample,
                            last_meal_time:
                              e.value
                                ?.toLocaleString("sv-SE")
                                .replace("T", " ") || "",
                          });
                        }}
                        timeOnly
                        hourFormat="12"
                        showIcon
                      />
                    </div>
                  </div>
                </Fieldset>

                {/* --- 7. Used Fieldset for Blood Donation History --- */}
                <Fieldset legend="If you have received blood from donor in the last six month?">
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {[
                      { label: "YES", value: 1 },
                      { label: "NO", value: 2 },
                      { label: "Don't Know", value: 8 },
                      { label: "Refused to answer", value: 9 },
                    ].map((option) => (
                      <div
                        key={option.value}
                        className="flex align-items-center gap-2"
                      >
                        <RadioButton
                          inputId={`received_blood_${option.value}`}
                          disabled={bloodSample?.is_sample_collected === 0}
                          type="radio"
                          name="last"
                          value={option.value}
                          checked={
                            bloodSample?.received_blood_last_6_months ===
                            option.value
                          }
                          onChange={(e) => {
                            setIsUnsaved(true);
                            if (e.checked) {
                              setBloodSample({
                                ...bloodSample,
                                received_blood_last_6_months: parseInt(e.value),
                              });
                            }
                          }}
                        />
                        <label htmlFor={`received_blood_${option.value}`}>
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </Fieldset>

                {/* --- 8. Cleaned up Button Styles --- */}
                <div className="mt-5">
                  <Button
                    disabled={bloodSample?.is_sample_collected === 0}
                    label="SAVE"
                    icon="pi pi-check" // Added icon
                    severity="success"
                    raised // Added emphasis
                    onClick={handleSave}
                    type="button"
                  />
                </div>

                <div className="flex justify-between gap-2 mt-10">
                  <Link to="/blood-landing">
                    <Button
                      label="PREV"
                      icon="pi pi-arrow-left" // Added icon
                      severity="secondary" // De-emphasized
                      outlined
                    />
                  </Link>
                  {
                    allowNext &&
                    <Link
                      to={`/blood3?id=${id}&sampleId=${bloodSample?.id}&edit=${editFlag ? "yes" : "no"
                        }`}
                    >
                      <Button
                        label="NEXT"
                        icon="pi pi-arrow-right" // Added icon
                        iconPos="right"
                      />
                    </Link>
                  }
                </div>
              </div>
            </Card>
          </main>
          <IonAlert
            isOpen={alert?.show}
            onDidDismiss={() => setAlert((a) => ({ ...a, show: false }))}
            header={alert?.header}
            message={alert?.message}
            buttons={["OK"]}
          />

          {/* --- 9. Moved Spacer Div INSIDE IonContent --- */}
          <div className="pb-[250px]"></div>
        </IonContent>

        {/* The spacer div was incorrectly here */}
      </IonPage>
    </>
  );
}
