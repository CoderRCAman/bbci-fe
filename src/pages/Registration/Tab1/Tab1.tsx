// src/pages/Tab1.tsx
import React, { useEffect, useState, } from "react";
import { InputText } from "primereact/inputtext";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInput,
  IonItem,
  IonLabel,
  IonButton,
  IonList,
  IonAlert,
  IonSelect,
  IonSelectOption,
  IonMenuButton,
  IonButtons,
} from "@ionic/react";
import { format, isValid, parse } from "date-fns";

import "./Tab1.css";
import { useForm, Controller, SubmitHandler } from "react-hook-form";

import { Geolocation } from "@capacitor/geolocation";
import Header from "../../../components/Header";
import { useSQLite } from "../../../utils/Sqlite";
import { generateUniqueId } from "../../../utils/helper";
import { useHistory, useLocation } from "react-router";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { RadioButton } from "primereact/radiobutton";
import { Calendar } from "primereact/calendar";
import RenderError from "../../../components/RenderError";
import { Link } from "react-router-dom";

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
}

const forcedStyle = {
  label: { marginBottom: "10px" },
  item: { margin: 0 },
  btnPadd: { marginTop: "30px" },
};

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
  const { db, sqlite } = useSQLite();
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

  console.log(patient);
  //below checks if this is for edit purpose
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id')
    const flag = searchParams.get('edit');
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
      return;
    }
    async function fetchPatient() {
      try {
        const res = await db?.query("select * from patients where id = ?", [
          id,
        ]);
        if ((res as any)?.values?.length > 0) {
          setPatient((res as any)?.values[0]);
        }
      } catch (error) { }
    }
    fetchPatient();
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

    if (editFlag =="yes" && id) {
      // Update
      console.log(patient);
      await db?.run(
        `UPDATE patients SET name = ?, age = ?, gender = ? , i_name = ? , 
         i_emp_code = ? , lat = ? , long = ?,
         DOB = ? , updated_at = ? 
         WHERE id = ?`,
        [
          data.name,
          data.age,
          data.gender,
          data.i_name,
          data.i_emp_code,
          patient.lat,
          patient.long,
          format(data.dob, "yyyy-MM-dd"),
          format(new Date(), "yyyy-MM-dd HH:mm:ss.SSS"),
          id,
        ]
      );
      const checkRes = await db?.query(`
            select * tracksync where user_id = ${id}
        `);
      const check = checkRes?.values?.[0] || null;
      if (check && (check.sync == 1 || check.sync == 2)) {
        await db?.run(
          `
         UPDATE tracksync 
         SET synch = 2 
         where patient_id = '${id}'
        `
        )
      }
      console.log(await db?.query(`
            select * tracksync where user_id = ${id}
        `))
      sqlite?.saveToStore("patientdb");
      setAlert((a) => ({
        ...a,
        show: true,
        header: "Success",
        message: "Updated successfully",
      }));
    } else {
      // Insert
      const uniqueId = generateUniqueId(data.name);
      await db?.run(
        `INSERT INTO patients (id, i_name, i_emp_code, name, age, gender,
         lat, long, time, dob, date , created_at , updated_at )
         VALUES (?,?, ?, ?,?,?,?,?,?,?,?,?,?)`,
        [
          uniqueId,
          data.i_name,
          data.i_emp_code,
          data.name,
          data.age,
          data.gender,
          patient.lat,
          patient.long,
          format(new Date(), "h:mm a"),
          format(data.dob, "yyyy-MM-dd"),
          format(new Date(), "yyyy-MM-dd"),
          format(new Date(), "yyyy-MM-dd HH:mm:ss.SSS"),
          format(new Date(), "yyyy-MM-dd HH:mm:ss.SSS"),
        ]
      );
      await sqlite?.saveToStore("patientdb");
      setAlert((a) => ({
        ...a,
        show: true,
        header: "Success",
        message: "Added successfully",
      }));
      setId(uniqueId);
      history.push(`/tab5?id=${uniqueId}`)
    }
  };

  const getCurrentPosition = async () => {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      console.log("Current position:", coordinates);
      const { latitude, longitude } = coordinates.coords;
      setPatient((p) => ({ ...p, lat: latitude, long: longitude }));
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const onSubmit = (data: any) => {
    console.log(data);
    savePatient(data);
  };
  console.log(errors);
  return (
    <IonPage>
      <Header title={editFlag ==="yes" ? "Edit participants" : "Register Participant"} />
      <IonContent fullscreen>
        <form
          className="min-h-full shadow-1 border rounded-md m-2 p-2 pt-5 flex flex-col gap-10"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Controller
            name="i_name"
            control={control}
            rules={{
              required: "Employee name field is required",
            }}
            render={({ field: { onChange, value } }) => (
              <Dropdown
                onChange={(e) => onChange(e.value)}
                optionLabel="name"
                value={value}
                optionValue="value"
                className="border-1"
                placeholder="Select empoloyee name"
                options={[
                  { name: "ITTEST1", value: "ITEST1" },
                  { name: "ITTEST2", value: "ITEST2" },
                ]}
              />
            )}
          />
          {errors?.i_name && (
            <RenderError text={errors?.i_name.message?.toString()} />
          )}
          {/* ------------------------------------- */}

          <Controller
            name="i_emp_code"
            control={control}
            rules={{
              required: "Employee code is required",
            }}
            render={({ field: { onChange } }) => (
              <Dropdown
                onChange={(e) => onChange(e.value)}
                optionLabel="name"
                value={watch("i_emp_code")}
                className="border-1"
                placeholder="Select empoloyee code"
                options={[
                  { name: "CODE1", value: "CODE1" },
                  { name: "CODE2", value: "CODE2" },
                ]}
              />
            )}
          />
          {errors?.i_emp_code && (
            <RenderError text={errors?.i_emp_code.message?.toString()} />
          )}
          {/* ------------------------------------- */}

          <Button
            label="Get co-ordinates"
            type="button"
            onClick={getCurrentPosition}
            className="p-3 rounded-md"
          />
          <div
            className="flex border rounded-md w-full align-items-center gap-5 p-2 "

          >
            <div className="flex align-items-center">
              <p>Latitude : </p>
              <p>{patient.lat}</p>
            </div>
            <div className="flex align-items-center">
              <p>Longitude : </p>
              <p>{patient.long}</p>
            </div>
          </div>

          {/* ------------------------------------- */}

          <FloatLabel>
            <InputText
              className="border-1 p-2"
              value={watch("name")}
              {...register("name", { required: "Name is required" })}
            />
            <label>Participant's name</label>
          </FloatLabel>
          {errors?.name && (
            <RenderError text={errors?.name.message?.toString()} />
          )}
          {/* ------------------------------------- */}

          <div className="border rounded p-2 plainBorder ">
            <p className="m-0">Select gender</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Controller
                  name="gender"
                  control={control}
                  rules={{
                    required: "Gender is required",
                  }}
                  render={({ field: { onChange } }) => (
                    <RadioButton
                      value={"male"}
                      className="border-2  rounded-full"
                      checked={watch("gender") === "male"}
                      onChange={(e) => onChange(e.value)}
                    />
                  )}
                />
                <p>Male</p>
              </div>
              <div className="flex items-center gap-2">
                <Controller
                  name="gender"
                  control={control}
                  rules={{
                    required: "Gender is required",
                  }}
                  render={({ field: { onChange } }) => (
                    <RadioButton
                      value={"female"}
                      className="border-2  rounded-full"
                      checked={watch("gender") === "female"}
                      onChange={(e) => onChange(e.value)}
                    />
                  )}
                />
                <p>Female</p>
              </div>
              <div className="flex items-center gap-2">
                <Controller
                  name="gender"
                  control={control}
                  rules={{
                    required: "Gender is required",
                  }}
                  render={({ field: { onChange } }) => (
                    <RadioButton
                      value={"other"}
                      className="border-2  rounded-full"
                      checked={watch("gender") === "other"}
                      onChange={(e) => onChange(e.value)}
                    />
                  )}
                />
                <p>Other</p>
              </div>
            </div>
          </div>
          {errors?.gender && (
            <RenderError text={errors?.gender.message?.toString()} />
          )}
          {/* ------------------------------------- */}

          <FloatLabel>
            <InputText
              keyfilter="int"
              className="border-1 p-2"
              value={watch("age").toString()}
              {...register("age", { required: "Age is required" })}
            />
            <label>Age</label>
          </FloatLabel>
          {errors?.age && (
            <RenderError text={errors?.age.message?.toString()} />
          )}

          {/* ------------------------------------- */}
          <div className="border-1 plainBorder p-2 border-round-md flex flex-col gap-2">
            <p className="m-0">Date of Birth</p>
            <Controller
              name="dob"
              control={control}
              rules={{
                required: "Date of birth is required",
              }}
              render={({ field: { onChange, value } }) => {
                // let dateValue: any = value;
                // if (typeof value === 'string') {
                //   const parsed = parse(value, 'yyyy-MM-dd', new Date());
                //   dateValue = isValid(parsed) ? parsed : null;
                // }

                return (
                  <Calendar
                    className="border-1 p-2 focus:outline-none"
                    value={value ? new Date(value) : null}
                    onChange={(e) => onChange(e.value)}
                    showIcon
                  />
                );
              }}
            />
          </div>
          {errors?.dob && (
            <RenderError text={errors?.dob.message?.toString()} />
          )}

          <div className="flex justify-center">
            <Button
              label="Save"
              type="submit"
              className="px-4 py-2 border-1 border-round-md"
            />
          </div>
        </form>

        <div className="flex justify-end p-2 gap-2  ">
          <Link  to={`/tab5?id=${id}&edit=${editFlag}`}>
            <Button label="NEXT" className="px-3 py-2 rounded" />
          </Link>
        </div>
        <IonAlert
          isOpen={alert.show}
          onDidDismiss={() => setAlert((a) => ({ ...a, show: false }))}
          header={alert.header}
          message={alert.message}
          buttons={["OK"]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
