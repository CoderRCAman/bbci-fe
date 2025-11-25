import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import React, { useEffect, useState } from "react";

import shortUUID from "short-uuid";
import OtherProdWithTobacco from "./OtherProdWithTobacco";
import { initialState, TOBACCO_ALCOHOL_CONSUMPION } from "./data";
import { Checkbox } from "primereact/checkbox";
import { Card } from "primereact/card";
import { RadioButton } from "primereact/radiobutton";
import { Fieldset } from "primereact/fieldset";

export default function ChewingWithoutTobacco({
  data,
  handleChangeMaster,
  handleChangeProds,
  addNewOtherUi,
  handleRemoveUi,
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
}) {
  // Helper array for the master radio buttons
  // NOTE: Based on your code, NO=2, DON'T KNOW=8, REFUSED=9
  // The 'checked' for NO was data.consumed === 0, which seemed like a typo.
  // I've updated it to check for '2' to match the value, consistent with the pattern.
  const masterOptions = [
    { name: "YES", value: 1 },
    { name: "NO", value: 2 },
    { name: "DON'T KNOW", value: 8 },
    { name: "Refused to answer", value: 9 },
  ];

  // Helper array for Site of Placement checkboxes
  const siteOptions = [
    { label: "L", key: "site_of_placement_L" },
    { label: "R", key: "site_of_placement_R" },
    { label: "F", key: "site_of_placement_F" },
    { label: "n/a", key: "site_of_placement_NA" },
  ];
console.log(data)
  return (
    // 1. Use <Card> and remove the 'title' prop
    <Card className="shadow-lg ">
      {/* 2. Add the sticky header div */}
      <div
        className="sticky top-0 -mt-10 text-center py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
        style={{ zIndex: 10 }}
      >
        <h1 className="font-semibold text-primary-600 dark:text-primary-300 text-lg m-0">
          Chewing Without Tobacco
        </h1>
      </div>

      {/* 3. Add padding 'p-4' to the content wrapper */}
      <div className="space-y-6 p-4 mt6">
        <div className="text-slate-600 dark:text-gray-300">
          <p className="font-semibold mb-3">
            Have you ever chewed without tobacco regularly?
          </p>
          {/* Use a grid for a cleaner radio layout */}
          <div className="grid grid-cols-2 gap-4">
            {masterOptions.map((option) => (
              <div key={option.value} className="flex align-items-center gap-2">
                <RadioButton
                  inputId={`master_chewing_wt_${option.value}`}
                  name="master_chewing_wt"
                  value={option.value}
                  // Using optional chaining and corrected 'NO' check
                  checked={data?.consumed === option.value}
                  onChange={(e) =>
                    handleChangeMaster(data?.id, "consumed", parseInt(e.value))
                  }
                />
                <label htmlFor={`master_chewing_wt_${option.value}`}>
                  {option.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* This div will contain all the product fieldsets */}
        <div className="mt-4 space-y-4 text-slate-600">
          {data?.products
            ?.filter((x) => !x?.is_other_product)
            .map((item, index) => (
              // Use a <Fieldset> for each product
              <Fieldset
                key={item?.id || index}
                // Using the hardcoded legend from your original code
                legend="Paan (betel leaf) without areca nut"
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
                          "chewing_without_tobacco",
                          "consumes",
                          parseInt(e.value)
                        )
                      }
                      disabled={data?.consumed !== 1}
                    />
                    <label htmlFor={`${item?.id}_consumes_1`}>YES</label>
                  </div>
                  <div className="flex align-items-center gap-2">
                    <RadioButton
                      inputId={`${item?.id}_consumes_0`}
                      name={`consumes_${item?.id}`}
                      // Preserving your '0' value for NO
                      value={0}
                      checked={item?.consumes === 0}
                      onChange={(e) =>
                        handleChangeProds(
                          item?.id,
                          "chewing_without_tobacco",
                          "consumes",
                          parseInt(e.value)
                        )
                      }
                      disabled={data?.consumed !== 1}
                    />
                    <label htmlFor={`${item?.id}_consumes_0`}>NO</label>
                  </div>
                </div>

                {/* Fluid inputs for text fields */}
                <div className="p-fluid space-y-7">
                  <FloatLabel>
                    <InputText
                      keyfilter="int"
                      // Removed 'border-1 p-2'
                      onChange={(e) =>
                        handleChangeProds(
                          item?.id,
                          "chewing_without_tobacco",
                          "from_age",
                          isNaN(parseInt(e.target.value))
                            ? "" // Use empty string instead of 0
                            : parseInt(e.target.value)
                        )
                      }
                      value={item?.from_age?.toString() || ""}
                      disabled={item?.consumes !== 1}
                    />
                    <label>From age</label>
                  </FloatLabel>

                  <FloatLabel>
                    <InputText
                      keyfilter="int"
                      // Removed 'border-1 p-2'
                      onChange={(e) =>
                        handleChangeProds(
                          item?.id,
                          "chewing_without_tobacco",
                          "to_age",
                          isNaN(parseInt(e.target.value))
                            ? ""
                            : parseInt(e.target.value)
                        )
                      }
                      value={item?.to_age?.toString() || ""}
                      disabled={item?.consumes !== 1}
                    />
                    <label>To age</label>
                  </FloatLabel>

                  <FloatLabel>
                    <InputText
                      keyfilter="int"
                      // Removed 'border-1 p-2'
                      onChange={(e) =>
                        handleChangeProds(
                          item?.id,
                          "chewing_without_tobacco",
                          "number_per_day",
                          isNaN(parseInt(e.target.value))
                            ? ""
                            : parseInt(e.target.value)
                        )
                      }
                      value={item?.number_per_day?.toString() || ""}
                      disabled={item?.consumes !== 1}
                    />
                    <label>Number per day</label>
                  </FloatLabel>

                  <FloatLabel>
                    <InputText
                      keyfilter="int"
                      // Removed 'border-1 p-2'
                      onChange={(e) =>
                        handleChangeProds(
                          item?.id,
                          "chewing_without_tobacco",
                          "days_in_week",
                          isNaN(parseInt(e.target.value))
                            ? ""
                            : parseInt(e.target.value)
                        )
                      }
                      value={item?.days_in_week?.toString() || ""}
                      disabled={item?.consumes !== 1}
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
                      className="w-20 text-center" // Wider width
                      keyfilter={"int"}
                      value={item?.duration_placement_hr?.toString() || ""}
                      onChange={(e) =>
                        handleChangeProds(
                          item?.id,
                          "chewing_without_tobacco",
                          "duration_placement_hr",
                          isNaN(parseInt(e.target.value))
                            ? ""
                            : parseInt(e.target.value)
                        )
                      }
                      disabled={item?.consumes !== 1}
                    />
                    <label>HOUR</label>
                    <span className="font-bold mx-1">:</span>
                    <InputText
                      className="w-20 text-center" // Wider width
                      keyfilter={"int"}
                      value={item?.duration_placement_min?.toString() || ""}
                      onChange={(e) =>
                        handleChangeProds(
                          item?.id,
                          "chewing_without_tobacco",
                          "duration_placement_min",
                          isNaN(parseInt(e.target.value))
                            ? ""
                            : parseInt(e.target.value)
                        )
                      }
                      disabled={item?.consumes !== 1}
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
                          checked={item?.[site.key as keyof typeof item] === 1}
                          // This is the correct onChange logic for a checkbox
                          onChange={(e) =>
                            handleChangeProds(
                              item?.id,
                              "chewing_without_tobacco",
                              site.key,
                              e.checked ? 1 : 0 // Pass 1 or 0
                            )
                          }
                          disabled={item?.consumes !== 1}
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
                isDisabled={data?.consumed !== 1}
              />
            ))}
        </div>
      </div>
    </Card>
  );
}
