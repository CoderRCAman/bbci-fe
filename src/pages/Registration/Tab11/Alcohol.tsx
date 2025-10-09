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

export default function Alcohol({
  data,
  handleChangeMaster,
  handleChangeProds,
  handleRemoveUi,
  addNewOtherUi,
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
  return (
    <div className="p-3 border mt-5 shadow space-y-2">
      <h1 className="font-semibold text-slate-600">Alcohol</h1>
      <div className="text-slate-600">
        <p className="">
          Have you ever consumed regularly alcoholid beverages?
        </p>
        <div className="flex gap-5">
          <div>
            <input
              type="radio"
              value={1}
              checked={data?.consumed === 1 ? true : false}
              onChange={(e) =>
                handleChangeMaster(
                  data.id,
                  "consumed",
                  parseInt(e.target.value)
                )
              }
            />{" "}
            YES
          </div>
          <div>
            <input
              type="radio"
              value={2}
              checked={data?.consumed === 2 ? true : false}
              onChange={(e) =>
                handleChangeMaster(
                  data.id,
                  "consumed",
                  parseInt(e.target.value)
                )
              }
            />{" "}
            NO
          </div>
          <div>
            <input
              type="radio"
              value={8}
              checked={data?.consumed === 8 ? true : false}
              onChange={(e) =>
                handleChangeMaster(
                  data.id,
                  "consumed",
                  parseInt(e.target.value)
                )
              }
            />{" "}
            DON'T KNOW
          </div>
          <div>
            <input
              type="radio"
              value={9}
              checked={data?.consumed === 9 ? true : false}
              onChange={(e) =>
                handleChangeMaster(
                  data.id,
                  "consumed",
                  parseInt(e.target.value)
                )
              }
            />{" "}
            Refused to answer
          </div>
        </div>
      </div>
      <div className="mt-2 space-y-2 text-slate-600">
        {data?.products
          ?.filter((x) => !x.is_other_product)
          .map((item, index) => (
            <div key={index} className="border p-2 rounded space-y-2">
              <h1 className="text-slate-700 font-semibold">{item.product}</h1>
              <div className="flex gap-2">
                <div>
                  <input
                    type="radio"
                    value={1}
                    checked={item.consumes === 1 ? true : false}
                    onChange={(e) =>
                      handleChangeProds(
                        item.id,
                        "alcohol",
                        "consumes",
                        parseInt(e.target.value)
                      )
                    }
                    disabled={data?.consumed !== 1}
                  />{" "}
                  YES
                </div>
                <div>
                  <input
                    type="radio"
                    value={2}
                    checked={item.consumes === 2 ? true : false}
                    onChange={(e) =>
                      handleChangeProds(
                        item.id,
                        "alcohol",
                        "consumes",
                        parseInt(e.target.value)
                      )
                    }
                    disabled={data?.consumed !== 1}
                  />{" "}
                  NO
                </div>
              </div>
              <div className="space-y-7 pt-4">
                <div>
                  <FloatLabel>
                    <InputText
                      keyfilter="int"
                      className="border-1 p-2"
                      value={item?.["from_age"]?.toString()}
                      onChange={(e) =>
                        handleChangeProds(
                          item.id,
                          "alcohol",
                          "from_age",
                          isNaN(parseInt(e.target.value))
                            ? 0
                            : parseInt(e.target.value)
                        )
                      }
                      disabled={item?.consumes !== 1}
                    />
                    <label>From age</label>
                  </FloatLabel>
                </div>
                <div>
                  <FloatLabel>
                    <InputText
                      keyfilter="int"
                      className="border-1 p-2"
                      value={item?.["to_age"]?.toString()}
                      onChange={(e) =>
                        handleChangeProds(
                          item.id,
                          "alcohol",
                          "to_age",
                          isNaN(parseInt(e.target.value))
                            ? 0
                            : parseInt(e.target.value)
                        )
                      }
                      disabled={item?.consumes !== 1}
                    />
                    <label>To age</label>
                  </FloatLabel>
                </div>
                <div>
                  <FloatLabel>
                    <InputText
                      keyfilter="int"
                      className="border-1 p-2"
                      value={item?.["number_per_day"]?.toString()}
                      onChange={(e) =>
                        handleChangeProds(
                          item.id,
                          "alcohol",
                          "number_per_day",
                          isNaN(parseInt(e.target.value))
                            ? 0
                            : parseInt(e.target.value)
                        )
                      }
                      disabled={item?.consumes !== 1}
                    />
                    <label>Number per day</label>
                  </FloatLabel>
                </div>

                <div>
                  <p>Days in a week or Days in a Month</p>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <p className="text-sm"> Week:</p>
                      <input
                        type="number"
                        className="border-b-2 focus:outline-none focus:border-slate-500 w-[20%]"
                        value={item?.["days_in_week"]?.toString()}
                        onChange={(e) =>
                          handleChangeProds(
                            item.id,
                            "alcohol",
                            "days_in_week",
                            isNaN(parseInt(e.target.value))
                              ? 0
                              : parseInt(e.target.value)
                          )
                        }
                        disabled={item?.consumes !== 1}
                      />
                    </div>
                    <div className="flex gap-2">
                      <p className="text-sm"> Month:</p>
                      <input
                        type="number"
                        className="border-b-2 focus:outline-none focus:border-slate-500 w-[20%]"
                        value={item?.["days_in_month"]?.toString()}
                        onChange={(e) =>
                          handleChangeProds(
                            item.id,
                            "alcohol",
                            "days_in_month",
                            isNaN(parseInt(e.target.value))
                              ? 0
                              : parseInt(e.target.value)
                          )
                        }
                        disabled={item?.consumes !== 1}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-10">
                  <div>
                    <FloatLabel>
                      <InputText
                        keyfilter="int"
                        className="border-1 p-2 w-[60%] "
                        value={item?.["consumption_unit_per_day"]?.toString()}
                        onChange={(e) =>
                          handleChangeProds(
                            item.id,
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
                </div>
              </div>
            </div>
          ))}
      </div>
      {/* ----------------------------------------------------- */}
      <div>
        {data?.products
          ?.filter((item) => item.is_other_product)
          .map((item, index) => (
            <OtherAlcohol
              key={index}
              data={item}
              handleRemoveUi={handleRemoveUi}
              addNewOtherUi={addNewOtherUi}
              handleChangeProds={handleChangeProds}
              isDisabled={data.consumed !== 1}
            />
          ))}
      </div>
    </div>
  );
}
