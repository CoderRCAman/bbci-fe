import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { initialState, TOBACCO_ALCOHOL_CONSUMPION } from "./data";
const test = [
  {
    product: "Manufactured Cigarette",
  },
  {
    product: "Bidi (Manufactured/Roll your own)",
  },
];
export default function SmokingTobacco({
  data,
  handleChangeMaster,
  handleChangeProds,
}: {
  data: initialState;
  handleChangeMaster: (id: string, field: string, value: any) => void;
  handleChangeProds: (
    id: string,
    type: string,
    field: string,
    value: any
  ) => void;
}) {
  return (
    <div className="space-y-2 border p-3 shadow rounded">
      <h1 className="text-slate-600 font-semibold">Smoking Tobacco</h1>
      <div className="text-slate-600 ">
        <p className="">Have you ever smoked regularly? </p>
        <div className="flex gap-5">
          <div className="space-x-2">
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
            />
            <span>YES</span>
          </div>
          <div className="space-x-2">
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
            />
            <span>NO</span>
          </div>
          <div className="space-x-2">
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
            />
            <span>DON'T KNOW</span>
          </div>
          <div className="space-x-2">
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
            />
            <span>Refused to answer</span>
          </div>
        </div>
        <div className="mt-2 space-y-2">
          {data?.products
            .filter((x) => x.is_other_product !== 1)
            .map((item, index) => (
              <div key={index} className="border p-2 rounded space-y-1">
                <h1>{item.product}</h1>
                <div className="flex gap-2">
                  <div className="space-x-2">
                    <input
                      value={1}
                      type="radio"
                      checked={item.consumes === 1}
                      onChange={(e) =>
                        handleChangeProds(
                          item.id,
                          item.type || "",
                          "consumes",
                          parseInt(e.target.value)
                        )
                      }
                    />
                    <span>YES</span>
                  </div>
                  <div className="space-x-2">
                    <input
                      value={2}
                      type="radio"
                      checked={item.consumes === 2}
                      onChange={(e) =>
                        handleChangeProds(
                          item.id,
                          item.type || "",
                          "consumes",
                          parseInt(e.target.value)
                        )
                      }
                    />
                    <span>NO</span>
                  </div>
                </div>
                <div className="space-y-7 pt-10">
                  <div>
                    <FloatLabel>
                      <InputText
                        keyfilter="int"
                        className="border-1 p-2"
                        value={item.from_age?.toString()}
                        onChange={(e) =>
                          handleChangeProds(
                            item.id,
                            item.type || "",
                            "from_age",
                            e.target.value ? parseInt(e.target.value) : ""
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
                        value={item.to_age?.toString()}
                        onChange={(e) =>
                          handleChangeProds(
                            item.id,
                            item.type || "",
                            "to_age",
                            e.target.value ? parseInt(e.target.value) : ""
                          )
                        }
                      />
                      <label>To age</label>
                    </FloatLabel>
                  </div>
                  <div>
                    <FloatLabel>
                      <InputText
                        keyfilter="int"
                        className="border-1 p-2"
                        value={item.number_per_day?.toString()}
                        onChange={(e) =>
                          handleChangeProds(
                            item.id,
                            item.type || "",
                            "number_per_day",
                            e.target.value ? parseInt(e.target.value) : ""
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
                        value={item.days_in_week?.toString()}
                        onChange={(e) =>
                          handleChangeProds(
                            item.id,
                            item.type || "",
                            "days_in_week",
                            e.target.value ? parseInt(e.target.value) : ""
                          )
                        }
                      />
                      <label>Days in a week</label>
                    </FloatLabel>
                  </div>
                </div>
              </div>
            ))}

          {/* -------------------------------------------------------------- */}
          {data?.products
            .filter((p) => p.is_other_product === 1)
            .map((p) => (
              <div className="border p-2 rounded space-y-7">
                <h1>Other</h1>

                <div className="flex gap-2">
                  <p> Specify</p>
                  <input
                    type="text"
                    className="border-b-2 focus:outline-none focus:border-slate-500 w-[60%]"
                    value={p?.product}
                    onChange={(e) =>
                      handleChangeProds(
                        p.id,
                        p.type || "",
                        "product",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="space-y-5 pt-4">
                  <div>
                    <FloatLabel>
                      <InputText
                        keyfilter="int"
                        className="border-1 p-2"
                        value={p.from_age?.toString()}
                        onChange={(e) =>
                          handleChangeProds(
                            p.id,
                            p.type || "",
                            "from_age",
                            e.target.value ? parseInt(e.target.value) : ""
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
                        value={p.to_age?.toString()}
                        onChange={(e) =>
                          handleChangeProds(
                            p.id,
                            p.type || "",
                            "to_age",
                            e.target.value ? parseInt(e.target.value) : ""
                          )
                        }
                      />
                      <label>To age</label>
                    </FloatLabel>
                  </div>
                  <div>
                    <FloatLabel>
                      <InputText
                        keyfilter="int"
                        className="border-1 p-2"
                        value={p.number_per_day?.toString()}
                        onChange={(e) =>
                          handleChangeProds(
                            p.id,
                            p.type || "",
                            "number_per_day",
                            e.target.value ? parseInt(e.target.value) : ""
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
                        value={p.days_in_week?.toString()}
                        onChange={(e) =>
                          handleChangeProds(
                            p.id,
                            p.type || "",
                            "days_in_week",
                            e.target.value ? parseInt(e.target.value) : ""
                          )
                        }
                      />
                      <label>Days in a week</label>
                    </FloatLabel>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
