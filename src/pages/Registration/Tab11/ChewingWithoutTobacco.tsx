import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import React, { useEffect, useState } from "react";

import shortUUID from "short-uuid";
import OtherProdWithTobacco from "./OtherProdWithTobacco";
import { initialState, TOBACCO_ALCOHOL_CONSUMPION } from "./data";

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
  return (
    <div className="p-3 border mt-5 shadow space-y-2">
      <h1 className="font-semibold text-slate-600">Chewing Without Tobacco</h1>
      <div className="text-slate-600">
        <p className="">Have you ever chewed without tobacco regularly? </p>
        <div className="flex gap-5">
          <div>
            <input
              type="radio"
              value={1}
              checked={data.consumed === 1 ? true : false}
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
              checked={data.consumed === 0 ? true : false}
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
              checked={data.consumed === 8 ? true : false}
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
              checked={data.consumed === 9 ? true : false}
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
        {data.products
          .filter((x) => !x.is_other_product)
          .map((item, index) => (
            <div key={index} className="border p-2 rounded space-y-1">
              <h1>Paan (betel leaf) without areca nut</h1>
              <div className="flex gap-2">
                <div>
                  <input
                    type="radio"
                    value={1}
                    checked={item.consumes === 1 ? true : false}
                    onChange={(e) =>
                      handleChangeProds(
                        item.id,
                        "chewing_without_tobacco",
                        "consumes",
                        parseInt(e.target.value)
                      )
                    }
                    disabled={data.consumed !== 1}
                  />{" "}
                  YES
                </div>
                <div>
                  <input
                    type="radio"
                    value={0}
                    checked={item.consumes === 0 ? true : false}
                    onChange={(e) =>
                      handleChangeProds(
                        item.id,
                        "chewing_without_tobacco",
                        "consumes",
                        parseInt(e.target.value)
                      )
                    }
                    disabled={data.consumed !== 1}
                  />{" "}
                  NO
                </div>
              </div>
              <div className="space-y-5 pt-4">
                <div>
                  <FloatLabel>
                    <InputText
                      keyfilter="int"
                      className="border-1 p-2"
                      onChange={(e) =>
                        handleChangeProds(
                          item.id,
                          "chewing_without_tobacco",
                          "from_age",
                          isNaN(parseInt(e.target.value))
                            ? 0
                            : parseInt(e.target.value)
                        )
                      }
                      value={item?.from_age?.toString()}
                      disabled={item.consumes !== 1}
                    />
                    <label>From age</label>
                  </FloatLabel>
                </div>
                <div>
                  <FloatLabel>
                    <InputText
                      keyfilter="int"
                      className="border-1 p-2"
                      onChange={(e) =>
                        handleChangeProds(
                          item.id,
                          "chewing_without_tobacco",
                          "to_age",
                          isNaN(parseInt(e.target.value))
                            ? 0
                            : parseInt(e.target.value)
                        )
                      }
                      value={item?.to_age?.toString()}
                      disabled={item.consumes !== 1}
                    />
                    <label>To age</label>
                  </FloatLabel>
                </div>
                <div>
                  <FloatLabel>
                    <InputText
                      keyfilter="int"
                      className="border-1 p-2"
                      onChange={(e) =>
                        handleChangeProds(
                          item.id,
                          "chewing_without_tobacco",
                          "number_per_day",
                          isNaN(parseInt(e.target.value))
                            ? 0
                            : parseInt(e.target.value)
                        )
                      }
                      value={item?.number_per_day?.toString()}
                      disabled={item.consumes !== 1}

                    />
                    <label>Number per day</label>
                  </FloatLabel>
                </div>
                <div>
                  <FloatLabel>
                    <InputText
                      keyfilter="int"
                      className="border-1 p-2"
                      onChange={(e) =>
                        handleChangeProds(
                          item.id,
                          "chewing_without_tobacco",
                          "days_in_week",
                          isNaN(parseInt(e.target.value))
                            ? 0
                            : parseInt(e.target.value)
                        )
                      }
                      value={item?.days_in_week?.toString()}
                      disabled={item.consumes !== 1}
                    />
                    <label>Days in a week</label>
                  </FloatLabel>
                </div>
                <div>
                  <p>Total duration of placement per day.</p>
                  <div className="flex gap-2 font-semibold text-sm text-slate-500">
                    <div>HOUR</div>
                    <div>
                      <InputText
                        className="border  w-[30px] text-center"
                        keyfilter={"int"}
                        value={item?.duration_placement_hr?.toString()}
                        onChange={(e) =>
                          handleChangeProds(
                            item.id,
                            "chewing_without_tobacco",
                            "duration_placement_hr",
                            isNaN(parseInt(e.target.value))
                              ? 0
                              : parseInt(e.target.value)
                          )
                        }
                        disabled={item.consumes !== 1}
                      />
                    </div>
                    <div>:</div>
                    <div>
                      <InputText
                        className="border  w-[30px] text-center"
                        keyfilter={"int"}
                        value={item?.duration_placement_min?.toString()}
                        onChange={(e) =>
                          handleChangeProds(
                            item.id,
                            "chewing_without_tobacco",
                            "duration_placement_min",
                            isNaN(parseInt(e.target.value))
                              ? 0
                              : parseInt(e.target.value)
                          )
                        }
                        disabled={item.consumes !== 1}
                      />
                    </div>
                    <div>MINUTES</div>
                  </div>
                </div>
                <div>
                  <p>Site of placement</p>
                  <div className="flex gap-8">
                    <div>
                      <input
                        type="checkbox"
                        name=""
                        id=""
                        value={1}
                        checked={item?.site_of_placement_L === 1 ? true : false}
                        onChange={(e) =>
                          handleChangeProds(
                            item.id,
                            "chewing_without_tobacco",
                            "site_of_placement_L",
                            parseInt(e.target.value)
                          )
                        }
                        disabled={item.consumes !== 1}
                      />{" "}
                      L
                    </div>

                    <div>
                      <input
                        type="checkbox"
                        name=""
                        id=""
                        value={1}
                        checked={item?.site_of_placement_R === 1 ? true : false}
                        onChange={(e) =>
                          handleChangeProds(
                            item.id,
                            "chewing_without_tobacco",
                            "site_of_placement_R",
                            parseInt(e.target.value) /*  */
                          )
                        }
                        disabled={item.consumes !== 1}
                      />{" "}
                      R
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        name=""
                        id=""
                        value={1}
                        checked={item?.site_of_placement_F === 1 ? true : false}
                        onChange={(e) =>
                          handleChangeProds(
                            item.id,
                            "chewing_without_tobacco",
                            "site_of_placement_F",
                            parseInt(e.target.value) /*  */
                          )
                        }
                        disabled={item.consumes !== 1}
                      />{" "}
                      F
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        name=""
                        id=""
                        value={1}
                        checked={
                          item?.site_of_placement_NA === 1 ? true : false
                        }
                        onChange={(e) =>
                          handleChangeProds(
                            item.id,
                            "chewing_without_tobacco",
                            "site_of_placement_NA",
                            parseInt(e.target.value) /*  */
                          )
                        }
                        disabled={item.consumes !== 1}
                      />{" "}
                      n/a
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        {/* -------------------------------------------------------------- */}
        <div>
          {data.products
            .filter((x) => x.is_other_product)
            .map((item, index) => (
              <OtherProdWithTobacco
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
    </div>
  );
}
