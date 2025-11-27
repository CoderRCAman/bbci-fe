import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import OtherProdWithTobacco from "./OtherProdWithTobacco";
import ShortUUID from "short-uuid";
import { initialState, TOBACCO_ALCOHOL_CONSUMPION } from "./data";
import { Checkbox } from "primereact/checkbox";
import { Card } from "primereact/card";
import { RadioButton } from "primereact/radiobutton";
import { Fieldset } from "primereact/fieldset";

export default function ChewingTobacco({
  data,
  handleChangeMaster,
  handleChangeProds,
  addNewOtherUi,
  handleRemoveUi,
  ageLimit,
  isDisabled
}: {
  data: initialState;
  handleChangeMaster: (id: string, field: string, value: any) => void;
  handleChangeProds: (
    id: string,
    type: string,
    field: string,
    value: any
  ) => void;
  addNewOtherUi: (
    type:
      | "smoking_tobacco"
      | "chewing_tobacco"
      | "chewing_without_tobacco"
      | "alcohol"
  ) => void;
  handleRemoveUi: (
    id: string,
    type:
      | "smoking_tobacco"
      | "chewing_tobacco"
      | "chewing_without_tobacco"
      | "alcohol"
  ) => void;
  ageLimit: number;
  isDisabled: boolean
}) {
  // Helper array for the master radio buttons
  const masterOptions = [
    { name: "YES", value: 1 },
    { name: "NO", value: 2 },
    { name: "DON'T KNOW", value: 8 },
    { name: "Refused to answer", value: 9 },
  ];
  console.log(data)
  // Helper array for Site of Placement checkboxes
  const siteOptions = [
    { label: "L", key: "site_of_placement_L" },
    { label: "R", key: "site_of_placement_R" },
    { label: "F", key: "site_of_placement_F" },
    { label: "n/a", key: "site_of_placement_NA" },
  ];

  return (
    // Use a <Card> for a premium container. mt-5 is from your original code.
    <Card className="shadow-lg mt-5">
      <div
        className="sticky -mt-20 top-0 text-center py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
        style={{ zIndex: 10 }}
      >
        <h1 className="font-semibold text-primary-600 dark:text-primary-300 text-lg m-0">
          Chewing Tobacco
        </h1>
      </div>
      <div className="space-y-6 mt-6">
        {" "}
        {/* Increased vertical spacing */}
        <div className="text-slate-600 dark:text-gray-300">
          <p className="font-semibold mb-3">
            Have you ever chewed with tobacco regularly?
          </p>
          {/* Use a grid for a cleaner radio layout */}
          <div className="grid grid-cols-2 gap-4">
            {masterOptions.map((option) => (
              <div key={option.value} className="flex align-items-center gap-2">
                <RadioButton
                  inputId={`master_chewing_${option.value}`}
                  name="master_chewing"
                  value={option.value}
                  // Use optional chaining and simplified check
                  checked={data?.consumed === option.value}
                  onChange={(e) =>
                    handleChangeMaster(
                      data?.id, // Use optional chain
                      "consumed",
                      parseInt(e.value)
                    )
                  }
                  disabled={isDisabled}
                />
                <label htmlFor={`master_chewing_${option.value}`}>
                  {option.name}
                </label>
              </div>
            ))}
          </div>
        </div>
        {/* This div will contain all the product fieldsets */}
        <div className="mt-4 space-y-4">
          {data?.products
            ?.filter((item) => !item?.is_other_product)
            .map((item, index) => (
              // Use a <Fieldset> for each product
              <Fieldset
                key={item?.id || index}
                legend={item?.product}
                toggleable
              >
                {/* Product-specific radio buttons */}
                <div className="flex gap-5 mb-6">
                  <div className="flex align-items-center gap-2">
                    <RadioButton
                      inputId={`${item?.id}_consumes_1`}
                      name={`consumes_${item?.id}`}
                      value={1}
                      checked={item?.consumes === 1}
                      onChange={(e) =>
                        handleChangeProds(
                          item?.id,
                          item?.type || "",
                          "consumes",
                          parseInt(e.value)
                        )
                      }
                      disabled={data?.consumed !== 1 || isDisabled}
                    />
                    <label htmlFor={`${item?.id}_consumes_1`}>YES</label>
                  </div>
                  <div className="flex align-items-center gap-2">
                    <RadioButton
                      inputId={`${item?.id}_consumes_2`}
                      name={`consumes_${item?.id}`}
                      value={2}
                      checked={item?.consumes === 2}
                      onChange={(e) =>
                        handleChangeProds(
                          item?.id,
                          item?.type || "",
                          "consumes",
                          parseInt(e.value)
                        )
                      }
                      disabled={data?.consumed !== 1 || isDisabled}
                    />
                    <label htmlFor={`${item?.id}_consumes_2`}>NO</label>
                  </div>
                </div>

                {/* Fluid inputs for text fields */}
                <div className="p-fluid space-y-7">
                  <FloatLabel>
                    <InputText
                      keyfilter="int"
                      type="number"
                      // Removed 'border-1 p-2'
                      value={item?.from_age?.toString() || ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "") {
                          handleChangeProds(item?.id, item?.type || "", "from_age", "");
                          return;
                        }
                        let num = parseInt(raw);
                        if (num > ageLimit) num = ageLimit;
                        handleChangeProds(item?.id, item?.type || "", "from_age", num);
                      }
                      }
                      disabled={data?.consumed !== 1 || item?.consumes !== 1 || isDisabled}
                    />
                    <label>From age</label>
                  </FloatLabel>

                  <FloatLabel>
                    <InputText
                      keyfilter="int"
                      type="number"
                      // Removed 'border-1 p-2'
                      value={item?.to_age?.toString() || ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "") {
                          handleChangeProds(item?.id, item?.type || "", "to_age", "");
                          return;
                        }
                        let num = parseInt(raw);
                        if (num > ageLimit) num = ageLimit;
                        handleChangeProds(item?.id, item?.type || "", "to_age", num);
                      }
                      }
                      disabled={data?.consumed !== 1 || item?.consumes !== 1 || isDisabled}
                    />
                    <label>To age</label>
                  </FloatLabel>

                  <FloatLabel>
                    <InputText
                      keyfilter="int"
                      type="number"
                      // Removed 'border-1 p-2'
                      value={item?.number_per_day?.toString() || ""}
                      onChange={(e) =>
                        handleChangeProds(
                          item?.id,
                          item?.type || "",
                          "number_per_day",
                          e.target.value ? parseInt(e.target.value) : ""
                        )
                      }
                      disabled={data?.consumed !== 1 || item?.consumes !== 1 || isDisabled}
                    />
                    <label>Number per day</label>
                  </FloatLabel>

                  <FloatLabel>
                    <InputText
                      keyfilter="int"
                      type="number"
                      // Removed 'border-1 p-2'
                      value={item?.days_in_week?.toString() || ""}
                      onChange={(e) =>
                        handleChangeProds(
                          item.id,
                          item.type || "",
                          "days_in_week",
                          e.target.value === ""
                            ? ""
                            : Math.min(parseInt(e.target.value), 7)
                        )
                      }
                      disabled={data?.consumed !== 1 || item?.consumes !== 1 || isDisabled}
                    />
                    <label>Days in a week</label>
                  </FloatLabel>
                </div>

                {/* Custom layout for HR/MIN - outside p-fluid */}
                <div className="mt-6">
                  <p className="text-slate-600 dark:text-gray-300 mb-2">
                    Total duration of placement per day.
                  </p>
                  <div className="flex gap-2 items-center font-semibold text-sm text-slate-500">
                    <InputText
                      className="w-20 text-center" // Use a wider, fixed width
                      keyfilter={"int"}
                      type="number"
                      value={item?.duration_placement_hr?.toString() || ""}
                      onChange={(e) =>
                        handleChangeProds(
                          item?.id,
                          item?.type || "",
                          "duration_placement_hr",
                          e.target.value ? parseInt(e.target.value) : ""
                        )
                      }
                      disabled={data?.consumed !== 1 || item?.consumes !== 1 || isDisabled}
                    />
                    <label>HOUR</label>
                    <span className="font-bold mx-1">:</span>
                    <InputText
                      className="w-20 text-center" // Use a wider, fixed width
                      keyfilter={"int"}
                      type="number"
                      value={item?.duration_placement_min?.toString() || ""}
                      onChange={(e) =>
                        handleChangeProds(
                          item?.id,
                          item?.type || "",
                          "duration_placement_min",
                          e.target.value ? parseInt(e.target.value) : ""
                        )
                      }
                      disabled={data?.consumed !== 1 || item?.consumes !== 1 || isDisabled}
                    />
                    <label>MINUTES</label>
                  </div>
                </div>

                {/* Custom layout for Checkboxes - outside p-fluid */}
                <div className="mt-6">
                  <p className="text-slate-600 dark:text-gray-300 mb-2">
                    Site of placement
                  </p>
                  <div className="flex flex-wrap gap-5">
                    {siteOptions.map((site) => (
                      <div
                        key={site.key}
                        className="flex align-items-center gap-2"
                      >
                        <Checkbox
                          inputId={`${item?.id}_${site.key}`}
                          // Use optional chaining
                          checked={item?.[site.key as keyof typeof item] === 1}
                          onChange={(e) => {
                            // This logic is preserved from your original code
                            handleChangeProds(
                              item?.id,
                              item?.type || "",
                              site.key,
                              e.checked ? 1 : 0 // Pass 1 or 0
                            );
                          }}
                          disabled={
                            data?.consumed !== 1 || item?.consumes !== 1 || isDisabled
                          }
                        />
                        <label htmlFor={`${item?.id}_${site.key}`}>
                          {site.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </Fieldset>
            ))}
        </div>
        {/* ----------------------------------------------------- */}
        {/* "Other" Products Section */}
        <div className="mt-4 space-y-4">
          {data?.products
            ?.filter((x) => x?.is_other_product)
            .map((item, index) => (
              <OtherProdWithTobacco
                key={item?.id || index}
                data={item}
                handleRemoveUi={handleRemoveUi}
                addNewOtherUi={addNewOtherUi}
                handleChangeProds={handleChangeProds}
                isDisabled={data?.consumed !== 1 || isDisabled}
                ageLimit={ageLimit}
              />
            ))}
        </div>
      </div>
    </Card>
  );
}
