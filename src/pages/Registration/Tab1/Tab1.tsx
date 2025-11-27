// src/pages/Tab1.tsx
import React, { useEffect, useRef, useState } from "react";
import { App } from "@capacitor/app";
import { InputText } from "primereact/inputtext";
import {
  IonContent,
  IonPage,
  IonAlert,
  useIonRouter,
  useIonViewWillEnter,
  useIonViewWillLeave,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
} from "@ionic/react";
import { format, isValid, parse, set } from "date-fns";

import "./Tab1.css";
import { useForm, Controller, SubmitHandler } from "react-hook-form";

import { Geolocation } from "@capacitor/geolocation";
import Header from "../../../components/Header";
import { useSQLite } from "../../../utils/Sqlite";
import { generateUniqueId, saveToStore } from "../../../utils/helper";
import { useHistory, useLocation } from "react-router";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { RadioButton } from "primereact/radiobutton";
import { Calendar } from "primereact/calendar";
import RenderError from "../../../components/RenderError";
import { Link } from "react-router-dom";
import { checkElibleToSave } from "../Tab11/data";
import ShowRegisteredTab from "../../../components/ShowRegisteredTab";
import SignaturePad, { roundPoint } from "./SignaturePad";
import { PluginListenerHandle } from "@capacitor/core";
import { Card } from "primereact/card";
import { useBlockNavigation } from "../../../utils/blockBackNavigation";

import { card } from "ionicons/icons";
import VerificationCard from "./UserVerificationCard";
import LocationEditor from "./LocationEditor";
import RegistrationCrumbs from "../../../components/RegistrationCrumbs";
interface Patient {
  id?: string;
  name: string;
  age: number;
  gender: string;
  lat: number;
  long: number;
  place: string;
  i_name: string;
  i_emp_code: string;
  dob: string;
  tab_id?: string;
}

const employeeNameOptions = [
  { name: "Ampi Landi", value: "Ampi Lamdi" },
  { name: "Miyum Tally", value: "Miyum Tally" },
];

const employeeCodeOptions = [
  { name: "146681", value: "146681" },
  { name: "146682", value: "146682" },
];

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

/**
 * --- 2. Create a Reusable Form Field Component ---
 * This component wraps the Controller and error message logic,
 * making the main form *much* cleaner.
 */
const ControlledFormField = ({ name, control, rules, errors, render }: any) => (
  <div className="w-full">
    <Controller name={name} control={control} rules={rules} render={render} />
    {errors[name] && <RenderError text={errors[name].message?.toString()} />}
  </div>
);

