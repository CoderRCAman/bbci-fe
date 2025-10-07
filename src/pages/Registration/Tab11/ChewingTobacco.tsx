import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import OtherProdWithTobacco from "./OtherProdWithTobacco";
import ShortUUID from "short-uuid";
import { initialState, TOBACCO_ALCOHOL_CONSUMPION } from "./data";
const test = [
  {
    product: "Tobacco Only",
  },
  {
    product: "Tobacco with Lime(Khaini)",
  },
  {
    product: "Betel quid (pan) with tobacco",
  },
];
export default function ChewingTobacco({
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
  const [otherProd, setOtherProd] = useState<TOBACCO_ALCOHOL_CONSUMPION[]>([]);
  useEffect(() => {
    if (otherProd.length === 0) addNewOtherUi();
  }, []);
  const addNewOtherUi = () => {
    console.log("hello");
    const translator = ShortUUID();
    let newProd: TOBACCO_ALCOHOL_CONSUMPION = {
      type: "chewing_tobacco",
      user_id: "test_id",
      id: translator.new(),
    };
    setOtherProd((d) => [...d, newProd]);
  };
  const handleRemoveUi = (id: string) => {
    if (otherProd.length === 1) return;
    setOtherProd((d) => d.filter((x) => x.id !== id));
  };
  return (
    <div className="p-3 border mt-5 shadow space-y-2">
      <h1 className="font-semibold text-slate-600">Chewing Tobacco</h1>
      <div className="text-slate-600">
        <p className="">Have you ever chewed with tobacco regularly? </p>
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
        {data.products.map((item, index) => (
          <div key={index} className="border p-2 rounded space-y-1">
            <h1>{item.product}</h1>
            <div className="flex gap-2">
              <div>
                <input
                  type="radio"
                  value={1}
                  checked={item.consumes === 1}
                  onChange={(e) =>
                    handleChangeProds(
                      item.id,
                      item.type || "",
                      "consumes",
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
                  checked={item.consumes === 2}
                  onChange={(e) =>
                    handleChangeProds(
                      item.id,
                      item.type || "",
                      "consumes",
                      parseInt(e.target.value)
                    )
                  }
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
                  <InputText keyfilter="int" className="border-1 p-2" />
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
                      value={item.duration_placement_hr?.toString()}
                      onChange={(e) =>
                        handleChangeProds(
                          item.id,
                          item.type || "",
                          "duration_placement_hr",
                          e.target.value ? parseInt(e.target.value) : ""
                        )
                      }
                    />
                  </div>
                  <div>:</div>
                  <div>
                    <InputText
                      className="border  w-[30px] text-center"
                      keyfilter={"int"}
                      value={item.duration_placement_min?.toString()}
                      onChange={(e) =>
                        handleChangeProds(
                          item.id,
                          item.type || "",
                          "duration_placement_min",
                          e.target.value ? parseInt(e.target.value) : ""
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
                      checked={item.site_of_placement_L === 1}
                      value={1}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleChangeProds(
                            item.id,
                            item.type || "",
                            "site_of_placement_L",
                            1
                          );
                        } else {
                          handleChangeProds(
                            item.id,
                            item.type || "",
                            "site_of_placement_L",
                            0
                          );
                        }
                      }}
                    />{" "}
                    L
                  </div>

                  <div>
                    <input
                      type="checkbox"
                      name=""
                      id=""
                      checked={item.site_of_placement_R === 1}
                      value={1}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleChangeProds(
                            item.id,
                            item.type || "",
                            "site_of_placement_R",
                            1
                          );
                        } else {
                          handleChangeProds(
                            item.id,
                            item.type || "",
                            "site_of_placement_R",
                            0
                          );
                        }
                      }}
                    />{" "}
                    R
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      name=""
                      id=""
                      checked={item.site_of_placement_F === 1}
                      value={1}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleChangeProds(
                            item.id,
                            item.type || "",
                            "site_of_placement_F",
                            1
                          );
                        } else {
                          handleChangeProds(
                            item.id,
                            item.type || "",
                            "site_of_placement_F",
                            0
                          );
                        }
                      }}
                    />{" "}
                    F
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      name=""
                      id=""
                      checked={item.site_of_placement_NA === 1}
                      value={1}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleChangeProds(
                            item.id,
                            item.type || "",
                            "site_of_placement_NA",
                            1
                          );
                        } else {
                          handleChangeProds(
                            item.id,
                            item.type || "",
                            "site_of_placement_NA",
                            0
                          );
                        }
                      }}
                    />{" "}
                    n/a
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* ----------------------------------------------------- */}
      <div>
        {otherProd.map((item, index) => (
          <OtherProdWithTobacco
            key={index}
            data={item}
            handleRemoveUi={handleRemoveUi}
            setOtherProd={setOtherProd}
            addNewOtherUi={addNewOtherUi}
            handleChangeProds={handleChangeProds}
          />
        ))}
      </div>
    </div>
  );
}
