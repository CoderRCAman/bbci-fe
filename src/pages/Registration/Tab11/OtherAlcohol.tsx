import { Button } from "primereact/button";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { TOBACCO_ALCOHOL_CONSUMPION } from "./data";

export default function OtherAlcohol({
  data,
  handleRemoveUi,
  handleChangeProds,
  addNewOtherUi,
}: {
  addNewOtherUi: any;
  data: TOBACCO_ALCOHOL_CONSUMPION;
  handleRemoveUi: any;
  handleChangeProds: (
    id: string,
    type: string,
    field: string,
    value: any
  ) => void;
}) {
  return (
    <div className="mt-5">
      <div className="border p-2 rounded space-y-1">
        <h1>Other</h1>

        <div className="flex gap-2">
          <p> Specify</p>
          <input
            type="text"
            className="border-b-2 focus:outline-none focus:border-slate-500 w-[60%]"
            value={data.product}
          />
        </div>
        <div className="space-y-5 pt-4">
          <div>
            <FloatLabel>
              <InputText
                keyfilter="int"
                className="border-1 p-2"
                value={data?.from_age?.toString()}
                onChange={(e) =>
                  handleChangeProds(
                    data.id,
                    "alcohol",
                    "from_age",
                    isNaN(parseInt(e.target.value))
                      ? 0
                      : parseInt(e.target.value)
                  )
                }
              />
              <label>From age</label>
            </FloatLabel>
          </div>
          <div>
            <FloatLabel>
              <InputText
                keyfilter="int"
                className="border-1 p-2"
                value={data?.to_age?.toString()}
              />
              <label>To age</label>
            </FloatLabel>
          </div>
          <div>
            <FloatLabel>
              <InputText
                keyfilter="int"
                className="border-1 p-2"
                value={data?.number_per_day?.toString()}
                onChange={(e) =>
                  handleChangeProds(
                    data.id,
                    "alcohol",
                    "number_per_day",
                    isNaN(parseInt(e.target.value))
                      ? 0
                      : parseInt(e.target.value)
                  )
                }
              />
              <label>Number per day</label>
            </FloatLabel>
          </div>
          <div>
            <FloatLabel>
              <InputText
                keyfilter="int"
                className="border-1 p-2"
                value={data?.days_in_week?.toString()}
                onChange={(e) =>
                  handleChangeProds(
                    data.id,
                    "alcohol",
                    "days_in_week",
                    isNaN(parseInt(e.target.value))
                      ? 0
                      : parseInt(e.target.value)
                  )
                }
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
                  value={data?.duration_placement_hr?.toString()}
                  onChange={(e) =>
                    handleChangeProds(
                      data.id,
                      "alcohol",
                      "duration_placement_hr",
                      isNaN(parseInt(e.target.value))
                        ? 0
                        : parseInt(e.target.value)
                    )
                  }
                />
              </div>
              <div>:</div>
              <div>
                <InputText
                  className="border  w-[30px] text-center"
                  keyfilter={"int"}
                  value={data?.duration_placement_min?.toString()}
                  onChange={(e) =>
                    handleChangeProds(
                      data.id,
                      "alcohol",
                      "duration_placement_min",
                      isNaN(parseInt(e.target.value))
                        ? 0
                        : parseInt(e.target.value)
                    )
                  }
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
                  checked={data?.site_of_placement_L === 1}
                  onChange={(e) =>
                    handleChangeProds(
                      data.id,
                      "alcohol",
                      "site_of_placement_L",
                      e.target.value
                    )
                  }
                />{" "}
                L
              </div>

              <div>
                <input
                  type="checkbox"
                  name=""
                  id=""
                  value={1}
                  checked={data?.site_of_placement_R === 1}
                  onChange={(e) =>
                    handleChangeProds(
                      data.id,
                      "alcohol",
                      "site_of_placement_R",
                      e.target.value
                    )
                  }
                />{" "}
                R
              </div>
              <div>
                <input
                  type="checkbox"
                  name=""
                  id=""
                  value={1}
                  checked={data?.site_of_placement_F === 1}
                  onChange={(e) =>
                    handleChangeProds(
                      data.id,
                      "alcohol",
                      "site_of_placement_F",
                      e.target.value
                    )
                  }
                />{" "}
                F
              </div>
              <div>
                <input
                  type="checkbox"
                  name=""
                  id=""
                  value={1}
                  checked={data?.site_of_placement_NA === 1}
                  onChange={(e) =>
                    handleChangeProds(
                      data.id,
                      "alcohol",
                      "site_of_placement_NA",
                      e.target.value
                    )
                  }
                />{" "}
                n/a
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 flex gap-2 justify-end">
          <Button
            label="Add Product below"
            className="rounded px-10 py-2"
            onClick={() => addNewOtherUi(data.type)}
          />
          <Button
            onClick={() => handleRemoveUi(data.id , data.type)}
            label="REMOVE"
            className="rounded px-10 py-2"
            severity="danger"
          />
        </div>
      </div>
    </div>
  );
}
