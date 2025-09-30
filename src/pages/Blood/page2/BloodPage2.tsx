import { IonAlert, IonContent, IonPage } from "@ionic/react";
import { useEffect, useState } from "react";
import Header from "../../../components/Header";
import { useLocation } from "react-router";
import { useSQLite } from "../../../utils/Sqlite";
import SampleCollectionType from "./SampleCollectionType";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import shortUUID from "short-uuid";
import { immerable } from "immer";
import { ErrorDetectionBloodSample, saveBloodSampleRecord } from "./helper";
import { Link } from "react-router-dom";
export interface BLOOD_SAMPLE_COLLECTION {
  blood_collection_tube: string;
  blood_collection_tube_other: string;
  identification_code_tube: string;
  volume: number;
  characteristic: string;
  id: string;
  blood_sample_id?: string;
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
  const [sampleId, setSampleId] = useState('');
  const { db, sqlite } = useSQLite();
  const [participant, setParticipants] = useState<any | null>(null);
  const [bloodSample, setBloodSample] = useState<BLOOD_SAMPLE>({
    id: shortUUID().generate(),
    user_id: id,
    date_collected: new Date().toString(),
    time_collected: new Date().toString(),
    last_meal_date: new Date().toString(),
    last_meal_time: new Date().toString(),
    received_blood_last_6_months: 2,
    sample_classification: "",
    is_sample_collected: 0,
    collection_tubes: [],
  });
  const [alert, setAlert] = useState({
    show: false,
    header: "",
    message: "",
  });
  useEffect(() => {
    const curId = searchParams.get("id") || "";
    setId(curId) ;
    const sampleId = searchParams.get("sampleId") || "";
    setBloodSample(prev => ({ ...prev, user_id: curId }))
    setSampleId(sampleId)
    if (!db) return;
    async function fetchCurrentUser() {
      try {
        console.log(sampleId)
        const query = `
                        select * from patients where id = '${curId}'
                    `;
        const query2 = `
         select * from blood_sample where id = '${sampleId}' ; 
        `
        const query3 = `
         select * from blood_tube_collection where blood_sample_id = '${sampleId}'
        `
        const res = await db?.query(query);
        setParticipants(res?.values?.[0]);
        const res1 = await db?.query(query2);
        const res2 = await db?.query(query3);
        if (!sampleId) {
          setBloodSample({
            id: shortUUID().generate(),
            user_id: curId,
            date_collected: new Date().toISOString(),
            time_collected: new Date().toISOString(),
            last_meal_date: new Date().toISOString(),
            last_meal_time: new Date().toISOString(),
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
              })
            ],
          })
        }
        console.log(res1, res2)
        if (res1?.values?.length == 0) return;

        setBloodSample(prev => ({
          ...prev,
          ...res1?.values?.[0],
          collection_tubes: res2?.values?.length == 0 ?
            [new BloodSample({
              blood_collection_tube: "",
              blood_collection_tube_other: "",
              identification_code_tube: "",
              volume: 0,
              characteristic: "",
              id: shortUUID().generate(),
            })]
            : res2?.values
        }))
      } catch (error) {
        console.log(error);
      }
    }
    fetchCurrentUser();
  }, [location.pathname, db]);
  const handleSave = async () => {
    try {
      const err = ErrorDetectionBloodSample(bloodSample);
      if (err) {
        return setAlert({
          header: 'Error',
          message: err,
          show: true
        })
      }
      await saveBloodSampleRecord(bloodSample, db, sqlite);
      setSampleId(bloodSample.id)
      setAlert({
        header: 'Success',
        show: true,
        message: 'Records saved!'
      })
    } catch (error) {
      console.log(error);
      setAlert({
        header: 'Error',
        message: "Something went wrong!",
        show: true
      })
    }
  };

  const addNewCollectionTube = () => {
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
    if (bloodSample.collection_tubes.length === 1) return;
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

  return (
    <>
      <IonPage>
        <Header title={"Blood sample report"} />
        <IonContent fullscreen>
          <main className="p-2">
            <div className="p-2 shadow border rounded text-slate-600">
              <p className="text-lg  font-semibold">Participant's details</p>
              <div>
                <span className="font-semibold">ID: </span>{" "}
                <span>{participant?.id}</span>
              </div>
              <div>
                <span className="font-semibold">Name: </span>{" "}
                <span>{participant?.name}</span>
              </div>
            </div>
            <div className="mt-10 p-2 py-5 shadow border rounded text-slate-600">
              <div className="flex items-center gap-5">
                <p className="font-semibold">Blood sample collected</p>
                <div className="flex gap-1">
                  <input
                    name="collected"
                    type="radio"
                    checked={bloodSample?.is_sample_collected ? true : false}
                    onChange={(e) => {
                      setBloodSample({
                        ...bloodSample,
                        is_sample_collected: e.target.checked ? 1 : 0,
                      });
                    }}
                  />
                  <p>YES</p>
                </div>
                <div className="flex gap-1">
                  <input
                    type="radio"
                    name="collected"
                    checked={!bloodSample?.is_sample_collected ? true : false}
                    onChange={(e) => {
                      setBloodSample({
                        ...bloodSample,
                        is_sample_collected: e.target.checked ? 0 : 1,
                      });
                    }}
                  />
                  <p>NO</p>
                </div>
              </div>
              {bloodSample.collection_tubes.map((item, index) => (
                <SampleCollectionType
                  addNewCollectionTube={addNewCollectionTube}
                  key={item.id}
                  data={item}
                  removeCollectionTube={removeCollectionTube}
                  setBloodSample={setBloodSample}
                  isSampleCollected={bloodSample.is_sample_collected === 1}
                />
              ))}

              <div>
                <p className="font-semibold">
                  Sample Classification (Please tick in the appropriate option)
                </p>
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <p>a. Category B(UN3373)[Non-Biohazard]</p>
                    <input
                      disabled={bloodSample.is_sample_collected === 0}
                      type="radio"
                      name="sample_classification"
                      value={"Category B(UN3373)[Non-Biohazard]"}
                      onChange={(e) => {
                        setBloodSample({
                          ...bloodSample,
                          sample_classification: e.target.checked
                            ? e.target.value
                            : "",
                        });
                      }}
                      checked={
                        bloodSample.sample_classification ===
                        "Category B(UN3373)[Non-Biohazard]"
                      }
                    />
                  </div>
                  <div className="flex gap-4">
                    <p>b. Category A(UN2814)[Biohazard]</p>
                    <input
                      disabled={bloodSample.is_sample_collected === 0}
                      type="radio"
                      name="sample_classification"
                      value={"Category A(UN2814)[Biohazard]"}
                      onChange={(e) => {
                        setBloodSample({
                          ...bloodSample,
                          sample_classification: e.target.checked
                            ? e.target.value
                            : "",
                        });
                      }}
                      checked={
                        bloodSample.sample_classification ===
                        "Category A(UN2814)[Biohazard]"
                      }
                    />
                  </div>
                  <div className="flex gap-4">
                    <p>c. Don't Know</p>
                    <input
                      disabled={bloodSample.is_sample_collected === 0}
                      type="radio"
                      name="sample_classification"
                      value={"Don't Know"}
                      onChange={(e) => {
                        setBloodSample({
                          ...bloodSample,
                          sample_classification: e.target.checked
                            ? e.target.value
                            : "",
                        });
                      }}
                      checked={
                        bloodSample.sample_classification === "Don't Know"
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex mt-10 gap-5 items-center">
                <p className="font-semibold">Date of blood sample collection</p>
                <Calendar
                  disabled={bloodSample.is_sample_collected === 0}
                  className="border-1 p-2 focus:outline-none p-2"
                  value={new Date(bloodSample?.date_collected)}
                  onChange={(e) =>
                    setBloodSample({
                      ...bloodSample,
                      date_collected: e.value?.toISOString() || "",
                    })
                  }
                  showIcon
                />
              </div>
              <div className="flex mt-10 gap-5 items-center">
                <p className="font-semibold">Time of blood sample collection</p>
                <div>
                  <Calendar
                    disabled={bloodSample.is_sample_collected === 0}
                    value={new Date(bloodSample?.time_collected)}
                    onChange={(e) => {
                      setBloodSample({
                        ...bloodSample,
                        time_collected: e.value?.toISOString() || "",
                      });
                    }}
                    timeOnly
                    hourFormat="12"
                  />
                </div>
              </div>
              <div className="mt-10 space-y-2">
                <p className="font-semibold">
                  Date and Time of last meal subject had before blood sample
                  collection
                </p>
                <div className="flex gap-5 items-center">
                  <p>Date</p>
                  <Calendar
                    disabled={bloodSample.is_sample_collected === 0}
                    className="border-1 p-2 focus:outline-none p-2"
                    showIcon
                    value={new Date(bloodSample?.last_meal_date)}
                    onChange={(e) =>
                      setBloodSample({
                        ...bloodSample,
                        last_meal_date: e.value?.toISOString() || "",
                      })
                    }
                  />
                </div>
                <div className="flex gap-5 items-center">
                  <p>Time</p>
                  <div className="flex gap-1">
                    <Calendar
                      disabled={bloodSample.is_sample_collected === 0}
                      value={new Date(bloodSample?.last_meal_time)}
                      onChange={(e) => {
                        setBloodSample({
                          ...bloodSample,
                          last_meal_time: e.value?.toISOString() || "",
                        });
                      }}
                      timeOnly
                      hourFormat="12"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <p className="font-semibold">
                  If you have received blood from donor in the last six month?
                </p>
                <div className="flex gap-4">
                  <div className="flex gap-2">
                    <input
                      disabled={bloodSample.is_sample_collected === 0}
                      type="radio"
                      name="last"
                      value={1}
                      checked={bloodSample.received_blood_last_6_months === 1}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBloodSample({
                            ...bloodSample,
                            received_blood_last_6_months: parseInt(
                              e.target.value
                            ),
                          });
                        }
                      }}
                    />
                    <p>YES</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      disabled={bloodSample.is_sample_collected === 0}
                      type="radio"
                      value={2}
                      checked={bloodSample.received_blood_last_6_months === 2}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBloodSample({
                            ...bloodSample,
                            received_blood_last_6_months: parseInt(
                              e.target.value
                            ),
                          });
                        }
                      }}
                    />
                    <p>NO</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      disabled={bloodSample.is_sample_collected === 0}
                      type="radio"
                      value={8}
                      checked={bloodSample.received_blood_last_6_months === 8}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBloodSample({
                            ...bloodSample,
                            received_blood_last_6_months: parseInt(
                              e.target.value
                            ),
                          });
                        }
                      }}
                    />
                    <p>Don't Know</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      disabled={bloodSample.is_sample_collected === 0}
                      type="radio"
                      value={9}
                      checked={bloodSample.received_blood_last_6_months === 9}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBloodSample({
                            ...bloodSample,
                            received_blood_last_6_months: parseInt(
                              e.target.value
                            ),
                          });
                        }
                      }}
                    />
                    <p>Refused to answer</p>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <Button
                  disabled={bloodSample.is_sample_collected === 0}
                  label="SAVE"
                  severity="success"
                  className="px-10 py-2 rounded-full"
                  onClick={handleSave}
                />
              </div>

              <div className="flex justify-end gap-2 mt-10">
                <Link to='/blood1'>
                  <Button label="PREV" className="px-10 py-2 rounded" />
                </Link>
                <Link to={`/blood3?id=${id}&sampleId=${bloodSample?.id}`}>
                  <Button label="NEXT" className="px-10 py-2 rounded" />
                </Link>
              </div>

            </div>
          </main>
          <IonAlert
            isOpen={alert.show}
            onDidDismiss={() => setAlert((a) => ({ ...a, show: false }))}
            header={alert.header}
            message={alert.message}
            buttons={["OK"]}
          />
        </IonContent>
      </IonPage>
    </>
  );
}
