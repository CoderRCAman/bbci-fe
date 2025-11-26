import { Dropdown } from "primereact/dropdown";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { PERSONAL_MEDICAL_HISTORY_DB } from "./Tab6";
import { useEffect, useState } from "react";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { Card } from "primereact/card";
import { RadioButton } from "primereact/radiobutton";
export default function PMHInput({
  condition,
  mode_of_treatment,
  mode_of_diagnosis,
  data,
  updateStateData,
  ageLimit
}: {
  condition: string;
  mode_of_treatment: string[];
  mode_of_diagnosis: string[];
  data: PERSONAL_MEDICAL_HISTORY_DB;
  updateStateData: (id: string, field: string, value: any) => void;
  ageLimit: number
}) {
  console.log(data);

  // Helper for checkbox logic with correct types
  const handleCheckboxChange = (
    e: CheckboxChangeEvent, // Use the event type from PrimeReact
    d: string, // This is the string value of the checkbox
    fieldName: string // This is 'mode_of_treatment' or 'mode_of_diagnosis'
  ) => {
    // Explicitly type the field data as a string (or null/undefined)
    const fieldData = data?.[fieldName as keyof typeof data] as
      | string
      | undefined
      | null;

    const currentValues: string[] = fieldData ? fieldData.split("|") : [];

    let newModes: string[] = []; // Type the new array

    if (e.checked) {
      newModes = [...currentValues, d];
    } else {
      // Type 'm' in the filter as a string
      newModes = currentValues.filter((m: string) => m !== d);
    }

    updateStateData(data.id, fieldName, newModes.join("|"));
  };
  const radioOptions = [
    { name: "YES", value: 1 },
    { name: "NO", value: 2 },
    { name: "DON'T KNOW", value: 8 },
    { name: "REFUSED TO ANSWER", value: 9 },
  ];

  return (
    // Use a Card for a professional container
    <Card className="shadow-lg border ">
      {/* p-fluid makes all child PrimeReact inputs full-width */}
      <div
        className="sticky top-0 -mt-10 text-center bg-white py-3"
        style={{ zIndex: 10 }}
      >
        <h1 className="font-semibold text-primary-600 dark:text-primary-300 text-lg m-0">
          {condition}
        </h1>
      </div>
      <div className="p-fluid space-y-7 !mt-6">
        {/* Use a grid for a clean, responsive radio layout */}
        <div className="grid grid-cols-2 gap-4 text-md">
          {radioOptions.map((option) => (
            <div key={option.value} className="flex align-items-center gap-2">
              <RadioButton
                inputId={`${data?.id}_${option.value}`}
                name={`diagnosed_${data?.id}`}
                value={option.value}
                checked={data?.["diagnosed"] === option.value}
                onChange={(e) =>
                  updateStateData(data?.id, "diagnosed", parseInt(e.value))
                }
              />
              <label htmlFor={`${data?.id}_${option.value}`}>
                {option.name}
              </label>
            </div>
          ))}
        </div>

        {/* Use p-fluid for full-width inputs */}
        <FloatLabel>
          <InputText
            disabled={data?.diagnosed !== 1}
            keyfilter="int"
            type="number"
            value={data?.age_first_diagnosis?.toString() || ""}
            // Removed custom classes
            onChange={(e) => {
              const raw = e.target.value;

              // allow clearing
              if (raw === "") {
                updateStateData(data.id, "age_first_diagnosis", "");
                return;
              }

              let num = parseInt(raw);

              // enforce max
              if (num > ageLimit) num = ageLimit;

              updateStateData(data.id, "age_first_diagnosis", num);
            }
          }
          />
          <label>Age at first diagnosis</label>
        </FloatLabel>

        <FloatLabel>
          <InputText
            value={data?.year_of_first_diagnosis}
            // Removed custom classes
            disabled={data?.diagnosed !== 1}
            onChange={(e) =>
              updateStateData(
                data.id,
                "year_of_first_diagnosis",
                parseInt(e.target.value) || 0
              )
            }
          />
          <label>Year of first diagnosis</label>
        </FloatLabel>

        {/* Use FloatLabel for the dropdown */}
        <FloatLabel>
          <Dropdown
            disabled={data?.diagnosed !== 1}
            value={data?.treatment_received}
            optionLabel="name"
            optionValue="value"
            // Removed border-1
            placeholder="Select Treatment Received" // This will be replaced by label
            options={[
              { name: "YES", value: 1 },
              { name: "NO", value: 2 },
              { name: "DON'T KNOW", value: 8 },
              { name: "REFUSED TO ANSWER", value: 9 }, // Fixed value
            ]}
            onChange={(e) =>
              updateStateData(data.id, "treatment_received", parseInt(e.value))
            }
          />
          <label>Treatment received</label>
        </FloatLabel>

        {/* Group checkboxes in a styled container */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
          <p className="text-slate-500 font-semibold mb-3">Mode of treatment</p>
          <div className="p-2 space-y-3">
            {mode_of_treatment.map((d) => (
              <div key={d} className="flex align-items-center gap-3">
                <Checkbox
                  inputId={`${data?.id}_mot_${d}`}
                  disabled={
                    data?.diagnosed !== 1 || data?.treatment_received !== 1
                  }
                  value={d}
                  checked={
                    data?.mode_of_treatment?.split("|").includes(d) || false
                  }
                  onChange={(e) =>
                    handleCheckboxChange(e, d, "mode_of_treatment")
                  }
                />
                <label htmlFor={`${data?.id}_mot_${d}`}>{d}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
          <p className="text-slate-500 font-semibold mb-3">Mode of diagnosis</p>
          <div className="p-2 space-y-3">
            {mode_of_diagnosis.map((d) => (
              <div key={d} className="flex align-items-center gap-3">
                <Checkbox
                  inputId={`${data?.id}_mod_${d}`}
                  disabled={
                    data?.diagnosed !== 1 || data?.treatment_received !== 1
                  }
                  value={d}
                  checked={
                    data?.mode_of_diagnosis?.split("|").includes(d) || false
                  }
                  onChange={(e) =>
                    handleCheckboxChange(e, d, "mode_of_diagnosis")
                  }
                />
                <label htmlFor={`${data?.id}_mod_${d}`}>{d}</label>
              </div>
            ))}

            {/* Styled "Other specify" to match */}
            <div className="pt-3">
              <FloatLabel>
                <InputText
                  id={`${data?.id}_mod_other`}
                  disabled={
                    data?.diagnosed !== 1 || data?.treatment_received !== 1
                  }
                  onChange={(e) => {
                    updateStateData(
                      data.id,
                      "mode_of_diagnosis_other",
                      e.target.value
                    );
                  }}
                  value={data?.mode_of_diagnosis_other}
                />
                <label htmlFor={`${data?.id}_mod_other`}>Other (Specify)</label>

              </FloatLabel>
            </div>

            <div className="flex align-items-center gap-3 pt-2">
              <Checkbox
                inputId={`${data?.id}_mod_dontknow`}
                disabled={
                  data?.diagnosed !== 1 || data?.treatment_received !== 1
                }
                value={"Don't know"}
                // Add checked/onChange logic if this needs to be saved
                onChange={(e) => {
                  if (e.checked)
                    updateStateData(
                      data?.id,
                      "mode_of_diagnosis",
                      e.target.value
                    );
                  else {
                    updateStateData(data?.id, "mode_of_diagnosis", "");
                  }
                }}
                checked={
                  data?.mode_of_diagnosis?.split("|").includes("Don't know") ||
                  false
                }
              />
              <label htmlFor={`${data?.id}_mod_dontknow`}>Don't know</label>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
