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
    <div className="border rounded-md p-2 shadow">
      <div className="space-y-7">
        <h1 className="font-semibold text-slate-500 text-lg">{condition}</h1>
        <div className="flex gap-4 items-center  text-md">
          <div className="space-x-2">
            <input
              type="radio"
              name="condition_status"
              value={1}
              checked={data?.["diagnosed"] === 1 ? true : false}
              onChange={(e) =>
                updateStateData(data.id, "diagnosed", parseInt(e.target.value))
              }
            />
            <span>YES </span>
          </div>
          <div className="space-x-2">
            <input
              type="radio"
              name="condition_status"
              value={2}
              checked={data?.["diagnosed"] === 2 ? true : false}
              onChange={(e) =>
                updateStateData(data.id, "diagnosed", parseInt(e.target.value))
              }
            />
            <span>NO </span>
          </div>
          <div className="space-x-2">
            <input
              type="radio"
              name="condition_status"
              value={8}
              checked={data?.["diagnosed"] === 8 ? true : false}
              onChange={(e) =>
                updateStateData(data.id, "diagnosed", parseInt(e.target.value))
              }
            />
            <span>DON'T KNOW </span>
          </div>
          <div className="space-x-2">
            <input
              type="radio"
              name="condition_status"
              value={9}
              checked={data?.["diagnosed"] === 9 ? true : false}
              onChange={(e) =>
                updateStateData(data.id, "diagnosed", parseInt(e.target.value))
              }
            />
            <span>REFUSED TO ANSWER</span>
          </div>
        </div>
        <div>
          <FloatLabel>
            <InputText
              disabled={data?.diagnosed !== 1}
              keyfilter="int"
              className="border-1 p-2"
            />
            <label>Age at first diagnosis</label>
          </FloatLabel>
        </div>
        <div>
          <FloatLabel>
            <InputText
              className="border-1 p-2"
              disabled={data?.diagnosed !== 1}
            />
            <label>Year of first diagnosis</label>
          </FloatLabel>
        </div>
        <div>
          <Dropdown
            disabled={data?.diagnosed !== 1}
            optionLabel="name"
            optionValue="value"
            className="border-1"
            placeholder="Treatment Received"
            options={[
              { name: "YES", value: "1" },
              { name: "NO", value: "2" },
              { name: "DON'T KNOW", value: "8" },
              { name: "REFUSED TO ANSWER", value: "8" },
            ]}
          />
        </div>
        <div>
          <h1 className="font-semibold text-slate-500">Mode of treatment</h1>

          <div className="p-2 space-y-2">
            {mode_of_treatment.map((d) => (
              <div className="flex gap-2">
                <input
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
          <h1 className="font-semibold text-slate-500">Mode of diagnosis</h1>
          <div className="p-2 space-y-2">
            {mode_of_diagnosis.map((d) => (
              <div className="flex gap-2">
                <input
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
            <div className="flex gap-5">
              <p>Other specify</p>
              <input
                type="text"
                className="border-b-2 focus:outline-none focus:border-slate-500 w-[60%]"
                onChange={(e) =>{
                    updateStateData(data.id, "mod_other", e.target.value);
                }}
              />
            </div>
            <div className="flex gap-2">
              <input type="checkbox" value={"Don't know"} />
              <p>Don't know</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