const Tab1: React.FC = () => {
  const [patient, setPatient] = useState<Patient>({
    id: "",
    name: "",
    age: 0,
    gender: "",
    lat: 0,
    long: 0,
    place: "",
    i_name: "",
    i_emp_code: "",
    dob: "",
  });
  const [id, setId] = useState<string | null>(null);
  const [editFlag, setEditFlag] = useState<string | null>(null);
  const location = useLocation();
  const { db, sqlite, tabId } = useSQLite();
  const listenerHandle = useRef<PluginListenerHandle | null>(null);
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    header: "",
    message: "",
  });
  const history = useHistory();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    formState,
    watch,
    reset,
    getValues,
  } = useForm({
    values: {
      i_name: patient.i_name,
      i_emp_code: patient.i_emp_code,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      dob: patient.dob,
    },
  });
  const [strokes, setStrokes] = useState<number[][][]>([]);
  const [cardType, setCardType] = useState<string>("");
  const [cardInput, setCardInput] = useState<string>("");
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useIonRouter();
  const searchParams = new URLSearchParams(location.search);
  useIonViewWillEnter(() => {
    const registerListener = async () => {
      // AWAIT the promise to get the actual handle
      listenerHandle.current = await App.addListener(
        "appStateChange",
        (state) => {
          if (!state.isActive) {
            router.push("/tab2");
          }
        }
      );
    };

    // Call the async function to register the listener
    registerListener();
  });
  useBlockNavigation(formState.isDirty || isUnsaved, () => {
    setAlert({
      show: true,
      header: "Unsaved changes",
      message: "You have unsaved changes. Are you sure you want to leave?",
    });
  });
  // This hook fires EVERY time the user navigates AWAY from this tab
  useIonViewWillLeave(() => {
    // Remove the specific listener when the user leaves this tab
    if (listenerHandle.current) {
      listenerHandle.current.remove();
      listenerHandle.current = null;
    }
  });
  //below checks if this is for edit purpose
  async function fetchPatient(id: string) {
    try {
      const res = await db?.query("select * from patients where id = ?", [id]);
      console.log("ARE U HAVING TRABALS", res);
      if ((res as any)?.values?.length > 0) {
        setPatient((res as any)?.values[0]);
        if (res?.values && res?.values[0]?.signature) {
          setStrokes(JSON.parse(res?.values[0]?.signature));
          setCardInput(res?.values[0]?.card_no);
          setCardType(res?.values[0]?.card_type);
          setIsDisabled(res?.values[0]?.tab_id !== tabId);
        }
      }
      reset((res as any)?.values[0]);
    } catch (error) { }
  }
  useEffect(() => {
    const id = searchParams.get("id");
    const flag = searchParams.get("edit");
    setId(id);
    setEditFlag(flag);

    if (!db) return;
    console.log(id);
    if (!id) {
      setPatient({
        id: "",
        name: "",
        age: 0,
        gender: "",
        lat: 0,
        long: 0,
        place: "",
        i_emp_code: "",
        i_name: "",
        dob: "",
      });
      setStrokes([]);
      setCardInput("");
      setCardType("");
      return;
    }
    reset(patient);
    fetchPatient(id);

    //signature stuff
  }, [location.search, db]);

  const savePatient = async (data: any) => {
    if (!patient.lat) {
      setAlert((a) => ({
        ...a,
        show: true,
        header: "Missing fields",
        message: "Please select co-ordinate",
      }));
      return;
    }
    if (strokes.length === 0) {
      setAlert((a) => ({
        ...a,
        show: true,
        header: "Missing fields",
        message: "Please draw signature",
      }));
      return;
    }
    if (!cardType || !cardInput) {
      setAlert((a) => ({
        ...a,
        show: true,
        header: "Missing fields",
        message: "Please enter card details",
      }));
      return;
    }
    if (id) {
      // Update
      if (db && !(await checkElibleToSave(db, id, tabId))) {
        return setAlert({
          header: "Restricted access",
          message: "This user was registered with a different tab id.",
          show: true,
        });
      }
      if (patient.tab_id !== tabId) {
        return setAlert({
          show: true,
          header: "Error",
          message: "Tab Id mismatch. Please contact admin.",
        });
      }

      await db?.run(
        `UPDATE patients SET name = ?,  gender = ? , i_name = ? , 
         i_emp_code = ? , lat = ? , long = ?,
         DOB = ? , updated_at = ? , signature = ? , card_type = ? , card_no = ? , updated_at = ?
         WHERE id = ?`,
        [
          data.name,
          data.gender,
          data.i_name,
          data.i_emp_code,
          patient.lat,
          patient.long,
          format(data.dob, "yyyy-MM-dd"),
          format(new Date(), "yyyy-MM-dd HH:mm:ss.SSS"),
          JSON.stringify(strokes.map((stroke) => stroke.map(roundPoint))),
          cardType,
          cardInput,
          format(new Date(), "yyyy-MM-dd HH:mm:ss.SSS"),
          id,
        ]
      );
      setIsUnsaved(false);
      reset(getValues(), { keepDirty: false });
      await saveToStore(sqlite);
      setAlert((a) => ({
        ...a,
        show: true,
        header: "Success",
        message: "Updated successfully",
      }));
    } else {
      // Insert
      const uniqueId = generateUniqueId();
      await db?.run(
        `INSERT INTO patients (id, i_name, i_emp_code, name,  gender,
         lat, long, time, dob, date , created_at , updated_at , tab_id,signature , card_type , card_no)
         VALUES (?,?, ?, ?,?,?,?,?,?,?,?,?,? , ?,?,? )`,
        [
          uniqueId,
          data.i_name,
          data.i_emp_code,
          data.name,
          data.gender,
          patient.lat,
          patient.long,
          format(new Date(), "h:mm a"),
          format(data.dob, "yyyy-MM-dd"),
          format(new Date(), "yyyy-MM-dd"),
          format(new Date(), "yyyy-MM-dd HH:mm:ss.SSS"),
          format(new Date(), "yyyy-MM-dd HH:mm:ss.SSS"),
          tabId,
          JSON.stringify(strokes.map((stroke) => stroke.map(roundPoint))),
          cardType,
          cardInput,
        ]
      );
      const params = new URLSearchParams(location.search);
      params.set("id", uniqueId); // add or update
      history.replace({
        pathname: location.pathname,
        search: params.toString(),
      });
      setIsUnsaved(false);
      reset(getValues(), { keepDirty: false });
      await saveToStore(sqlite);
      setAlert((a) => ({
        ...a,
        show: true,
        header: "Success",
        message: "Added successfully",
      }));
      setId(uniqueId);
    }
  };


  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    const currentId = searchParams?.get("id") || "";

    await fetchPatient(currentId);
    setIsUnsaved(false);
    event.detail.complete();
  };
  const onSubmit = (data: any) => {
    console.log(data);
    savePatient(data);
  };
  console.log(isUnsaved);
  return (
    <IonPage>
      <Header title={id ? "Edit participants" : "Register Participant"} />
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            className="spinner-only"
            refreshingSpinner="circles"
          />
        </IonRefresher>
        <RegistrationCrumbs
          currentPageLabel="Registration"
        />
        <ShowRegisteredTab id={id || ""} />

        {/* Use a <form> tag for semantics, but let the <Card> do the styling.
          The submit handler is on the <form> tag.
        */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card
            title={id ? "Participant Details" : "New Participant Registration"}
            className="m-3"
          >
            {/* 'p-fluid' makes inputs full-width.
              'gap-6' is a more reasonable spacing than 'gap-10'.
            */}
            <div className="p-fluid flex flex-col gap-6">
              {/* --- 1. Employee Name Dropdown --- */}
              <ControlledFormField
                name="i_name"
                control={control}
                errors={errors}
                rules={{ required: "Employee name field is required" }}
                render={({ field }: any) => (
                  <FloatLabel>
                    <Dropdown
                      disabled={isDisabled}
                      {...field}
                      options={employeeNameOptions}
                      optionLabel="name"
                      optionValue="value"
                      className="w-full"
                    />
                    <label>Select employee name</label>
                  </FloatLabel>
                )}
              />

              {/* --- 2. Employee Code Dropdown --- */}
              <ControlledFormField
                name="i_emp_code"
                control={control}
                errors={errors}
                rules={{ required: "Employee code is required" }}
                render={({ field }: any) => (
                  <FloatLabel>
                    <Dropdown
                      disabled={isDisabled}
                      {...field}
                      options={employeeCodeOptions}
                      optionLabel="name"
                      optionValue="value"
                      className="w-full"
                    />
                    <label>Select employee code</label>
                  </FloatLabel>
                )}
              />

              {/* --- 3. Coordinates Section --- */}
              <LocationEditor
                patient={patient}
                setPatient={setPatient}
                setIsUnsaved={setIsUnsaved}
                isDisabled={isDisabled}
              />

              {/* --- 4. Participant Name --- */}
              <ControlledFormField
                name="name"
                control={control}
                errors={errors}
                rules={{ required: "Name is required" }}
                render={({ field }: any) => (
                  <FloatLabel>
                    <InputText {...field} className="w-full" disabled={isDisabled} />
                    <label>Participant's name</label>
                  </FloatLabel>
                )}
              />

              {/* --- 5. Gender Radio Group --- */}
              <ControlledFormField
                name="gender"
                control={control}
                errors={errors}
                rules={{ required: "Gender is required" }}
                render={({ field }: any) => (
                  <div className="border border-gray-300 rounded-md p-3">
                    <p className="font-medium mb-3">Select Gender</p>
                    <div className="flex flex-wrap gap-4">
                      {genderOptions.map((option) => (
                        <div
                          key={option.value}
                          className="flex align-items-center"
                        >
                          {/* Use the PrimeReact <RadioButton> */}
                          <RadioButton
                            disabled={isDisabled}
                            inputId={option.value}
                            name="gender"
                            value={option.value}
                            onChange={field.onChange}
                            checked={field.value === option.value}
                          />
                          <label htmlFor={option.value} className="ml-2">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              />

              {/* --- 7. Date of Birth --- */}
              <ControlledFormField
                name="dob"
                control={control}
                errors={errors}
                rules={{ required: "Date of birth is required" }}
                render={({ field: { onChange, value } }: any) => (
                  <FloatLabel>
                    <Calendar
                      disabled={isDisabled}
                      value={value ? new Date(value) : null}
                      onChange={onChange}
                      showIcon
                      className="w-full"
                    />
                    <label>Date of Birth</label>
                  </FloatLabel>
                )}
              />
              {/* choose id validation methods  */}
              <VerificationCard
                selectedInput={cardInput}
                selectedType={cardType || ""}
                setSelectedInput={setCardInput}
                setSelectedType={setCardType}
                setIsUnsave={setIsUnsaved}
                isDisabled={isDisabled}
              />
              {/* --- 8. Signature Pad --- */}
              <div className="flex flex-col gap-2">
                <label className="font-medium">Participant's Signature</label>
                <SignaturePad
                  strokes={strokes}
                  setStrokes={setStrokes}
                  setIsUnsaved={setIsUnsaved}
                  viewMode={isDisabled}
                />
                <div className="flex justify-end">
                  <Button
                    disabled={isDisabled}
                    label="Clear"
                    severity="warning"
                    type="button"
                    onClick={() => {
                      if (strokes.length === 0) {
                        return;
                      }
                      setShowConfirm(true);
                    }}
                    text // Use a 'text' button for a cleaner look
                    raised
                  />
                </div>
              </div>

              {/* --- 9. Save Button --- */}
              <Button
                disabled={isDisabled}
                label={id ? "Update Participant" : "Save Participant"}
                type="submit"
                icon="pi pi-check"
                size="large" // Make the primary action pop
              />
            </div>
          </Card>
        </form>

        {/* --- "Next" Button (Outside the Card, but still in IonContent) --- */}
        {id && (
          <div className="flex justify-end p-3">
            <Link to={`/tab5?id=${id}&edit=${editFlag}`}>
              <Button
                label="NEXT"
                icon="pi pi-arrow-right"
                iconPos="right"
                severity="secondary" // Use a secondary style
                outlined
              />
            </Link>
          </div>
        )}

        <IonAlert
          isOpen={alert.show}
          onDidDismiss={() => setAlert((a) => ({ ...a, show: false }))}
          header={alert.header}
          message={alert.message}
          buttons={["OK"]}
        />
        <IonAlert
          isOpen={showConfirm}
          onDidDismiss={() => setShowConfirm(false)}
          header="Confirm"
          message="Are you sure you want to clear signature?"
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
            },
            {
              text: "Yes",
              handler: () => {
                setStrokes([]);
                // your logic here
              },
            },
          ]}
        />
        {/* Spacer at the bottom */}
        <div className="pb-[250px]"></div>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
