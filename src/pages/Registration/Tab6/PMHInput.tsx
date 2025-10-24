import { Dropdown } from "primereact/dropdown";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { PERSONAL_MEDICAL_HISTORY_DB } from "./Tab6";
import { useEffect, useState } from "react";
export default function PMHInput({
  condition,
  mode_of_treatment,
  mode_of_diagnosis,
  data,
  updateStateData,
}: {
  condition: string;
  mode_of_treatment: string[];
  mode_of_diagnosis: string[];
  data: PERSONAL_MEDICAL_HISTORY_DB;
  updateStateData: (id: string, field: string, value: any) => void;
}) {
  console.log(data);

  return (
    <div className="border relative   rounded-md p-2 shadow">
      <div className="sticky -top-4 border !border-t-0 !border-l-0 !border-r-0  py-2 rounded  bg-[#fff] " style={{ zIndex: 1000 }}>
        <h1 className="font-semibold text-slate-500 text-center  text-xl ">{condition}</h1>
      </div>
      <div className="space-y-7 mt-7 ">
        <div className="flex gap-4 items-center  text-md">
          <div className="space-x-2">
            <input
              type="radio"
              value={1}
              checked={data?.["diagnosed"] === 1}
              onChange={(e) =>
                updateStateData(data.id, "diagnosed", parseInt(e.target.value))
              }
            />
            <span>YES </span>
          </div>
          <div className="space-x-2">
            <input
              type="radio"
              value={2}
              checked={data?.["diagnosed"] === 2}
              onChange={(e) =>
                updateStateData(data.id, "diagnosed", parseInt(e.target.value))
              }
            />
            <span>NO </span>
          </div>
          <div className="space-x-2">
            <input
              type="radio"
              value={8}
              checked={data?.["diagnosed"] === 8}
              onChange={(e) =>
                updateStateData(data.id, "diagnosed", parseInt(e.target.value))
              }
            />
            <span>DON'T KNOW </span>
          </div>
          <div className="space-x-2">
            <input
              type="radio"
              value={9}
              checked={data?.["diagnosed"] === 9}
              onChange={(e) =>
                updateStateData(data.id, "diagnosed", parseInt(e.target.value))
              }
            />
            <span>REFUSED TO ANSWER</span>
          </div>
        </div>
        <div className="relative z-0">
          <FloatLabel>
            <InputText
              disabled={data?.diagnosed !== 1}
              keyfilter="int"
              value={data?.age_first_diagnosis?.toString() || ""}
              className="border-1 p-2"
              onChange={(e) =>
                updateStateData(
                  data.id,
                  "age_first_diagnosis",
                  parseInt(e.target.value) || 0
                )
              }
            />
            <label>Age at first diagnosis</label>
          </FloatLabel>
        </div>
        <div>
          <FloatLabel>
            <InputText
              value={data?.year_of_first_diagnosis}
              className="border-1 p-2 z-[]"
              disabled={data?.diagnosed !== 1}
              onChange={(e) =>
                updateStateData(
                  data.id,
                  "year_of_first_diagnosis",
                  parseInt(e.target.value)
                )
              }
            />
            <label>Year of first diagnosis</label>
          </FloatLabel>
        </div>
        <div>
          <p className=" text-slate-500 font-semibold">Treatment received</p>
          <Dropdown
            disabled={data?.diagnosed !== 1}
            value={data?.treatment_received}
            optionLabel="name"
            optionValue="value"
            className="border-1"
            placeholder="Select Treatment Received"
            options={[
              { name: "YES", value: 1 },
              { name: "NO", value: 2 },
              { name: "DON'T KNOW", value: 8 },
              { name: "REFUSED TO ANSWER", value: 8 },
            ]}
            onChange={(e) =>
              updateStateData(data.id, "treatment_received", parseInt(e.value))
            }
          />
        </div>
        <div>
          <p className=" text-slate-500 font-semibold">Mode of treatment</p>

          <div className="p-2 space-y-2">
            {mode_of_treatment.map((d) => (
              <div className="flex gap-2">
                <input
                  disabled={
                    data?.diagnosed !== 1 || data?.treatment_received !== 1
                  }
                  type="checkbox"
                  name="mot"
                  value={d}
                  checked={data?.mode_of_treatment?.split("|").includes(d)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const newModes = data?.mode_of_treatment
                        ? data.mode_of_treatment.split("|")
                        : [];
                      newModes.push(d);
                      updateStateData(
                        data.id,
                        "mode_of_treatment",
                        newModes.join("|")
                      );
                    } else {
                      const newModes = data?.mode_of_treatment
                        ? data.mode_of_treatment.split("|")
                        : [];
                      const filteredModes = newModes.filter((m) => m !== d);
                      updateStateData(
                        data.id,
                        "mode_of_treatment",
                        filteredModes.join("|")
                      );
                    }
                  }}
                />
                <p>{d}</p>
              </div>
            ))}
            <div className="flex gap-2"></div>
          </div>
        </div>
        <div>
          <p className=" text-slate-500 font-semibold">Mode of diagnosis</p>
          <div className="p-2 space-y-2">
            {mode_of_diagnosis.map((d) => (
              <div className="flex gap-2">
                <input
                  disabled={
                    data?.diagnosed !== 1 || data?.treatment_received !== 1
                  }
                  type="checkbox"
                  value={d}
                  checked={data?.mode_of_diagnosis?.split("|").includes(d)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const newModes = data?.mode_of_diagnosis
                        ? data.mode_of_diagnosis.split("|")
                        : [];
                      newModes.push(d);
                      updateStateData(
                        data.id,
                        "mode_of_diagnosis",
                        newModes.join("|")
                      );
                    } else {
                      const newModes = data?.mode_of_diagnosis
                        ? data.mode_of_diagnosis.split("|")
                        : [];
                      const filteredModes = newModes.filter((m) => m !== d);
                      updateStateData(
                        data.id,
                        "mode_of_diagnosis",
                        filteredModes.join("|")
                      );
                    }
                  }}
                />
                <p>{d}</p>
              </div>
            ))}
            <div className="flex gap-5 items-center">
              <p>Other specify</p>
              <input
                disabled={
                  data?.diagnosed !== 1 || data?.treatment_received !== 1
                }
                type="text"
                className="border-0 rounded-none border-b-2 border-gray-300 h-10 focus:outline-none focus:border-b-slate-500 w-[60%]"
                onChange={(e) => {
                  updateStateData(data.id, "mod_other", e.target.value);
                }}
              />
            </div>
            <div className="flex gap-2">
              <input
                disabled={
                  data?.diagnosed !== 1 || data?.treatment_received !== 1
                }
                type="checkbox"
                value={"Don't know"}
              />
              <p>Don't know</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
