import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import shortUUID from "short-uuid";
import OtherAlcohol from "./OtherAlcohol";
import {
  initialState,
  TOBACCO_ALCOHOL_CONSUMPION,
  TobaccoAlcoholConsumption,
} from "./data";
import { produce } from "immer";
import { Card } from "primereact/card";
import { RadioButton } from "primereact/radiobutton";
import { Fieldset } from "primereact/fieldset";

export default function Alcohol({
  data,
  handleChangeMaster,
  handleChangeProds,
  handleRemoveUi,
  addNewOtherUi,
  ageLimit
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
  ageLimit: number
}) {
  // Helper array for the master radio buttons
  const masterOptions = [
    { name: "YES", value: 1 },
    { name: "NO", value: 2 },
    { name: "DON'T KNOW", value: 8 },
    { name: "Refused to answer", value: 9 },
  ];
  console.log(data)
  return (
    // 1. Replaced main div with Card, removed title prop
    <Card className="shadow-lg ">
      {/* 2. Added sticky header */}
      <div
        className="sticky top-0 -mt-10 text-center py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
        style={{ zIndex: 10 }}
      >
        <h1 className="font-semibold text-primary-600 dark:text-primary-300 text-lg m-0">
          Alcohol
        </h1>
      </div>

      {/* 3. Added content wrapper with padding */}
      <div className="space-y-6 p-4 mt-6">
        <div className="text-slate-600 dark:text-gray-300">
          <p className="font-semibold mb-3">
            Have you ever consumed regularly alcoholic beverages?
          </p>
          {/* 4. Converted master radio inputs to PrimeReact <RadioButton> */}
          <div className="grid grid-cols-2 gap-4">
            {masterOptions.map((option) => (
              <div key={option.value} className="flex align-items-center gap-2">
                <RadioButton
                  inputId={`master_alcohol_${option.value}`}
                  name="master_alcohol"
                  value={option.value}
                  checked={data?.consumed === option.value}
                  onChange={(e) =>
                    handleChangeMaster(
                      data?.id, // Used optional chaining
                      "consumed",
                      parseInt(e.value)
                    )
                  }
                />
                <label htmlFor={`master_alcohol_${option.value}`}>
                  {option.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Wrapper for all product fieldsets */}
        <div className="mt-4 space-y-4">
          {data?.products
            ?.filter((x) => !x?.is_other_product)
            .map((item, index) => (
              // 6. Replaced product div with <Fieldset>
              <Fieldset
                key={item?.id || index}
                legend={item?.product}
                toggleable
              >
                {/* 7. Converted product radio inputs to <RadioButton> */}
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
                          "alcohol",
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
                      inputId={`${item?.id}_consumes_2`}
                      name={`consumes_${item?.id}`}
                      value={2}
                      checked={item?.consumes === 2}
                      onChange={(e) =>
                        handleChangeProds(
                          item?.id,
                          "alcohol",
                          "consumes",
                          parseInt(e.value)
                        )
                      }
                      disabled={data?.consumed !== 1}
                    />
                    <label htmlFor={`${item?.id}_consumes_2`}>NO</label>
                  </div>
                </div>

                {/* 8. Added p-fluid for full-width inputs, removed border-1 etc. */}
                <div className="p-fluid space-y-7">
                  <FloatLabel>
                    <InputText
                      keyfilter="int" 
                      type="number"
                      value={item?.["from_age"]?.toString() || ""}
                      onChange={(e) =>
                        handleChangeProds(
                          item.id,
                          "alcohol",
                          "from_age",
                          e.target.value === "" ? "" : Math.min(parseInt(e.target.value), ageLimit)
                        )
                      }
                      disabled={item?.consumes !== 1}
                    />
                    <label>From age</label>
                  </FloatLabel>

                  <FloatLabel>
                    <InputText
                      keyfilter="int" 
                      type="number"
                      value={item?.["to_age"]?.toString() || ""}
                      onChange={(e) =>
                        handleChangeProds(
                          item.id,
                          "alcohol",
                          "to_age",
                          e.target.value === "" ? "" : Math.min(parseInt(e.target.value), ageLimit)
                        )
                      }
                      disabled={item?.consumes !== 1}
                    />
                    <label>To age</label>
                  </FloatLabel>

                  <FloatLabel>
                    <InputText
                      keyfilter="int"
                      type="number"
                      value={item?.["number_per_day"]?.toString() || ""}
                      onChange={(e) =>
                        handleChangeProds(
                          item?.id,
                          "alcohol",
                          "number_per_day",
                          isNaN(parseInt(e.target.value))
                            ? 0
                            : parseInt(e.target.value)
                        )
                      }
                      disabled={item?.consumes !== 1}
                    />
                    <label>Number of times per day</label>
                  </FloatLabel>

                  {/* 9. Styled the Week/Month section */}
                  <div className="">
                    <p className="text-slate-600 dark:text-gray-300 mb-3">
                      Days in a week or Days in a Month
                    </p>
                    {/* Used grid for a clean side-by-side layout */}
                    <div className="grid grid-cols-2 gap-4 mt-7">
                      <FloatLabel>
                        <InputText
                          keyfilter="int" 
                          type="number"
                          value={item?.["days_in_week"]?.toString() || ""}
                          onChange={(e) =>
                            handleChangeProds(
                              item.id,
                              "alcohol",
                              "days_in_week",
                              e.target.value === "" ? "" : Math.min(parseInt(e.target.value), 7)
                            )
                          }
                          disabled={item?.consumes !== 1}
                        />
                        <label>Days in a Week</label>
                      </FloatLabel>

                      <FloatLabel>
                        <InputText
                          keyfilter="int" 
                          type="number"
                          value={item?.["days_in_month"]?.toString() || ""}
                          onChange={(e) =>
                            handleChangeProds(
                              item.id,
                              "alcohol",
                              "days_in_month",
                              e.target.value === "" ? "" : Math.min(parseInt(e.target.value), 31)
                            )
                          }
                          disabled={item?.consumes !== 1}
                        />
                        <label>Days in a Month</label>
                      </FloatLabel>
                    </div>
                  </div>

                  {/* 10. Styled Consumption Unit, removed w-[60%] */}
                  <FloatLabel>
                    <InputText
                      keyfilter="int" 
                      type="number"
                      value={
                        item?.["consumption_unit_per_day"]?.toString() || ""
                      }
                      onChange={(e) =>
                        handleChangeProds(
                          item?.id,
                          "alcohol",
                          "consumption_unit_per_day",
                          isNaN(parseInt(e.target.value))
                            ? 0
                            : parseInt(e.target.value)
                        )
                      }
                      disabled={item?.consumes !== 1}
                    />
                    <label>Consumption Unit per day *(ml/ Glass)</label>
                  </FloatLabel>
                </div>
              </Fieldset>
            ))}
        </div>

        {/* ----------------------------------------------------- */}
        {/* 11. Wrapper for "Other" products */}
        <div className="mt-4 space-y-4">
          {data?.products
            ?.filter((item) => item?.is_other_product)
            .map((item, index) => (
              <OtherAlcohol
                key={item?.id || index}
                data={item}
                handleRemoveUi={handleRemoveUi}
                addNewOtherUi={addNewOtherUi}
                handleChangeProds={handleChangeProds}
                isDisabled={data?.consumed !== 1} // Used optional chaining
                ageLimit = {ageLimit}
              />
            ))}
        </div>
      </div>
    </Card>
  );
}
